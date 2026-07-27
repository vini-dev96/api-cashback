import produtos from "../data/base-itens.json" with { type: "json" };

function buscarProduto(id) {
    return produtos.find(p => p.id === id);
}

/*
Eletrônicos - 5%;
Livros - 9%;
Brinquedos - 8%;
Outros - 1%;
*/

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
        valor: Number(cashback.toFixed(2))
    };
}

//console.log(calcCashbackItem(buscarProduto("8f7c4e31-90d2-4b2e-b95b-2c6e91f4a0e3"), 2, "SuperCliente"));

export { buscarProduto, calcPorcentagemCashback, calcCashbackItem };
