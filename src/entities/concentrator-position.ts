import { BigintIsh, CurrencyAmount, Currency } from '@real-wagmi/sdk';

import { Concentrator } from './concentrator';

interface ConcentratorPositionArgs {
    concentrator: Concentrator;
    liquidity: BigintIsh;
}

export class ConcentratorPosition {
    public readonly concentrator: Concentrator;
    public readonly liquidity: CurrencyAmount<Currency>;

    public constructor({ concentrator, liquidity }: ConcentratorPositionArgs) {
        this.concentrator = concentrator;
        this.liquidity = CurrencyAmount.fromRawAmount(concentrator.liquidityToken, liquidity);
    }

    public getAmounts() {
        return this.concentrator.getWithdrawalAmounts(this.liquidity);
    }
}
