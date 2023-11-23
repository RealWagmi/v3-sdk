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

    it('should correctly compute the pool address (POOL_INIT_CODE_HASH, V3_CORE_FACTORY_ADDRESSES)', () => {
        const result = computePoolAddressZkSync({
            fee: FeeAmount.MEDIUM,
            tokenA: zkSyncTokens.weth,
            tokenB: zkSyncTokens.usdc,
            POOL_INIT_CODE_HASH: '0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54',
            V3_CORE_FACTORY_ADDRESSES: '0x1F98431c8aD98523631AE4a59f267346ea31F984'
        });
        expect(result).toEqual('0xf5e2c60cDdCAec0D31B8A9A45e2Ce1a411C252F5');
    });
});
