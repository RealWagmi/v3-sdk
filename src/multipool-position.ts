import { BigintIsh, CurrencyAmount, Currency } from '@real-wagmi/sdk';

import { Multipool } from './multipool';

interface MultipoolPositionArgs {
    multipool: Multipool;
    liquidity: BigintIsh;
}

export class MultipoolPosition {
    public readonly multipool: Multipool;
    public readonly liquidity: CurrencyAmount<Currency>;

    public constructor({ multipool, liquidity }: MultipoolPositionArgs) {
        this.multipool = multipool;
        this.liquidity = CurrencyAmount.fromRawAmount(multipool.liquidityToken, liquidity);
    }

    public getAmounts() {
        return this.multipool.getWithdrawalAmounts(this.liquidity);
    }
}
