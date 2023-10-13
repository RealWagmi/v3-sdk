import { ChainId } from '@real-wagmi/sdk';
import { Address } from 'viem';

type AddressMap = {
    [key in ChainId]?: Address;
};

export const V3_CORE_FACTORY_ADDRESSES: AddressMap = {
    [ChainId.FANTOM]: '0xaf20f5f19698f1D19351028cd7103B63D30DE7d7',
    [ChainId.ZKSYNC]: '0x31be61CE896e8770B21e7A1CAFA28402Dd701995',
    [ChainId.KAVA]: '0x0e0Ce4D450c705F8a0B6Dd9d5123e3df2787D16B'
};
