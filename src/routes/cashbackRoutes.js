import { Router } from "express";
import { calcCashback } from "../services/cashbackService.js";
import * as produtoRepositoryJson from "../repository/produtoRepositoryJson.js";


const router = Router();
router.post('/cashback', async (req, res) => {
    const { itens } = req.body;
    if (!itens) {
        return res.status(400).json({ erro: "Traga um ID de produto válido" })
    }

    const QuantidadeNegativa = itens.some(i => i.quantidade < 0);
    if (QuantidadeNegativa) {
        return res.status(400).json({ erro: "Quantidade menor que zero não é permitido" })
    }

    const itemInvalido = itens.some(i =>
        !Number.isInteger(i.quantidade) ||
        i.quantidade < 0
    );

    if (itemInvalido) {
        return res.status(400).json({ erro: "Quantidade inserida é inválida" })
    }

    const resultado = await calcCashback(req.body, produtoRepositoryJson);
    res.json(resultado);
});

export default router;
