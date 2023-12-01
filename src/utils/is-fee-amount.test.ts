import { describe, it, expect } from 'vitest';
import { isFeeAmount } from './is-fee-amount';
import { FeeAmount } from '../constants';

describe('#isFeeAmount', () => {
    const fees = Object.values(FeeAmount).filter((fee) => typeof fee === 'number');
    for(const fee of fees){
        it(`should return true (${fee})`, () => {
            expect(isFeeAmount(Number(fee))).toEqual(true);
        });
    }

    it(`should return false`, () => {
        expect(isFeeAmount()).toEqual(false);
    });
});
