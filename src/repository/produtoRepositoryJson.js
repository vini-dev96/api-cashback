import produtos from "../data/base-itens.json" with { type: "json" }

async function buscarPorId(id) {
    return produtos.find(p => p.id === id);
}

export { buscarPorId };
