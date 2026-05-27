# 🖥️ TI Chamados Escolar

Sistema de chamados de manutenção de TI para unidades escolares.
Hospedado no **GitHub Pages** com banco de dados **Firebase Firestore**.

---

## 📋 Funcionalidades

| Perfil         | O que pode fazer |
|---------------|-----------------|
| **Admin**      | Criar usuários, gerenciar unidades, ver/editar todos os chamados, relatórios |
| **Técnico**    | Ver chamados sem técnico, assumir chamados, atualizar status, adicionar observações |
| **Solicitante**| Abrir chamados da sua unidade, acompanhar status |

### Destaques
- 🔐 Autenticação segura com rate-limiting (5 tentativas / 15 min de bloqueio)
- 🔔 Notificações em tempo real (browser push + badge no sino)
- 🔒 Regras Firestore com isolamento por perfil
- 📊 Dashboard com estatísticas em tempo real
- 📈 Relatórios por status, prioridade, categoria, unidade e técnico
- 📱 Layout responsivo (mobile-friendly)

---

## 🚀 Deploy — Passo a Passo

### 1. Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Crie um projeto chamado `ti-chamados-escolar`
3. **Authentication** → Ativar `E-mail/senha`
4. **Firestore** → Criar banco em modo produção (região `southamerica-east1`)
5. Cole as regras de segurança do arquivo `firebase-setup.md`
6. **Project Settings** → Adicionar app Web → Copie o `firebaseConfig`

### 2. Configurar o projeto

Edite `js/firebase-config.js` e substitua os valores:

```js
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJECT.firebaseapp.com",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_PROJECT.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID"
};
```

### 3. GitHub Pages

```bash
# Clone ou crie um repositório no GitHub
git init
git add .
git commit -m "Sistema TI Chamados"
git remote add origin https://github.com/SEU_USER/ti-chamados.git
git push -u origin main
```

No GitHub:
- Settings → Pages → Source: **GitHub Actions**
- O deploy ocorre automaticamente via `.github/workflows/deploy.yml`

### 4. Autorizar domínio no Firebase

Firebase Console → Authentication → Settings → **Domínios Autorizados**
→ Adicionar: `SEU_USER.github.io`

### 5. Criar o primeiro Admin

**Opção A — Firebase Console (recomendado):**
1. Authentication → Users → Add User (informe e-mail e senha)
2. Copie o UID gerado
3. Firestore → `usuarios` → Add Document com ID = UID
4. Campos: `nome`, `email`, `perfil: "admin"`, `ativo: true`, `criadoEm`

**Opção B — Console do navegador:**
Faça login no sistema, abra o console (F12) e siga as instruções em `js/init-admin.js`

---

## 📁 Estrutura de Arquivos

```
ti-chamados/
├── index.html                    # Página de login
├── css/
│   └── style.css                 # Design system completo
├── js/
│   ├── firebase-config.js        # ⚠️ Configure suas credenciais aqui
│   ├── auth.js                   # Autenticação e sessão
│   ├── utils.js                  # Utilitários, toast, notificações
│   ├── layout.js                 # Sidebar e topbar dinâmicos
│   └── init-admin.js             # Instruções primeiro admin
├── pages/
│   ├── admin-dashboard.html      # Dashboard do administrador
│   ├── admin-chamados.html       # Todos os chamados (admin)
│   ├── admin-usuarios.html       # Gerenciar usuários
│   ├── admin-unidades.html       # Gerenciar unidades escolares
│   ├── admin-relatorios.html     # Relatórios e gráficos
│   ├── tecnico-dashboard.html    # Dashboard do técnico
│   ├── solicitante-dashboard.html# Chamados do solicitante
│   ├── solicitante-novo.html     # Abrir novo chamado
│   └── acesso-negado.html        # Página 403
├── firebase-setup.md             # Instruções Firebase detalhadas
├── .github/workflows/deploy.yml  # CI/CD GitHub Pages
└── README.md
```

---

## 🔒 Segurança

- Rate limiting no login (5 tentativas → bloqueio 15 min)
- Regras Firestore: solicitante só acessa dados da sua unidade
- Verificação de `ativo: false` para contas desativadas
- Sanitização de todas as saídas HTML (`sanitize()`)
- Sem exposição de dados de outros usuários por perfil

---

## 📞 Fluxo do Chamado

```
Solicitante abre chamado (unidade pré-definida)
        ↓
Status: ABERTO — técnico não atribuído
        ↓
Técnico vê na lista "Aguardando Atribuição"
        ↓
Técnico clica "Assumir" ou Admin atribui
        ↓
Status: EM ANDAMENTO — técnico atribuído
        ↓
Técnico atualiza / resolve
        ↓
Status: RESOLVIDO ou CANCELADO
```
