import { FeeAmount } from '../constants/misc';
import { computePoolAddress } from './compute-pool-address';
import { fantomTokens, zkSyncTokens, ethereumTokens, zkLinkTokens} from '@real-wagmi/sdk';

describe('#computePoolAddress', () => {
    it('should correctly compute the pool address', () => {
        const result = computePoolAddress({
            fee: FeeAmount.LOW,
            tokenA: fantomTokens.usdc,
            tokenB: fantomTokens.usdt,
        });
        expect(result).toEqual('0xa3746B5c1a94C0c603b3CdA720adc3984Af27E7A');
    });

    it('should correctly compute the pool address', () => {
        const resultA = computePoolAddress({
            fee: FeeAmount.LOW,
            tokenA: fantomTokens.usdc,
            tokenB: fantomTokens.usdt,
        });
        const resultB = computePoolAddress({
            fee: FeeAmount.LOW,
            tokenA: fantomTokens.usdc,
            tokenB: fantomTokens.usdt,
        });
        expect(resultA).toEqual(resultB);
    });

    it('should correctly compute the pool address (zksync)', () => {
        const result = computePoolAddress({
            fee: FeeAmount.LOW,
            tokenA: zkSyncTokens.weth,
            tokenB: zkSyncTokens.usdc,
        });
        expect(result).toEqual('0x668038485eABfAaeDc226AdC1F9cC4348a872711');
    });

    it('should correctly compute the pool address (zklink)', () => {
        const result = computePoolAddress({
            fee: FeeAmount.LOW,
            tokenA: zkLinkTokens.weth,
            tokenB: zkLinkTokens.usdt,
        });
        expect(result).toEqual('0x36fAe295F19C47B79CBa5497803b55D99cBAfeaB');
    });

    it('should correctly compute the pool address (POOL_INIT_CODE_HASH, V3_CORE_FACTORY_ADDRESSES)', () => {
        const result = computePoolAddress({
            fee: FeeAmount.MEDIUM,
            tokenA: ethereumTokens.weth,
            tokenB: ethereumTokens.usdt,
            POOL_INIT_CODE_HASH: '0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54',
            V3_CORE_FACTORY_ADDRESSES: '0x1F98431c8aD98523631AE4a59f267346ea31F984'
        });
        expect(result).toEqual('0x4e68Ccd3E89f51C3074ca5072bbAC773960dFa36');
    });

    it('should chack chains', () => {
        expect(() => computePoolAddress({
            fee: FeeAmount.LOW,
            tokenA: zkLinkTokens.weth,
            tokenB: ethereumTokens.usdt,
        })).toThrowError("Invariant failed: ChainIds must be same");
    });
});
