import { maxUint256 } from 'viem';
import { describe, it, expect } from 'vitest';
import { ONE } from '../constants/misc';
import { mostSignificantBit } from './most-significant-bit';

describe('mostSignificantBit', () => {
    it('throws for zero', () => {
        expect(() => mostSignificantBit(0n)).toThrow('ZERO');
    });
    it('correct value for every power of 2', () => {
        for (let i = 1; i < 256; i++) {
            const x = 2n ** BigInt(i);
            expect(mostSignificantBit(x)).toEqual(i);
        }
    });
    it('correct value for every power of 2 - 1', () => {
        for (let i = 2; i < 256; i++) {
            const x = 2n ** BigInt(i) - 1n;
            expect(mostSignificantBit(x)).toEqual(i - 1);
        }
    });

    it('succeeds for maxUint256', () => {
        expect(mostSignificantBit(maxUint256)).toEqual(255);
    });

    it('throws for maxUint256 + 1', () => {
        expect(() => mostSignificantBit(maxUint256 + ONE)).toThrow('MAX');
    });
});
