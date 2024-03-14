import { maxUint256 } from 'viem';
import invariant from 'tiny-invariant'
import { ZERO } from '../constants/misc'

const TWO = 2
const POWERS_OF_2 = [128, 64, 32, 16, 8, 4, 2, 1].map((pow: number): [number, bigint] => [pow, BigInt(TWO ** pow)])

export function mostSignificantBit(x: bigint): number {
  invariant(x > ZERO, 'ZERO')
  invariant(x <= maxUint256, 'MAX')

  let msb = 0
  for (const [power, min] of POWERS_OF_2) {
    if (x >= min) {
      // eslint-disable-next-line operator-assignment
      x = x >> BigInt(power)
      msb += power
    }
  }
  return msb
}
