import { FeeAmount } from '../constants/misc';
import { computePoolAddress } from './compute-pool-address';
import { fantomTokens, zkSyncTokens, ChainId } from '@real-wagmi/sdk';

describe('#computePoolAddress', () => {
    it('should correctly compute the pool address', () => {
        const result = computePoolAddress({
            chainId: ChainId.FANTOM,
            fee: FeeAmount.LOW,
            tokenA: fantomTokens.usdc,
            tokenB: fantomTokens.usdt,
        });
        expect(result).toEqual('0xa3746B5c1a94C0c603b3CdA720adc3984Af27E7A');
    });

    it('should correctly compute the pool address', () => {
        const resultA = computePoolAddress({
            chainId: ChainId.FANTOM,
            fee: FeeAmount.LOW,
            tokenA: fantomTokens.usdc,
            tokenB: fantomTokens.usdt,
        });
        const resultB = computePoolAddress({
            chainId: ChainId.FANTOM,
            fee: FeeAmount.LOW,
            tokenA: fantomTokens.usdc,
            tokenB: fantomTokens.usdt,
        });
        expect(resultA).toEqual(resultB);
    });

    it('should correctly compute the pool address (zksync)', () => {
        const result = computePoolAddress({
            chainId: ChainId.ZKSYNC,
            fee: FeeAmount.LOW,
            tokenA: zkSyncTokens.weth,
            tokenB: zkSyncTokens.usdc,
        });
        expect(result).toEqual('0x668038485eABfAaeDc226AdC1F9cC4348a872711');
    });
});
