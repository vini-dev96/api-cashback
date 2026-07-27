
import express from 'express';
import cashbackRoutes from "./routes/cashbackRoutes.js";

const app = express();

app.use(express.json());
app.use(cashbackRoutes);

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`rodando na porta ${PORT}`)
});