import { Currency, ChainId } from '@real-wagmi/sdk';
import { FeeAmount } from '../constants/misc';
import { V3_CORE_FACTORY_ADDRESSES as DEFAULT_V3_CORE_FACTORY_ADDRESSES } from '../constants/addresses';
import { keccak256, encodeAbiParameters, parseAbiParameters, concat, pad, getAddress, Address, Hash } from 'viem';

const DEFAULT_POOL_INIT_CODE_HASH = '0x0100133fbbcc76118ded62eff4d449702d57ec281d23a1ca9d40cf3b0de80644';
const CREATE2_PREFIX = '0x2020dba91b30cc0006188af794c2fb30dd8520db7e2c088b7fc7c103c00ca494';
const ZERO_INPUT_HASH = '0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470';

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
export function computePoolAddressZkSync({ tokenA, tokenB, fee, POOL_INIT_CODE_HASH, V3_CORE_FACTORY_ADDRESSES }: Props): Address {
    const [token0, token1] = tokenA.wrapped.sortsBefore(tokenB.wrapped) ? [tokenA, tokenB] : [tokenB, tokenA]; // does safety checks
    const salt = keccak256(encodeAbiParameters(parseAbiParameters('address, address, uint24'), [token0.wrapped.address, token1.wrapped.address, fee]));
    const factoryAddress = V3_CORE_FACTORY_ADDRESSES ?? DEFAULT_V3_CORE_FACTORY_ADDRESSES[ChainId.ZKSYNC]!;
    const codeHash = POOL_INIT_CODE_HASH ?? DEFAULT_POOL_INIT_CODE_HASH;
    const addressBytes = keccak256(concat([CREATE2_PREFIX, pad(factoryAddress, { size: 32 }), salt, codeHash, ZERO_INPUT_HASH])).slice(26);
    return getAddress(`0x${addressBytes}`);
}
