import { test } from 'node:test';
import assert from 'node:assert';
import {
    calcPorcentagemCashback,
    calcCashbackItem,
    calcBonus,
    calcCashback
} from "../src/services/cashbackService.js";

// calcPorcentagemCashback

test('cliente regular em Eletrônicos recebe 5%', () => {
    assert.strictEqual(calcPorcentagemCashback('Eletrônicos', 'regular'), 5);
});

test('cliente regular em Livros recebe 9%', () => {
    assert.strictEqual(calcPorcentagemCashback('Livros', 'regular'), 9);
});

test('cliente regular em Brinquedos recebe 8%', () => {
    assert.strictEqual(calcPorcentagemCashback('Brinquedos', 'regular'), 8);
});

test('cliente regular em Outros recebe 1%', () => {
    assert.strictEqual(calcPorcentagemCashback('Outros', 'regular'), 1);
});

test('SuperCliente em Eletrônicos recebe 8% (5% + 3%)', () => {
    assert.strictEqual(calcPorcentagemCashback('Eletrônicos', 'SuperCliente'), 8);
});

test('SuperCliente em Outros recebe 4% (1% + 3%)', () => {
    assert.strictEqual(calcPorcentagemCashback('Outros', 'SuperCliente'), 4);
});

test('SuperCliente em Livros é limitado a 10% pelo teto (9% + 3% = 12%)', () => {
    assert.strictEqual(calcPorcentagemCashback('Livros', 'SuperCliente'), 10);
});

test('SuperCliente em Brinquedos é limitado a 10% pelo teto (8% + 3% = 11%)', () => {
    assert.strictEqual(calcPorcentagemCashback('Brinquedos', 'SuperCliente'), 10);
});