
/*
Eletrônicos - 5%;
Livros - 9%;
Brinquedos - 8%;
Outros - 1%;
*/

function travar2Casas(valor) {
    return Math.floor(valor * 100) / 100;
}

function calcPorcentagemCashback(categoria, cliente) {

    let desconto;
    switch (categoria) {
        case "Eletrônicos":
            desconto = 5;
            break;
        case "Livros":
            desconto = 9;
            break;
        case "Brinquedos":
            desconto = 8;
            break;
        case "Outros":
            desconto = 1;
            break;
    }

    //SuperCliente - Clientes que recebem 3% a mais
    if (cliente === "SuperCliente") {
        desconto = desconto + 3;
    }
    //O limite para QUALQUER cashback por item é de 10%;
    if (desconto > 10) {
        desconto = 10;
    }

    return desconto;
}

//console.log(calcPorcentagemCashback("Eletrônicos", "SuperCliente"));

function calcCashbackItem(produto, quantidade, cliente) {
    const percentual = calcPorcentagemCashback(produto.categoria, cliente);
    const cashback = (produto.preco * quantidade) * percentual / 100;
    return {
        nome: produto.nome,
        categoria: produto.categoria,
        percentual: percentual,
        valor: travar2Casas(cashback)
    };
}

//console.log(calcCashbackItem(buscarProduto("8f7c4e31-90d2-4b2e-b95b-2c6e91f4a0e3"), 2, "SuperCliente"));

//Após aplicar o cashback, se o valor final for superior a R$ 2000,00 , acrescente 5% de cashback
//bonus - Limitado a R$ 150 reais;

function calcBonus(subtotal, totalCashback) {
    let bonus;
    if ((subtotal - totalCashback) > 2000) {
        bonus = totalCashback * 0.05;
        if (bonus > 150) {
            bonus = 150;
        }
    }
    return bonus ? travar2Casas(bonus) : 0;
}

//console.log(calcBonus(2001));

async function calcCashback({ cliente, itens }, produtoRepository) {
    const itensValidos = [];
    for (const item of itens) {
        const produto = await produtoRepository.buscarPorId(item.id);
        if (!produto) continue;

        itensValidos.push({
            cashback: calcCashbackItem(produto, item.quantidade, cliente),
            valorProduto: produto.preco * item.quantidade
        });
    }

    const subtotal = travar2Casas(itensValidos.reduce((acc, item) => acc + item.valorProduto, 0));

    const itensCalculados = itensValidos.map(item => item.cashback);

    const totalCashback = travar2Casas(itensValidos.reduce((acc, item) => acc + item.cashback.valor, 0));

    const bonus = calcBonus(subtotal, totalCashback);

    let total = totalCashback + bonus;

    total = travar2Casas(total);

    let valorFinal = subtotal - total;

    valorFinal = travar2Casas(valorFinal);

    return {
        subtotal,
        cashback: { itens: itensCalculados, bonus, total },
        valorFinal
    };
}

/*console.log(calcCashback({
    cliente: "regular",
    itens: [
        { ddad: "5c8e6d7a-1d52-4d34-90c8-fae0db6cb2c1", quantidade: 1 },
        { nome: "1f2e9cb4-9b98-4db5-8f93-7c6f14d85d5a", quantidade: 4 },
        { nome: "ee1b5c62-6b57-4cf6-8a8e-5a97d6c2f41d", quantidade: 1 }
    ]
}));
*/

export { calcPorcentagemCashback, calcBonus, calcCashbackItem, travar2Casas, calcCashback };
