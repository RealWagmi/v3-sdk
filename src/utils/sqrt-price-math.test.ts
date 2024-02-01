import { SqrtPriceMath } from './sqrt-price-math';
import { Percent, arbitrumTokens } from '@real-wagmi/sdk';
import { Pool } from '../entities';
import { FeeAmount } from '../constants';

describe('SqrtPriceMath', () => {
    describe('getSqrtPriceLimitX96', () => {
        const slippage = new Percent(50, 10_000);
        const sqrtPX96 = 3799394944630951859687147n;
        const liquidity = 2065935547048171538n;

        const tokenA = arbitrumTokens.weth;
        const tokenB = arbitrumTokens.usdt;

        const mockPool = new Pool(tokenA, tokenB, FeeAmount.LOW, sqrtPX96, liquidity, -198915);

        it('should return new sqrtPrice zeroForSaleToken = true', () => {
            const newSqrtPrice = SqrtPriceMath.getSqrtPriceLimitX96(sqrtPX96, tokenA.address, tokenB.address, slippage);
            const newPool = new Pool(tokenA, tokenB, FeeAmount.LOW, newSqrtPrice, liquidity, -198915);
            expect(newSqrtPrice).toEqual(3808881588473665049536484n);

            const currentTokenAPrice = newPool.priceOf(tokenA).asFraction.toSignificant(4);
            const newTokenAPrice = new Percent(1).add(slippage).multiply(mockPool.priceOf(tokenA).asFraction).asFraction.toSignificant(4);
            expect(currentTokenAPrice).toEqual(newTokenAPrice);

            const currentTokenBPrice = newPool.priceOf(tokenB).asFraction.toSignificant(4)
            const newTokenBPrice = new Percent(1).add(slippage).invert().multiply(mockPool.priceOf(tokenB).asFraction).asFraction.toSignificant(4);
            expect(currentTokenBPrice).toEqual(newTokenBPrice);
        });

        it('should return new sqrtPrice zeroForSaleToken = false', () => {
            const newSqrtPrice = SqrtPriceMath.getSqrtPriceLimitX96(sqrtPX96, tokenB.address, tokenA.address, slippage);
            const newPool = new Pool(tokenA, tokenB, FeeAmount.LOW, newSqrtPrice, liquidity, -198915);
            expect(newSqrtPrice).toEqual(3789884554384314960154043n);

            const currentTokenAPrice = newPool.priceOf(tokenA).asFraction.toSignificant(4);
            const newTokenAPrice = new Percent(1).add(slippage).invert().multiply(mockPool.priceOf(tokenA).asFraction).asFraction.toSignificant(4);
            expect(currentTokenAPrice).toEqual(newTokenAPrice);

            const currentTokenBPrice = newPool.priceOf(tokenB).asFraction.toSignificant(4)
            const newTokenBPrice = new Percent(1).add(slippage).multiply(mockPool.priceOf(tokenB).asFraction).asFraction.toSignificant(4);
            expect(currentTokenBPrice).toEqual(newTokenBPrice);
        });
    })
});