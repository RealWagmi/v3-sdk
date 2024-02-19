import { Token, CurrencyAmount, WETH9 } from '@real-wagmi/sdk';
import { FeeAmount, TICK_SPACINGS } from '../constants';
import { nearestUsableTick } from '../utils/nearest-usable-tick';
import { TickMath } from '../utils/tick-math';
import { Pool } from './pool';
import { encodeSqrtRatioX96 } from '../utils/encode-sqrt-ratio-x96';
import { NEGATIVE_ONE } from '../constants/misc';

const ONE_ETHER = 10n ** 18n;

describe('Pool', () => {
    const USDC = new Token(250, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD Coin');
    const DAI = new Token(250, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'DAI', 'DAI Stablecoin');

    describe('constructor', () => {
        it('cannot be used for tokens on different chains', () => {
            expect(() => {
                new Pool(USDC, WETH9[324], FeeAmount.MEDIUM, encodeSqrtRatioX96(1, 1), 0, 0, []);
            }).toThrow('CHAIN_IDS');
        });

        it('fee must be integer', () => {
            expect(() => {
                new Pool(USDC, WETH9[250], FeeAmount.MEDIUM + 0.5, encodeSqrtRatioX96(1, 1), 0, 0, []);
            }).toThrow('FEE');
        });

        it('fee cannot be more than 1e6', () => {
            expect(() => {
                //@ts-ignore
                new Pool(USDC, WETH9[250], 1e6, encodeSqrtRatioX96(1, 1), 0, 0, []);
            }).toThrow('FEE');
        });

        it('cannot be given two of the same token', () => {
            expect(() => {
                new Pool(USDC, USDC, FeeAmount.MEDIUM, encodeSqrtRatioX96(1, 1), 0, 0, []);
            }).toThrow('ADDRESSES');
        });

        it.skip('price must be within tick price bounds', () => {
            expect(() => {
                new Pool(USDC, WETH9[250], FeeAmount.MEDIUM, encodeSqrtRatioX96(1, 1), 0, 1, []);
            }).toThrow('PRICE_BOUNDS');
            expect(() => {
                new Pool(USDC, WETH9[250], FeeAmount.MEDIUM, encodeSqrtRatioX96(1, 1) + 1n, 0, -1, []);
            }).toThrow('PRICE_BOUNDS');
        });

        it('works with valid arguments for empty pool medium fee', () => {
            new Pool(USDC, WETH9[250], FeeAmount.MEDIUM, encodeSqrtRatioX96(1, 1), 0, 0, []);
        });

        it('works with valid arguments for empty pool low fee', () => {
            new Pool(USDC, WETH9[250], FeeAmount.LOW, encodeSqrtRatioX96(1, 1), 0, 0, []);
        });

        it('works with valid arguments for empty pool lowest fee', () => {
            new Pool(USDC, WETH9[250], FeeAmount.LOWEST, encodeSqrtRatioX96(1, 1), 0, 0, []);
        });

        it('works with valid arguments for empty pool high fee', () => {
            new Pool(USDC, WETH9[250], FeeAmount.HIGH, encodeSqrtRatioX96(1, 1), 0, 0, []);
        });
    });

    describe('#getAddress', () => {
        it('matches an example', () => {
            const result = Pool.getAddress(USDC, DAI, FeeAmount.LOW);
            expect(result).toEqual('0x4987768e7C6Fd20E4e6Fb3857F9D8cAA0350c199');
        });
    });

    describe('#token0', () => {
        it('always is the token that sorts before', () => {
            let pool = new Pool(USDC, DAI, FeeAmount.LOW, encodeSqrtRatioX96(1, 1), 0, 0, []);
            expect(pool.token0).toEqual(DAI);
            pool = new Pool(DAI, USDC, FeeAmount.LOW, encodeSqrtRatioX96(1, 1), 0, 0, []);
            expect(pool.token0).toEqual(DAI);
        });
    });
    describe('#token1', () => {
        it('always is the token that sorts after', () => {
            let pool = new Pool(USDC, DAI, FeeAmount.LOW, encodeSqrtRatioX96(1, 1), 0, 0, []);
            expect(pool.token1).toEqual(USDC);
            pool = new Pool(DAI, USDC, FeeAmount.LOW, encodeSqrtRatioX96(1, 1), 0, 0, []);
            expect(pool.token1).toEqual(USDC);
        });
    });

    describe('#token0Price', () => {
        it('returns price of token0 in terms of token1', () => {
            expect(
                new Pool(
                    USDC,
                    DAI,
                    FeeAmount.LOW,
                    encodeSqrtRatioX96(101e6, 100e18),
                    0,
                    TickMath.getTickAtSqrtRatio(encodeSqrtRatioX96(101e6, 100e18)),
                    [],
                ).token0Price.toSignificant(5),
            ).toEqual('1.01');
            expect(
                new Pool(
                    DAI,
                    USDC,
                    FeeAmount.LOW,
                    encodeSqrtRatioX96(101e6, 100e18),
                    0,
                    TickMath.getTickAtSqrtRatio(encodeSqrtRatioX96(101e6, 100e18)),
                    [],
                ).token0Price.toSignificant(5),
            ).toEqual('1.01');
        });
    });

    describe('#token1Price', () => {
        it('returns price of token1 in terms of token0', () => {
            expect(
                new Pool(
                    USDC,
                    DAI,
                    FeeAmount.LOW,
                    encodeSqrtRatioX96(101e6, 100e18),
                    0,
                    TickMath.getTickAtSqrtRatio(encodeSqrtRatioX96(101e6, 100e18)),
                    [],
                ).token1Price.toSignificant(5),
            ).toEqual('0.9901');
            expect(
                new Pool(
                    DAI,
                    USDC,
                    FeeAmount.LOW,
                    encodeSqrtRatioX96(101e6, 100e18),
                    0,
                    TickMath.getTickAtSqrtRatio(encodeSqrtRatioX96(101e6, 100e18)),
                    [],
                ).token1Price.toSignificant(5),
            ).toEqual('0.9901');
        });
    });

    describe('#priceOf', () => {
        const pool = new Pool(USDC, DAI, FeeAmount.LOW, encodeSqrtRatioX96(1, 1), 0, 0, []);
        it('returns price of token in terms of other token', () => {
            expect(pool.priceOf(DAI)).toEqual(pool.token0Price);
            expect(pool.priceOf(USDC)).toEqual(pool.token1Price);
        });

        it('throws if invalid token', () => {
            expect(() => pool.priceOf(WETH9[250])).toThrow('TOKEN');
        });
    });

    describe('#chainId', () => {
        it('returns the token0 chainId', () => {
            let pool = new Pool(USDC, DAI, FeeAmount.LOW, encodeSqrtRatioX96(1, 1), 0, 0, []);
            expect(pool.chainId).toEqual(250);
            pool = new Pool(DAI, USDC, FeeAmount.LOW, encodeSqrtRatioX96(1, 1), 0, 0, []);
            expect(pool.chainId).toEqual(250);
        });
    });

    describe('#involvesToken', () => {
        it('returns involves token', () => {
            const pool = new Pool(USDC, DAI, FeeAmount.LOW, encodeSqrtRatioX96(1, 1), 0, 0, []);
            expect(pool.involvesToken(USDC)).toEqual(true);
            expect(pool.involvesToken(DAI)).toEqual(true);
            expect(pool.involvesToken(WETH9[250])).toEqual(false);
        });
    });

    describe('swaps', () => {
        let pool: Pool;

        beforeEach(() => {
            pool = new Pool(USDC, DAI, FeeAmount.LOW, encodeSqrtRatioX96(1, 1), ONE_ETHER, 0, [
                {
                    index: nearestUsableTick(TickMath.MIN_TICK, TICK_SPACINGS[FeeAmount.LOW]),
                    liquidityNet: ONE_ETHER,
                    liquidityGross: ONE_ETHER,
                },
                {
                    index: nearestUsableTick(TickMath.MAX_TICK, TICK_SPACINGS[FeeAmount.LOW]),
                    liquidityNet: ONE_ETHER * NEGATIVE_ONE,
                    liquidityGross: ONE_ETHER,
                },
            ]);
        });

        describe('#getOutputAmount', () => {
            it('USDC -> DAI', async () => {
                const inputAmount = CurrencyAmount.fromRawAmount(USDC, 100);
                const [outputAmount] = await pool.getOutputAmount(inputAmount);
                expect(outputAmount.currency.equals(DAI)).toBe(true);
                expect(outputAmount.quotient).toEqual(98n);
            });

            it('DAI -> USDC', async () => {
                const inputAmount = CurrencyAmount.fromRawAmount(DAI, 100);
                const [outputAmount] = await pool.getOutputAmount(inputAmount);
                expect(outputAmount.currency.equals(USDC)).toBe(true);
                expect(outputAmount.quotient).toEqual(98n);
            });
        });

        describe('#getInputAmount', () => {
            it('USDC -> DAI', async () => {
                const outputAmount = CurrencyAmount.fromRawAmount(DAI, 98);
                const [inputAmount] = await pool.getInputAmount(outputAmount);
                expect(inputAmount.currency.equals(USDC)).toBe(true);
                expect(inputAmount.quotient).toEqual(100n);
            });

            it('DAI -> USDC', async () => {
                const outputAmount = CurrencyAmount.fromRawAmount(USDC, 98);
                const [inputAmount] = await pool.getInputAmount(outputAmount);
                expect(inputAmount.currency.equals(DAI)).toBe(true);
                expect(inputAmount.quotient).toEqual(100n);
            });
        });
    });

    describe('#bigNums', () => {
        let pool: Pool;
        const bigNum1 = BigInt(Number.MAX_SAFE_INTEGER) + 1n;
        const bigNum2 = BigInt(Number.MAX_SAFE_INTEGER) + 1n;
        beforeEach(() => {
            pool = new Pool(USDC, DAI, FeeAmount.LOW, encodeSqrtRatioX96(bigNum1, bigNum2), ONE_ETHER, 0, [
                {
                    index: nearestUsableTick(TickMath.MIN_TICK, TICK_SPACINGS[FeeAmount.LOW]),
                    liquidityNet: ONE_ETHER,
                    liquidityGross: ONE_ETHER,
                },
                {
                    index: nearestUsableTick(TickMath.MAX_TICK, TICK_SPACINGS[FeeAmount.LOW]),
                    liquidityNet: ONE_ETHER * NEGATIVE_ONE,
                    liquidityGross: ONE_ETHER,
                },
            ]);
        });

        describe('#priceLimit', () => {
            it('correctly compares two BigIntegers', async () => {
                expect(bigNum1).toEqual(bigNum2);
            });
            it('correctly handles two BigIntegers', async () => {
                const inputAmount = CurrencyAmount.fromRawAmount(USDC, 100);
                const [outputAmount] = await pool.getOutputAmount(inputAmount);
                pool.getInputAmount(outputAmount);
                expect(outputAmount.currency.equals(DAI)).toBe(true);
                // if output is correct, function has succeeded
            });
        });
    });

    describe('tickSpacing', () => {
        describe('#not overrated tick spacing', () => {
            let pool: Pool;
            const bigNum1 = BigInt(Number.MAX_SAFE_INTEGER) + 1n;
            const bigNum2 = BigInt(Number.MAX_SAFE_INTEGER) + 1n;
            beforeEach(() => {
                pool = new Pool(USDC, DAI, FeeAmount.LOW, encodeSqrtRatioX96(bigNum1, bigNum2), ONE_ETHER, 0);
            });
    
            it('should retrun tick  spacing', async () => {
                expect(pool.tickSpacing).toEqual(TICK_SPACINGS[FeeAmount.LOW]);
            });
        });
        describe('#overrated tick spacing', () => {
            let pool: Pool;
            const bigNum1 = BigInt(Number.MAX_SAFE_INTEGER) + 1n;
            const bigNum2 = BigInt(Number.MAX_SAFE_INTEGER) + 1n;
            beforeEach(() => {
                pool = new Pool(USDC, DAI, FeeAmount.LOW, encodeSqrtRatioX96(bigNum1, bigNum2), ONE_ETHER, 0, [], 1);
            });
    
            it('should retrun tick  spacing', async () => {
                expect(pool.tickSpacing).toEqual(1);
            });
        });
    });

    describe('#address', () => {
        it('returns pool address', () => {
            expect(
                new Pool(
                    USDC,
                    DAI,
                    FeeAmount.LOW,
                    encodeSqrtRatioX96(101e6, 100e18),
                    0,
                    TickMath.getTickAtSqrtRatio(encodeSqrtRatioX96(101e6, 100e18)),
                ).address,
            ).toEqual('0x1C887307de445F9D9f9b9CC98cdbcC56f87eeeb2');
        });

        it('should failed OVERRATED__TICK_SPACINGS', () => {
            expect(
                () => new Pool(
                    USDC,
                    DAI,
                    FeeAmount.LOW,
                    encodeSqrtRatioX96(101e6, 100e18),
                    0,
                    TickMath.getTickAtSqrtRatio(encodeSqrtRatioX96(101e6, 100e18)),
                    [],
                    30
                ).address,
            ).toThrowError('Invariant failed: OVERRATED__TICK_SPACINGS');
        });
    });
});
