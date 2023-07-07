import { Percent } from '@real-wagmi/sdk';

/**
 * The default factory enabled fee amounts, denominated in hundredths of bips.
 */
export enum FeeAmount {
    LOWEST = 100,
    LOW = 500,
    MEDIUM = 3000,
    HIGH = 10000,
}

/**
 * The default factory tick spacings by fee amount.
 */
export const TICK_SPACINGS: { [amount in FeeAmount]: number } = {
    [FeeAmount.LOWEST]: 1,
    [FeeAmount.LOW]: 10,
    [FeeAmount.MEDIUM]: 60,
    [FeeAmount.HIGH]: 200,
};

// constants used internally but not expected to be used externally
export const NEGATIVE_ONE = BigInt(-1);
export const ZERO = 0n;
export const ONE = 1n;

// used in liquidity amount math
export const Q96 = BigInt('79228162514264337593543950336'); //2n ** 96n;
export const Q192 = BigInt('6277101735386680763835789423207666416102355444464034512896'); //Q96 ** 2n;

// used in fee calculation
export const MAX_FEE = BigInt('1000000'); //10n ** 6n;
export const ONE_HUNDRED_PERCENT = new Percent('1');
export const ZERO_PERCENT = new Percent('0');
export const Q128 = BigInt('340282366920938463463374607431768211456'); //2n ** 128n;
