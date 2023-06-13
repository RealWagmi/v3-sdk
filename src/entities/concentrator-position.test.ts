import { ConcentratorPosition } from './concentrator-position';
import { Concentrator } from './concentrator';
import { fantomTokens, CurrencyAmount } from '@real-wagmi/sdk';
import { zeroAddress } from 'viem';

describe('ConcentratorPosition', () => {
    describe('#getAmounts', () => {
        it('return amounts', () => {
            const concentrator = new Concentrator(
                zeroAddress,
                [],
                '1000',
                CurrencyAmount.fromRawAmount(fantomTokens.usdc, '100'),
                CurrencyAmount.fromRawAmount(fantomTokens.usdt, '100'),
            );
            const position = new ConcentratorPosition({ concentrator, liquidity: '100' });

            const [amount0, amount1] = position.getAmounts();
            expect(amount0).toEqual(CurrencyAmount.fromFractionalAmount(fantomTokens.usdc, '10000', '1000'));
            expect(amount1).toEqual(CurrencyAmount.fromFractionalAmount(fantomTokens.usdt, '10000', '1000'));
        });
    });
});
