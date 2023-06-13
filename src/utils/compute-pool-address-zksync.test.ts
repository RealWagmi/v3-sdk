import { FeeAmount } from '../constants/misc';
import { computePoolAddressZkSync } from './compute-pool-address-zksync';
import { zkSyncTokens } from '@real-wagmi/sdk';

describe('#computePoolAddressZkSync', () => {
    it('should correctly compute the pool address', () => {
        const result = computePoolAddressZkSync({
            fee: FeeAmount.LOW,
            tokenA: zkSyncTokens.weth,
            tokenB: zkSyncTokens.usdc,
        });
        expect(result).toEqual('0x668038485eABfAaeDc226AdC1F9cC4348a872711');
    });

    it('should correctly compute the pool address', () => {
        const resultA = computePoolAddressZkSync({
            fee: FeeAmount.LOW,
            tokenA: zkSyncTokens.weth,
            tokenB: zkSyncTokens.usdc,
        });
        const resultB = computePoolAddressZkSync({
            fee: FeeAmount.LOW,
            tokenA: zkSyncTokens.usdc,
            tokenB: zkSyncTokens.weth,
        });
        expect(resultA).toEqual(resultB);
    });
});
