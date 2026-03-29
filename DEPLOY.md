# 🚀 Guia de Deploy — Tarefas App

## O que precisas
- Conta no **GitHub** (gratuita) → https://github.com
- Conta no **Vercel** (gratuita) → https://vercel.com
- **Node.js** instalado no teu computador → https://nodejs.org

---

## Passo 1 — Preparar o projeto no teu computador

1. Abre o Terminal (Mac/Linux) ou PowerShell (Windows)
2. Vai à pasta onde guardaste os ficheiros:
   ```bash
   cd caminho/para/tarefas-app
   ```
3. Instala as dependências:
   ```bash
   npm install
   ```
4. Testa localmente (opcional):
   ```bash
   npm run dev
   ```
   Abre http://localhost:5173 para ver a app.

---

## Passo 2 — Criar repositório no GitHub

1. Vai a https://github.com → clica **"New repository"**
2. Nome: `tarefas-app`
3. Deixa **privado** (Private) se quiseres
4. Clica **"Create repository"**
5. No terminal, na pasta do projeto:
   ```bash
   git init
   git add .
   git commit -m "primeiro commit"
   git branch -M main
   git remote add origin https://github.com/O_TEU_USERNAME/tarefas-app.git
   git push -u origin main
   ```

---

## Passo 3 — Deploy no Vercel

1. Vai a https://vercel.com → faz login com a conta GitHub
2. Clica **"Add New Project"**
3. Seleciona o repositório `tarefas-app`
4. Deixa todas as opções como estão (Vercel deteta Vite automaticamente)
5. Clica **"Deploy"**

⏱ Em ~1 minuto a app fica online com um URL tipo:  
**https://tarefas-app-xyz.vercel.app**

---

## Passo 4 — Instalar no iPhone como app

1. Abre o Safari no iPhone
2. Vai ao URL da tua app (ex: https://tarefas-app-xyz.vercel.app)
3. Toca no ícone de **partilhar** (quadrado com seta para cima) ↑
4. Desliza e toca em **"Adicionar ao Ecrã de Início"**
5. Confirma o nome → **"Adicionar"**

✅ A app aparece no ecrã inicial como se fosse nativa!

---

## Como funciona o armazenamento

- As tarefas são guardadas no **localStorage** do Safari no iPhone
- Ficam guardadas mesmo que feches a app ou reinicies o telemóvel
- **Atenção:** se limpares os dados do Safari ou mudares de iPhone, perdes as tarefas
- Se um dia quiseres backup na nuvem, podemos adicionar Firebase

---

## Actualizações futuras

Sempre que fizeres mudanças ao código:
```bash
git add .
git commit -m "descrição da mudança"
git push
```
O Vercel faz novo deploy automaticamente em ~30 segundos.

---

## ⚠️ Ícones da app (opcional)

Para teres ícone bonito no ecrã do iPhone, adiciona dois ficheiros à pasta `public/`:
- `icon-192.png` — 192×192 px
- `icon-512.png` — 512×512 px

Podes criar gratuitamente em https://www.canva.com ou https://favicon.io
