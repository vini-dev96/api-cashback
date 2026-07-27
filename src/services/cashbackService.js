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

export { buscarProduto, calcPorcentagemCashback };
