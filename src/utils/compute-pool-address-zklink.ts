import { ChainId, Currency } from "@real-wagmi/sdk";
import { FeeAmount } from "../constants";
import { Address, Hash } from "viem";
import { computePoolAddressZkSync } from './compute-pool-address-zksync';
import { V3_CORE_FACTORY_ADDRESSES as DEFAULT_V3_CORE_FACTORY_ADDRESSES } from '../constants/addresses';

const DEFAULT_POOL_INIT_CODE_HASH = '0x01000a05075bdcb640cf6ad926bac62b628888f09fdb49a9c42d40c8179df8e9';

interface Props {
    tokenA: Currency;
    tokenB: Currency;
    fee: FeeAmount;
    POOL_INIT_CODE_HASH?: Hash;
    V3_CORE_FACTORY_ADDRESSES?: Address;
}

/**
 * Computes a pool address
 * @param tokenA The first token of the pair, irrespective of sort order
 * @param tokenB The second token of the pair, irrespective of sort order
 * @param fee The fee tier of the pool
 * @returns The pool address
 */
export function computePoolAddressZkLink({ tokenA, tokenB, fee, POOL_INIT_CODE_HASH, V3_CORE_FACTORY_ADDRESSES }: Props){
    return computePoolAddressZkSync({
        tokenA,
        tokenB, 
        fee,
        POOL_INIT_CODE_HASH: POOL_INIT_CODE_HASH ?? DEFAULT_POOL_INIT_CODE_HASH,
        V3_CORE_FACTORY_ADDRESSES: V3_CORE_FACTORY_ADDRESSES ?? DEFAULT_V3_CORE_FACTORY_ADDRESSES[ChainId.ZKLINK]!
    });
}