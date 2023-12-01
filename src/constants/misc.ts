import { Percent } from '@real-wagmi/sdk';

/**
 * The default factory enabled fee amounts, denominated in hundredths of bips.
 */
export enum FeeAmount {
    ZERO = 0,
    LOWEST = 100,
    LOW = 500,
    MEDIUM_LOW = 1500,
    MEDIUM = 3000,
    HIGH = 10000,
}

export const feeAmounts = [FeeAmount.ZERO, FeeAmount.LOWEST, FeeAmount.LOW, FeeAmount.MEDIUM_LOW, FeeAmount.MEDIUM, FeeAmount.HIGH];

/**
 * The default factory tick spacings by fee amount.
 */
export const TICK_SPACINGS: { [amount in FeeAmount]: number } = {
    [FeeAmount.ZERO]: 1,
    [FeeAmount.LOWEST]: 1,
    [FeeAmount.LOW]: 10,
    [FeeAmount.MEDIUM_LOW]: 30,
    [FeeAmount.MEDIUM]: 60,
    [FeeAmount.HIGH]: 200,
};

// constants used internally but not expected to be used externally
export const NEGATIVE_ONE = BigInt(-1);
export const ZERO = 0n;
export const ONE = 1n;

// used in liquidity amount math
export const Q96 = 2n ** 96n;
export const Q192 = Q96 ** 2n;

// used in fee calculation
export const MAX_FEE = 10n ** 6n;
export const ONE_HUNDRED_PERCENT = new Percent('1');
export const ZERO_PERCENT = new Percent('0');
export const Q128 = 2n ** 128n;
