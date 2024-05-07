import { ChainId } from '@real-wagmi/sdk';
import { Address } from 'viem';

export const V3_CORE_FACTORY_ADDRESSES = {
    [ChainId.FANTOM]: '0xaf20f5f19698f1D19351028cd7103B63D30DE7d7',
    [ChainId.ZKSYNC]: '0x31be61CE896e8770B21e7A1CAFA28402Dd701995',
    [ChainId.KAVA]: '0x0e0Ce4D450c705F8a0B6Dd9d5123e3df2787D16B',
    [ChainId.ETHEREUM]: '0xB9a14EE1cd3417f3AcC988F61650895151abde24',
    [ChainId.OPTIMISM]: '0xC49c177736107fD8351ed6564136B9ADbE5B1eC3',
    [ChainId.BSC]: '' as Address,
    [ChainId.POLYGON]: '' as Address,
    [ChainId.AVALANCHE]: '' as Address,
    [ChainId.ARBITRUM]: '' as Address,
    [ChainId.METIS]: '0x8112E18a34b63964388a3B2984037d6a2EFE5B8A',
    [ChainId.BLAST]: '' as Address,
    [ChainId.BASE]: '' as Address,
    [ChainId.METIS_SEPOLIA]: '0x92CC36D66e9d739D50673d1f27929a371FB83a67',
    [ChainId.ZKLINK]: '0x6175b648473F1d4c1549aAC3c2d007e7720585e6'
} satisfies Record<ChainId, Address>;