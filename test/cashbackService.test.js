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

// calcCashbackItem

test('calcula o valor do cashback de um item corretamente', () => {
    const produto = { nome: 'Produto Teste', categoria: 'Eletrônicos', preco: 100 };
    const resultado = calcCashbackItem(produto, 2, 'regular');

    assert.strictEqual(resultado.percentual, 5);
    assert.strictEqual(resultado.valor, 10); // 100 * 2 * 5% = 10
    assert.strictEqual(resultado.nome, 'Produto Teste');
    assert.strictEqual(resultado.categoria, 'Eletrônicos');
});

test('trunca o valor do cashback para 2 casas decimais, sem arredondar para cima', () => {
    const produto = { nome: 'Produto Teste', categoria: 'Livros', preco: 33.33 };
    const resultado = calcCashbackItem(produto, 1, 'regular');

    // 33.33 * 9% = 2.9997 -> travado em 2 casas decimais fica 2.99, não 3.00
    assert.strictEqual(resultado.valor, 2.99);
});

// calcBonus

test('não aplica bônus quando (subtotal - totalCashback) é menor que 2000', () => {
    assert.strictEqual(calcBonus(1500, 100), 0);
});

test('não aplica bônus no limite exato de 2000 (condição é estritamente maior)', () => {
    assert.strictEqual(calcBonus(2000, 0), 0);
});

test('aplica 5% de bônus quando valor final ultrapassa 2000 (exemplo do PDF)', () => {
    assert.strictEqual(calcBonus(4449.39, 364.14), 18.2);
});

test('bônus é limitado a 150 mesmo com cashback muito alto', () => {
    assert.strictEqual(calcBonus(50000, 10000), 150);
});

// calcCashback (orquestração completa, com repository fake)

const fakeRepository = {
    buscarPorId: async (id) => {
        const produtos = {
            'produto-eletronico': { nome: 'Produto Eletrônico', categoria: 'Eletrônicos', preco: 100 },
            'produto-livro': { nome: 'Produto Livro', categoria: 'Livros', preco: 50 }
        };
        return produtos[id] || null;
    }
};

test('calcula cashback completo com um item válido, cliente regular', async () => {
    const resultado = await calcCashback(
        { cliente: 'regular', itens: [{ id: 'produto-eletronico', quantidade: 2 }] },
        fakeRepository
    );

    assert.strictEqual(resultado.subtotal, 200);
    assert.strictEqual(resultado.cashback.total, 10);
    assert.strictEqual(resultado.cashback.bonus, 0);
    assert.strictEqual(resultado.valorFinal, 190);
});

test('calcula cashback com múltiplos itens, somando subtotal e cashback corretamente', async () => {
    const resultado = await calcCashback(
        {
            cliente: 'regular',
            itens: [
                { id: 'produto-eletronico', quantidade: 1 }, // 100 * 5% = 5
                { id: 'produto-livro', quantidade: 2 }        // 100 * 9% = 9
            ]
        },
        fakeRepository
    );

    assert.strictEqual(resultado.subtotal, 200);
    assert.strictEqual(resultado.cashback.total, 14);
    assert.strictEqual(resultado.valorFinal, 186);
});

test('item com id inexistente é ignorado, sem quebrar o cálculo', async () => {
    const resultado = await calcCashback(
        { cliente: 'regular', itens: [{ id: 'id-que-nao-existe', quantidade: 1 }] },
        fakeRepository
    );

    assert.strictEqual(resultado.subtotal, 0);
    assert.strictEqual(resultado.cashback.itens.length, 0);
    assert.strictEqual(resultado.cashback.total, 0);
    assert.strictEqual(resultado.valorFinal, 0);
});

test('lista de itens vazia retorna tudo zerado, sem quebrar', async () => {
    const resultado = await calcCashback(
        { cliente: 'regular', itens: [] },
        fakeRepository
    );

    assert.strictEqual(resultado.subtotal, 0);
    assert.strictEqual(resultado.valorFinal, 0);
});