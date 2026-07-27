import { Router } from "express";
import { calcCashback } from "../services/cashbackService.js";


const router = Router();
router.post('/cashback', (req, res) => {
    const resultado = calcCashback(req.body);
    res.json(resultado);
});

export default router;
