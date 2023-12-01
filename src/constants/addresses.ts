import { ChainId } from '@real-wagmi/sdk';

export type ChainMap<T> = {
    readonly [chainId in ChainId]: T
}

export const V3_CORE_FACTORY_ADDRESSES: ChainMap<string> = {
    [ChainId.FANTOM]: '0xaf20f5f19698f1D19351028cd7103B63D30DE7d7',
    [ChainId.ZKSYNC]: '0x31be61CE896e8770B21e7A1CAFA28402Dd701995',
    [ChainId.KAVA]: '0x0e0Ce4D450c705F8a0B6Dd9d5123e3df2787D16B',
    [ChainId.ETHEREUM]: '0xB9a14EE1cd3417f3AcC988F61650895151abde24',
    [ChainId.OPTIMISM]: '0xC49c177736107fD8351ed6564136B9ADbE5B1eC3',
    [ChainId.BSC]: '',
    [ChainId.POLYGON]: '',
    [ChainId.AVALANCHE]: '',
    [ChainId.ARBITRUM]: ''
};