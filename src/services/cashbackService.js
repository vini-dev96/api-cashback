
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

export { calcPorcentagemCashback, calcBonus, calcCashbackItem, travar2Casas, calcCashback };
