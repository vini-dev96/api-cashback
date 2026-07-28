# API de Cálculo de Cashback

API REST simples para cálculo de cashback em compras, com regras de percentual por categoria, bônus para clientes especiais e bônus progressivo por valor de compra.

## Objetivo

Receber uma lista de produtos comprados (id + quantidade) e retornar:
- O subtotal da compra
- O cashback calculado por item, com percentual aplicado
- Um bônus adicional quando a compra ultrapassa determinado valor
- O valor final a pagar (subtotal já descontado do cashback)

## Regras de negócio

| Categoria | Percentual de cashback |
|---|---|
| Eletrônicos | 5% |
| Livros | 9% |
| Brinquedos | 8% |
| Outros | 1% |

- **SuperCliente**: recebe +3% de cashback em cada item
- **Teto por item**: o percentual de cashback nunca ultrapassa 10%, mesmo somando categoria + SuperCliente
- **Bônus progressivo**: se o valor da compra, já descontado o cashback acumulado, ainda for superior a R$2000, aplica-se +5% de cashback sobre o total acumulado, limitado a R$150

## Tecnologias e ferramentas utilizadas

- **Node.js** (22+) — runtime
- **Express** — framework HTTP para a API
- **ES Modules** (`import`/`export`) — padrão de módulos do projeto
- **node:test** — testes unitários (nativo do Node, sem dependência externa)
- Nenhuma biblioteca externa para os cálculos (Regra de negócio)
- Dados de produtos hoje armazenados em um arquivo JSON, isolados por um Repository (ver seção de arquitetura)

## Como subir o projeto

```bash
# instalar dependências
npm install

# subir o servidor
node server.js
```

O servidor sobe por padrão em `http://localhost:3000` (ajuste conforme a porta configurada no `server.js`).

> **Atenção:** o projeto usa a sintaxe de ES Modules (`import`/`export`). Para isso funcionar, o `package.json` precisa ter a linha `"type": "module"`. Caso não tenha (ou não venha por padrão em algum ambiente), adicione manualmente — sem isso, o Node lança `SyntaxError: Cannot use import statement outside a module`.

## Endpoint

### `POST /cashback`

**Requisição:**
```json
{
  "cliente": "SuperCliente",
  "itens": [
    { "id": "1f2e9cb4-9b98-4db5-8f93-7c6f14d85d5a", "quantidade": 2 }
  ]
}
```

**Resposta (200):**
```json
{
  "subtotal": 179.80,
  "cashback": {
    "itens": [
      { "nome": "Clean Code", "categoria": "Livros", "percentual": 10, "valor": 17.98 }
    ],
    "bonus": 0,
    "total": 17.98
  },
  "valorFinal": 161.82
}
```

**Validações (erro 400):**
- Lista de `itens` ausente, vazia ou não é um array
- `quantidade` de algum item não é um número inteiro maior que zero (strings, decimais, negativos e zero são rejeitados)

## Arquitetura

```
src/
  routes/       → recebe a requisição HTTP, valida entrada, chama o service
  services/     → regra de negócio pura (cálculo de cashback, bônus, percentual)
  repositories/ → acesso aos dados de produto (hoje via JSON)
  data/         → base de produtos em JSON
```

O `service` não sabe de onde vêm os dados — ele recebe um `repository` como parâmetro e só chama `buscarPorId(id)`. Isso permite trocar a fonte de dados (JSON → SQLite → Postgres) sem alterar a regra de negócio.

## Como adicionar novos produtos

Basta incluir um novo objeto no arquivo `src/data/base-itens.json`, seguindo o formato:

```json
{
  "id": "um-uuid-qualquer",
  "nome": "Nome do Produto",
  "categoria": "Eletrônicos",
  "preco": 199.90
}
```

A `categoria` precisa ser uma das já previstas (Eletrônicos, Livros, Brinquedos, Outros) para que o percentual de cashback seja calculado corretamente.

## Como adicionar uma nova fonte de dados (ex: banco de dados)

1. Criar um novo arquivo em `src/repositories/` (ex: `produtoRepositorySqlite.js`)
2. Implementar nele uma função `buscarPorId(id)` (assíncrona), seguindo o mesmo contrato do `produtoRepositoryJson.js`
3. Trocar o import usado na rota (`cashbackRoutes.js`) para apontar para o novo repository

Nenhuma alteração é necessária no `cashbackService.js`.

## Como adicionar uma nova regra de categoria ou percentual

Ajustar o `switch` dentro da função `calcPorcentagemCashback`, em `cashbackService.js`, adicionando o novo `case` com a categoria e o percentual correspondente.

## Testes

```bash
node --test
```

Os testes cobrem os casos de fronteira já mapeados durante o desenvolvimento:
- Percentual por categoria, incluindo o teto de 10% com SuperCliente
- Gatilho e cálculo do bônus progressivo aplicado após o subtotal - cashback (incluindo o limite de R$150)
- Orquestração completa do cálculo, usando um repository fake (sem dependência do JSON real)

## Manutenção

- Ao alterar qualquer regra de cálculo, rodar os testes unitários antes de subir a alteração
- Ao adicionar uma nova categoria, atualizar tanto o `switch` de percentuais quanto os testes correspondentes
- Manter a separação de camadas (routes → services → repositories) ao evoluir o projeto, evitando lógica de negócio dentro das rotas ou acesso a dados dentro do service
