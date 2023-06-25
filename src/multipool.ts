import { CurrencyAmount, Currency, BigintIsh, Token } from '@real-wagmi/sdk';
import { FeeAmount } from './constants';
import { computePoolAddress } from './utils';
import invariant from 'tiny-invariant';
import { Address } from 'viem'

export class Multipool {
    public readonly address: Address;

    public readonly liquidityToken: Currency;
    private readonly tokenAmounts: [CurrencyAmount<Currency>, CurrencyAmount<Currency>];
    private readonly fees: FeeAmount[];
    private readonly totalSupply: bigint;

    public constructor(address: Address, fees: FeeAmount[], totalSupply: BigintIsh, currencyAmountA: CurrencyAmount<Currency>, currencyAmountB: CurrencyAmount<Currency>) {
        this.address = address;
        const tokenAmounts = currencyAmountA.currency.wrapped.sortsBefore(currencyAmountB.currency.wrapped)
        ? [currencyAmountA, currencyAmountB]
        : [currencyAmountB, currencyAmountA]
        this.tokenAmounts = tokenAmounts as [CurrencyAmount<Currency>, CurrencyAmount<Currency>]
        this.liquidityToken = new Token(this.chainId, address, 18, `${this.token0.symbol}/${this.token1.symbol} WLP`, `Wagmi LP ${this.token0.symbol}/${this.token1.symbol}`);
        this.fees = fees;
        this.totalSupply = BigInt(totalSupply);
    }

    public get chainId(): number {
        return this.token0.chainId
    }

    public get token0(): Currency {
        return this.tokenAmounts[0].currency
    }

    public get token1(): Currency {
        return this.tokenAmounts[1].currency
    }

    public get reserve0(): CurrencyAmount<Currency> {
        return this.tokenAmounts[0]
    }

    public get reserve1(): CurrencyAmount<Currency> {
        return this.tokenAmounts[1]
    }

    public get pools(): string[] {
        return this.fees.map((fee) => computePoolAddress({ chainId: this.chainId, tokenA: this.token0, tokenB: this.token1, fee}));
    }

    public getWithdrawalAmounts(liquidityAmount: CurrencyAmount<Currency>): CurrencyAmount<Currency>[] {
        const amount0 = this.reserve0.multiply(liquidityAmount).divide(this.totalSupply);
        const amount1 = this.reserve1.multiply(liquidityAmount).divide(this.totalSupply);
        return [amount0, amount1];
    }

    public getOutputAmount(currencyAmountA: CurrencyAmount<Currency>, currencyAmountB: CurrencyAmount<Currency>): CurrencyAmount<Currency>[]{
        const tokenAmounts = currencyAmountA.currency.wrapped.sortsBefore(currencyAmountB.currency.wrapped)
        ? [currencyAmountA, currencyAmountB]
        : [currencyAmountA, currencyAmountB]

        if(this.reserve0.equalTo(0) && this.reserve1.equalTo(0)){
            return tokenAmounts;
        }

        let [tokenAmount0, tokenAmount1] = tokenAmounts;
        const _reserve0 = this.reserve0.quotient;
        const _reserve1 = this.reserve1.quotient;

        if(tokenAmount0.equalTo(0)){
            const amount1 = tokenAmount1.quotient;
            const amount0 = this._quote(amount1, _reserve1, _reserve0).toString();
            tokenAmount0 = CurrencyAmount.fromRawAmount(tokenAmount0.currency, amount0);
        }

        const amount1Optimal = this._quote(tokenAmount0.quotient, _reserve0, _reserve1);

        if(amount1Optimal <= tokenAmount1.quotient || tokenAmount1.equalTo(0)){
            const newCurrencyAmount1 = CurrencyAmount.fromRawAmount(tokenAmount1.currency, amount1Optimal.toString());
            return [tokenAmount0, newCurrencyAmount1];
        } else {
            const amount0Optimal = this._quote(amount1Optimal, _reserve1, _reserve0);
            const newCurrencyAmount0 = CurrencyAmount.fromRawAmount(tokenAmount0.currency, amount0Optimal.toString());
            return [newCurrencyAmount0, tokenAmount1];
        }
    }

    public getLiquidityMinted(tokenAmountA: CurrencyAmount<Currency>, tokenAmountB: CurrencyAmount<Currency>): CurrencyAmount<Currency>{
        const tokenAmounts = tokenAmountA.currency.wrapped.sortsBefore(tokenAmountB.wrapped.currency) // does safety checks
        ? [tokenAmountA, tokenAmountB]
        : [tokenAmountB, tokenAmountA]
        invariant(tokenAmounts[0].currency.equals(this.token0) && tokenAmounts[1].currency.equals(this.token1), 'TOKEN');

        const _reserve0 = this.reserve0.quotient;
        const _reserve1 = this.reserve1.quotient;

        const amount0 = tokenAmounts[0].quotient;
        const amount1 = tokenAmounts[1].quotient;

        const l0 = amount0 * this.totalSupply / _reserve0;
        const l1 = amount1 * this.totalSupply /_reserve1;
        const liquidityAmount = l0 < l1 ? l0 : l1;
        return CurrencyAmount.fromRawAmount(this.liquidityToken, liquidityAmount.toString());
    }

    private _quote(inputAmount: bigint, reserveA: bigint, reserveB: bigint): bigint {
        invariant(inputAmount > 0, "INSUFFICIENT_AMOUNT");
        invariant(reserveA > 0 && reserveB > 0, "INSUFFICIENT_LIQUIDITY");
        return inputAmount * reserveB / reserveA;
    }
}
