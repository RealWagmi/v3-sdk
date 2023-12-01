import { FeeAmount } from '../constants';

export function isFeeAmount(feeAmount?: FeeAmount): boolean {
    if(isNaN(feeAmount as any)) return false;
    const fees = Object.values(FeeAmount).filter((fee) => typeof fee === 'number');
    return fees.includes(feeAmount as FeeAmount);
}