# Boostly Marketing — Sistema de Demandas

App integrado ao Notion via API. Desenvolvido para a agência Boostly Marketing.

## Como publicar no Vercel (gratuito)

### 1. Criar conta no Vercel
Acesse https://vercel.com e crie uma conta gratuita com seu Google.

### 2. Instalar o Vercel CLI (opcional)
Ou use a interface web do Vercel.

### 3. Fazer upload do projeto
- Acesse https://vercel.com/new
- Clique em "Browse" e suba a pasta `boostly` com todos os arquivos
- Ou conecte ao GitHub (recomendado)

### 4. Configurar variáveis de ambiente
Na tela de configuração do projeto no Vercel, adicione:

| Nome | Valor |
|------|-------|
| NOTION_TOKEN | sua_chave_notion |
| NOTION_DB_ID | id_do_banco_demandas |

O ID do banco de dados fica na URL do Notion:
`https://notion.so/Workspace/ESTE-E-O-ID-sem-hifens`

### 5. Publicar
Clique em Deploy. Em 1 minuto o link estará disponível.

## Estrutura do projeto
```
boostly/
├── index.html          # Frontend principal
├── vercel.json         # Configuração do Vercel
└── api/
    └── demands.js      # API de integração com Notion
```

## Colunas necessárias no banco de dados Notion

| Coluna | Tipo |
|--------|------|
| Nome | Title |
| Cliente | Select |
| Tipo | Select |
| Status | Select |
| Responsável | Select |
| Prioridade | Select |
| Prazo | Date |
| Observações | Text |
