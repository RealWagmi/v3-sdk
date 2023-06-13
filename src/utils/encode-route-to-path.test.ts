import { Ether, Token, WETH9 } from '@real-wagmi/sdk';
import { describe, it, expect } from 'vitest';
import { FeeAmount } from '../constants';
import { Pool } from '../entities/pool';
import { Route } from '../entities/route';
import { encodeRouteToPath } from './encode-route-to-path';
import { encodeSqrtRatioX96 } from './encode-sqrt-ratio-x96';

describe('#encodeRouteToPath', () => {
    const ETHER = Ether.onChain(250);
    const token0 = new Token(250, '0x0000000000000000000000000000000000000001', 18, 't0', 'token0');
    const token1 = new Token(250, '0x0000000000000000000000000000000000000002', 18, 't1', 'token1');
    const token2 = new Token(250, '0x0000000000000000000000000000000000000003', 18, 't2', 'token2');
    // const token3 = new Token(1, '0x0000000000000000000000000000000000000004', 18, 't3', 'token3')

    const weth = WETH9[250];

    const pool_0_1_medium = new Pool(token0, token1, FeeAmount.MEDIUM, encodeSqrtRatioX96(1, 1), 0, 0, []);
    const pool_1_2_low = new Pool(token1, token2, FeeAmount.LOW, encodeSqrtRatioX96(1, 1), 0, 0, []);
    const pool_0_weth = new Pool(token0, weth, FeeAmount.MEDIUM, encodeSqrtRatioX96(1, 1), 0, 0, []);
    const pool_1_weth = new Pool(token1, weth, FeeAmount.MEDIUM, encodeSqrtRatioX96(1, 1), 0, 0, []);

    const route_0_1 = new Route([pool_0_1_medium], token0, token1);
    const route_0_1_2 = new Route([pool_0_1_medium, pool_1_2_low], token0, token2);

    const route_0_weth = new Route([pool_0_weth], token0, ETHER);
    const route_0_1_weth = new Route([pool_0_1_medium, pool_1_weth], token0, ETHER);
    const route_weth_0 = new Route([pool_0_weth], ETHER, token0);
    const route_weth_0_1 = new Route([pool_0_weth, pool_0_1_medium], ETHER, token1);

    it('packs them for exact input single hop', () => {
        expect(encodeRouteToPath(route_0_1, false)).toEqual('0x0000000000000000000000000000000000000001000bb80000000000000000000000000000000000000002');
    });

    it('packs them correctly for exact output single hop', () => {
        expect(encodeRouteToPath(route_0_1, true)).toEqual('0x0000000000000000000000000000000000000002000bb80000000000000000000000000000000000000001');
    });

    it('packs them correctly for multihop exact input', () => {
        expect(encodeRouteToPath(route_0_1_2, false)).toEqual(
            '0x0000000000000000000000000000000000000001000bb800000000000000000000000000000000000000020001f40000000000000000000000000000000000000003',
        );
    });

    it('packs them correctly for multihop exact output', () => {
        expect(encodeRouteToPath(route_0_1_2, true)).toEqual(
            '0x00000000000000000000000000000000000000030001f40000000000000000000000000000000000000002000bb80000000000000000000000000000000000000001',
        );
    });

    it('wraps ether input for exact input single hop', () => {
        expect(encodeRouteToPath(route_weth_0, false)).toEqual('0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83000bb80000000000000000000000000000000000000001');
    });
    it('wraps ether input for exact output single hop', () => {
        expect(encodeRouteToPath(route_weth_0, true)).toEqual('0x0000000000000000000000000000000000000001000bb821be370d5312f44cb42ce377bc9b8a0cef1a4c83');
    });
    it('wraps ether input for exact input multihop', () => {
        expect(encodeRouteToPath(route_weth_0_1, false)).toEqual(
            '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83000bb80000000000000000000000000000000000000001000bb80000000000000000000000000000000000000002',
        );
    });
    it('wraps ether input for exact output multihop', () => {
        expect(encodeRouteToPath(route_weth_0_1, true)).toEqual(
            '0x0000000000000000000000000000000000000002000bb80000000000000000000000000000000000000001000bb821be370d5312f44cb42ce377bc9b8a0cef1a4c83',
        );
    });

    it('wraps ether output for exact input single hop', () => {
        expect(encodeRouteToPath(route_0_weth, false)).toEqual('0x0000000000000000000000000000000000000001000bb821be370d5312f44cb42ce377bc9b8a0cef1a4c83');
    });
    it('wraps ether output for exact output single hop', () => {
        expect(encodeRouteToPath(route_0_weth, true)).toEqual('0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83000bb80000000000000000000000000000000000000001');
    });
    it('wraps ether output for exact input multihop', () => {
        expect(encodeRouteToPath(route_0_1_weth, false)).toEqual(
            '0x0000000000000000000000000000000000000001000bb80000000000000000000000000000000000000002000bb821be370d5312f44cb42ce377bc9b8a0cef1a4c83',
        );
    });
    it('wraps ether output for exact output multihop', () => {
        expect(encodeRouteToPath(route_0_1_weth, true)).toEqual(
            '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83000bb80000000000000000000000000000000000000002000bb80000000000000000000000000000000000000001',
        );
    });
});
