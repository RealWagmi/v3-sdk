import { ONE, ZERO } from '../constants/misc';

export abstract class FullMath {
    /**
     * Cannot be constructed.
     */
    private constructor() {}

    public static mulDiv(a: bigint, b: bigint, denominator: bigint): bigint {
        const product = a * b;
        return product / denominator;
    }

    public static mulDivRoundingUp(a: bigint, b: bigint, denominator: bigint): bigint {
        const product = a * b;
        let result = product / denominator;
        // eslint-disable-next-line operator-assignment
        if (product % denominator !== ZERO) result = result + ONE;
        return result;
    }
}
