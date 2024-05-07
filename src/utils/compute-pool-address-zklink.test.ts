import { FeeAmount } from '../constants/misc';
import { computePoolAddressZkLink } from './compute-pool-address-zklink';
import { zkLinkTokens } from '@real-wagmi/sdk';

describe('#computePoolAddressZkLink', () => {
    it('should correctly compute the pool address', () => {
        const result = computePoolAddressZkLink({
            fee: FeeAmount.LOW,
            tokenA: zkLinkTokens.weth,
            tokenB: zkLinkTokens.usdt,
        });
        expect(result).toEqual('0x36fAe295F19C47B79CBa5497803b55D99cBAfeaB');
    });

    it('should correctly compute the pool address', () => {
        const resultA = computePoolAddressZkLink({
            fee: FeeAmount.LOW,
            tokenA: zkLinkTokens.weth,
            tokenB: zkLinkTokens.usdt,
        });
        const resultB = computePoolAddressZkLink({
            fee: FeeAmount.LOW,
            tokenA: zkLinkTokens.usdt,
            tokenB: zkLinkTokens.weth,
        });
        expect(resultA).toEqual(resultB);
    });
});
