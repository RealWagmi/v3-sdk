import { Currency, ChainId } from '@real-wagmi/sdk';
import { FeeAmount } from '../constants/misc';
import { V3_CORE_FACTORY_ADDRESSES as DEFAULT_V3_CORE_FACTORY_ADDRESSES } from '../constants/addresses';
import { keccak256, encodeAbiParameters, parseAbiParameters, Address, GetCreate2AddressOptions, toBytes, getAddress, pad, isBytes, Hex, ByteArray, slice, concat, Hash } from 'viem';
import { computePoolAddressZkSync } from './compute-pool-address-zksync';
import { computePoolAddressZkLink } from './compute-pool-address-zklink';
import invariant from 'tiny-invariant';

const DEFAULT_POOL_INIT_CODE_HASH = '0x30146866f3a846fe3c636beb2756dbd24cf321bc52c9113c837c21f47470dfeb';

interface Props {
    tokenA: Currency;
    tokenB: Currency;
    fee: FeeAmount;
    POOL_INIT_CODE_HASH?: Hash;
    V3_CORE_FACTORY_ADDRESSES?: Address;
}

function getCreate2Address(from_: GetCreate2AddressOptions['from'], salt_: GetCreate2AddressOptions['salt'], initCodeHash: Hash) {
    const from = toBytes(getAddress(from_));
    const salt = pad(isBytes(salt_) ? salt_ : toBytes(salt_ as Hex), {
        size: 32,
    }) as ByteArray;

    return getAddress(slice(keccak256(concat([toBytes('0xff'), from, salt, toBytes(initCodeHash)])), 12));
}

export function computePoolAddress({ tokenA, tokenB, fee, POOL_INIT_CODE_HASH, V3_CORE_FACTORY_ADDRESSES }: Props): Address {
    invariant(tokenA.chainId === tokenB.chainId, 'ChainIds must be same');

    const chainId = tokenA.chainId as ChainId;

    if(chainId === ChainId.ZKLINK){
        return computePoolAddressZkLink({ tokenA, tokenB, fee, POOL_INIT_CODE_HASH, V3_CORE_FACTORY_ADDRESSES });
    }

    if(chainId === ChainId.ZKSYNC){
        return computePoolAddressZkSync({ tokenA, tokenB, fee, POOL_INIT_CODE_HASH, V3_CORE_FACTORY_ADDRESSES });
    }

    const [token0, token1] = tokenA.wrapped.sortsBefore(tokenB.wrapped) ? [tokenA, tokenB] : [tokenB, tokenA];
    const salt = keccak256(encodeAbiParameters(parseAbiParameters('address, address, uint24'), [token0.wrapped.address, token1.wrapped.address, fee]));
    const factoryAddress = V3_CORE_FACTORY_ADDRESSES ?? DEFAULT_V3_CORE_FACTORY_ADDRESSES[chainId]!;
    const codeHash = POOL_INIT_CODE_HASH ?? DEFAULT_POOL_INIT_CODE_HASH;
    return getCreate2Address(factoryAddress, salt, codeHash);
}
