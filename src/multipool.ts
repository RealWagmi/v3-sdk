import { CurrencyAmount, Currency, BigintIsh, Token } from '@real-wagmi/sdk';
import { FeeAmount } from './constants';
import { computePoolAddress } from './utils';
import { Address } from 'viem'

export class Multipool {
    public readonly address: Address;

    public readonly liquidityToken: Currency;
    private readonly tokenAmounts: [CurrencyAmount<Currency>, CurrencyAmount<Currency>];
    private readonly fees: FeeAmount[];
    private readonly totalSupply: bigint;

    public constructor(address: Address, multipoolToken: Address, fees: FeeAmount[], totalSupply: BigintIsh, currencyAmountA: CurrencyAmount<Currency>, currencyAmountB: CurrencyAmount<Currency>) {
        this.address = address;
        const tokenAmounts = currencyAmountA.currency.wrapped.sortsBefore(currencyAmountB.currency.wrapped)
        ? [currencyAmountA, currencyAmountB]
        : [currencyAmountB, currencyAmountA]
        this.tokenAmounts = tokenAmounts as [CurrencyAmount<Currency>, CurrencyAmount<Currency>]
        this.liquidityToken = new Token(this.chainId, multipoolToken, 18, `${this.token0.symbol}/${this.token1.symbol} WLP`, `Wagmi LP ${this.token0.symbol}/${this.token1.symbol}`);
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
        return this.fees.map((fee) => computePoolAddress({ tokenA: this.token0, tokenB: this.token1, fee}));
    }

    public getWithdrawalAmounts(liquidityAmount: CurrencyAmount<Currency>): CurrencyAmount<Currency>[] {
        const amount0 = this.reserve0.multiply(liquidityAmount).divide(this.totalSupply);
        const amount1 = this.reserve1.multiply(liquidityAmount).divide(this.totalSupply);
        return [amount0, amount1];
    }
}
