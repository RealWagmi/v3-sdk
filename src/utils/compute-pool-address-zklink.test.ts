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
        expect(result).toEqual('0x307Fe297046cDbbd9B1De285e3a4Ad9fa702e951');
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
