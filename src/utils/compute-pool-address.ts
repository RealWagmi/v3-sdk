import { Currency, ChainId } from '@real-wagmi/sdk';
import { FeeAmount } from '../constants/misc';
import { V3_CORE_FACTORY_ADDRESSES } from '../constants/addresses';
import { keccak256, encodeAbiParameters, parseAbiParameters, Address, GetCreate2AddressOptions, toBytes, getAddress, pad, isBytes, Hex, ByteArray, slice, concat } from 'viem';

import { computePoolAddressZkSync } from './compute-pool-address-zksync';

const POOL_INIT_CODE_HASH = '0x30146866f3a846fe3c636beb2756dbd24cf321bc52c9113c837c21f47470dfeb';

interface Props {
    chainId: ChainId;
    tokenA: Currency;
    tokenB: Currency;
    fee: FeeAmount;
}

function getCreate2Address(from_: GetCreate2AddressOptions['from'], salt_: GetCreate2AddressOptions['salt'], initCodeHash: Hex) {
    const from = toBytes(getAddress(from_));
    const salt = pad(isBytes(salt_) ? salt_ : toBytes(salt_ as Hex), {
        size: 32,
    }) as ByteArray;

    return getAddress(slice(keccak256(concat([toBytes('0xff'), from, salt, toBytes(initCodeHash)])), 12));
}

export function computePoolAddress({ chainId, tokenA, tokenB, fee }: Props): Address {
    if (chainId !== ChainId.ZK_SYNC) {
        const [token0, token1] = tokenA.wrapped.sortsBefore(tokenB.wrapped) ? [tokenA, tokenB] : [tokenB, tokenA];
        const salt = keccak256(encodeAbiParameters(parseAbiParameters('address, address, uint24'), [token0.wrapped.address, token1.wrapped.address, fee]));
        return getCreate2Address(V3_CORE_FACTORY_ADDRESSES[chainId], salt, POOL_INIT_CODE_HASH);
    }

    return computePoolAddressZkSync({ tokenA, tokenB, fee });
}
