import { Position } from "./entities";
import { maxUint128, parseUnits } from 'viem';
import { FullMath, PositionMath, SqrtPriceMath, TickMath } from "./utils";
import { Token, BigintIsh } from "@real-wagmi/sdk";
import invariant from 'tiny-invariant';

interface Chart {
    x: bigint;
    y: bigint;
}

interface LoansData {
    amount: bigint;
    minPrice: bigint;
    maxPrice: bigint;
}

interface CalcCashe {
    maxSqrtPriceX96: bigint;
    minSqrtPriceX96: bigint;
    holdTokenDebtSum: bigint;
    marginDepoSum: bigint;
}

interface ChartData {
    loansChartData: LoansData[];
    aggressiveModeProfitLine: Chart[];
    chart: Chart[];
}

interface NftPositionCache {
    fee: number;
    lowerSqrtPriceX96: bigint;
    upperSqrtPriceX96: bigint;
    entryTick: number;
    entrySqrtPriceX96: bigint;
    saleToken: Token;
    holdToken: Token;
    holdTokenDebt: bigint;
    marginDepo: bigint;
}

export abstract class PositionEffectivityChart{
    private static FLASH_LOAN_FEE_COMPENSATION = 10100n;

    public static createChart(zeroForSaleToken: boolean, positions: Position[], pointsNumber: BigintIsh, marginPointsNumber: BigintIsh): ChartData {
        const data: ChartData = { loansChartData: [], aggressiveModeProfitLine: [{x: 0n, y: 0n},{x: 0n, y: 0n}], chart: [] };
        let _pointsNumber = BigInt(pointsNumber);
        let _marginPointsNumber = BigInt(marginPointsNumber);

        if (_pointsNumber < 6n) {
            _pointsNumber = 6n;
        }

        let oneHoldToken = 0n;
        let weightedAverageEntraceSqrtPriceX96 = 0n;
        const calcCashe: CalcCashe = { maxSqrtPriceX96: TickMath.MIN_SQRT_RATIO, minSqrtPriceX96: TickMath.MAX_SQRT_RATIO, holdTokenDebtSum: 0n, marginDepoSum: 0n };
        const caches: NftPositionCache[] = [];

        for(let i = 0; i < positions.length; i++){
            caches.push(this._upNftPositionCache(zeroForSaleToken, positions[i]));

            if (i == 0) {
                oneHoldToken = parseUnits('1', caches[0].holdToken.decimals);
            }

            if (caches[i].lowerSqrtPriceX96 < calcCashe.minSqrtPriceX96) {
                calcCashe.minSqrtPriceX96 = caches[i].lowerSqrtPriceX96;
            }

            if (caches[i].upperSqrtPriceX96 > calcCashe.maxSqrtPriceX96) {
                calcCashe.maxSqrtPriceX96 = caches[i].upperSqrtPriceX96;
            }

            if (caches[i].entrySqrtPriceX96 < calcCashe.minSqrtPriceX96) {
                calcCashe.minSqrtPriceX96 = caches[i].entrySqrtPriceX96;
            }

            if (caches[i].entrySqrtPriceX96 > calcCashe.maxSqrtPriceX96) {
                calcCashe.maxSqrtPriceX96 = caches[i].entrySqrtPriceX96;
            }
            calcCashe.holdTokenDebtSum += caches[i].holdTokenDebt;
            calcCashe.marginDepoSum += caches[i].marginDepo;

            weightedAverageEntraceSqrtPriceX96 += FullMath.mulDiv(
                caches[i].entrySqrtPriceX96,
                caches[i].holdTokenDebt,
                1n << 64n
            );
            
            data.loansChartData.push({ 
                amount: caches[i].holdTokenDebt, 
                minPrice: this._getAmountOut(
                    !zeroForSaleToken,
                    caches[i].lowerSqrtPriceX96,
                    oneHoldToken
                ), 
                maxPrice: this._getAmountOut(
                    !zeroForSaleToken,
                    caches[i].upperSqrtPriceX96,
                    oneHoldToken
                )
            });
        }

        weightedAverageEntraceSqrtPriceX96 = FullMath.mulDiv(
            weightedAverageEntraceSqrtPriceX96,
            1n << 64n,
            calcCashe.holdTokenDebtSum
        );

        const step = (calcCashe.maxSqrtPriceX96 - calcCashe.minSqrtPriceX96) / BigInt(pointsNumber);

        invariant(step > 0, '"step is 0"');

        let [ margin, maxMarginPoints ] = this._calcMargin(
            step,
            calcCashe.minSqrtPriceX96, //max
            TickMath.MIN_SQRT_RATIO, //min
            _marginPointsNumber
        );
        calcCashe.minSqrtPriceX96 -= margin;
        _pointsNumber += maxMarginPoints;

        [ margin, maxMarginPoints ] = this._calcMargin(
            step,
            TickMath.MAX_SQRT_RATIO, //max
            calcCashe.maxSqrtPriceX96, //min
            _marginPointsNumber
        );

        calcCashe.maxSqrtPriceX96 += margin;
        _pointsNumber += maxMarginPoints;

        let sqrtPriceX96 = 0n;

        for(let i=0n ; i<_pointsNumber; i++){
            sqrtPriceX96 = zeroForSaleToken
            ? (calcCashe.maxSqrtPriceX96 - step * i)
            : (calcCashe.minSqrtPriceX96 + step * i)

            data.chart.push({ x: 0n, y: 0n });

            data.chart[Number(i)].x = this._getAmountOut(!zeroForSaleToken, sqrtPriceX96, oneHoldToken);

            for (let j = 0n; j < positions.length; j++ ) {
                const holdTokenAmount = this._optimisticHoldTokenAmountForLiquidity(
                    zeroForSaleToken,
                    positions[Number(j)],
                    caches[Number(j)].holdTokenDebt,
                    sqrtPriceX96
                );
                data.chart[Number(i)].y += holdTokenAmount - caches[Number(j)].marginDepo
            }
        }

        data.aggressiveModeProfitLine[0].x = this._getAmountOut(
            !zeroForSaleToken,
            weightedAverageEntraceSqrtPriceX96,
            oneHoldToken
        );
        data.aggressiveModeProfitLine[1].x = data.chart[Number(_pointsNumber - 1n)].x;
        const profitInSallToken = ((calcCashe.holdTokenDebtSum * data.aggressiveModeProfitLine[1].x) -
            ((calcCashe.holdTokenDebtSum - calcCashe.marginDepoSum) *
                data.aggressiveModeProfitLine[0].x)) / oneHoldToken;

        data.aggressiveModeProfitLine[1].y =
            this._getAmountOut(zeroForSaleToken, sqrtPriceX96, profitInSallToken) -
            calcCashe.marginDepoSum

        return data;
    }

    private static _upNftPositionCache(zeroForSaleToken: boolean, position: Position): NftPositionCache{
        const cache: NftPositionCache = { 
            fee: position.pool.fee, 
            lowerSqrtPriceX96: TickMath.getSqrtRatioAtTick(position.tickLower),
            upperSqrtPriceX96: TickMath.getSqrtRatioAtTick(position.tickUpper), 
            entryTick: position.pool.tickCurrent, 
            entrySqrtPriceX96: position.pool.sqrtRatioX96, 
            saleToken: position.amount0.currency, 
            holdToken: position.amount1.currency,
            holdTokenDebt: this._getSingleSideRoundUpAmount(
                zeroForSaleToken,
                position
            ), 
            marginDepo: 0n 
        };

        if (!zeroForSaleToken) {
            cache.saleToken = position.amount1.currency;
            cache.holdToken = position.amount0.currency;
        }

        cache.marginDepo = this._optimisticHoldTokenAmountForLiquidity(
            zeroForSaleToken,
            position,
            cache.holdTokenDebt
        );

        return cache;
    }

    private static _calcMargin(
        step: bigint,
        maxSqrtPriceX96: bigint,
        minSqrtPriceX96: bigint,
        marginPointsNumber: bigint
    ) : [bigint, bigint] {
        const maxMarginPoints = (maxSqrtPriceX96 - minSqrtPriceX96) / step;
        if (maxMarginPoints < marginPointsNumber) {
            const margin = step * maxMarginPoints;
            const pointsNumber = maxMarginPoints;
            return [ margin, pointsNumber ];
        } else {
            const margin = step * marginPointsNumber;
            const pointsNumber = marginPointsNumber;
            return [ margin, pointsNumber ];
        }
    }

    private static _optimisticHoldTokenAmountForLiquidity(
        zeroForSaleToken: boolean,
        position: Position,
        holdTokenDebt: bigint,
        overrideSqrtPriceX96 = position.pool.sqrtRatioX96
    ) : bigint {
        const currentTick = TickMath.getTickAtSqrtRatio(overrideSqrtPriceX96);

        let [amount0, amount1] = [
            PositionMath.getToken0Amount(currentTick, position.tickLower, position.tickUpper, overrideSqrtPriceX96, position.liquidity),
            PositionMath.getToken1Amount(currentTick, position.tickLower, position.tickUpper, overrideSqrtPriceX96, position.liquidity)
        ];

        if (!zeroForSaleToken) {
            [amount0, amount1] = [amount1, amount0];
        }

        let holdTokenAmount = amount1 + this._getAmountOut(zeroForSaleToken, overrideSqrtPriceX96, amount0);
        return holdTokenDebt > holdTokenAmount ? holdTokenDebt - holdTokenAmount : 0n;
    }

    private static _getAmountOut(
        zeroForIn: boolean,
        sqrtPriceX96: bigint,
        amountIn: bigint
    ) : bigint {
        if (sqrtPriceX96 <= maxUint128) {
            const ratioX192 = sqrtPriceX96 * sqrtPriceX96;
            return zeroForIn
                ? FullMath.mulDiv(ratioX192, amountIn, 1n << 192n)
                : FullMath.mulDiv(1n << 192n, amountIn, ratioX192);
        } else {
            const ratioX128 = FullMath.mulDiv(sqrtPriceX96, sqrtPriceX96, 1n << 64n);
            return zeroForIn
                ? FullMath.mulDiv(ratioX128, amountIn, 1n << 128n)
                : FullMath.mulDiv(1n << 128n, amountIn, ratioX128);
        }
    }

    private static _getSingleSideRoundUpAmount(zeroForSaleToken: boolean, position: Position): bigint {
        const sqrtTickLower = TickMath.getSqrtRatioAtTick(position.tickLower);
        const sqrtTickUpper = TickMath.getSqrtRatioAtTick(position.tickUpper);

        const borrowAmount = zeroForSaleToken
            ? SqrtPriceMath.getAmount1Delta(sqrtTickLower, sqrtTickUpper, position.liquidity, true)
            : SqrtPriceMath.getAmount0Delta(sqrtTickLower, sqrtTickUpper, position.liquidity, true);
        
        const feeTier = BigInt(position.pool.fee) + this.FLASH_LOAN_FEE_COMPENSATION;
        return borrowAmount + FullMath.mulDivRoundingUp(borrowAmount, feeTier, 1000000n - feeTier);
    }
}