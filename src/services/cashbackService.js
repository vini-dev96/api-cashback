import produtos from "../data/base-itens.json" with { type: "json" };

function buscarProduto(id) {
    return produtos.find(p => p.id === id);
}

export { buscarProduto };
