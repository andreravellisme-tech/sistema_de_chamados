# Configuração Firebase - TI Chamados Escolar

## 1. Criar Projeto no Firebase

1. Acesse https://console.firebase.google.com
2. Clique em "Adicionar projeto"
3. Nome: `ti-chamados-escolar`
4. Desabilite Google Analytics (opcional)
5. Clique em "Criar projeto"

## 2. Ativar Authentication

1. No menu lateral, clique em **Authentication**
2. Clique em "Começar"
3. Na aba "Sign-in method", habilite **E-mail/senha**
4. Salve

## 3. Criar Firestore Database

1. No menu lateral, clique em **Firestore Database**
2. Clique em "Criar banco de dados"
3. Selecione **Modo de produção**
4. Escolha a região: `southamerica-east1` (São Paulo)
5. Clique em "Ativar"

## 4. Regras de Segurança do Firestore

Vá em Firestore > Regras e cole o seguinte:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Função auxiliar: verifica se usuário está autenticado
    function isAuth() {
      return request.auth != null;
    }

    // Função auxiliar: busca o perfil do usuário
    function getUserRole() {
      return get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.perfil;
    }

    // Função auxiliar: verifica se é admin
    function isAdmin() {
      return isAuth() && getUserRole() == 'admin';
    }

    // Função auxiliar: verifica se é técnico
    function isTecnico() {
      return isAuth() && getUserRole() == 'tecnico';
    }

    // Função auxiliar: verifica se é solicitante
    function isSolicitante() {
      return isAuth() && getUserRole() == 'solicitante';
    }

    // Coleção de usuários
    match /usuarios/{userId} {
      allow read: if isAuth() && (request.auth.uid == userId || isAdmin() || isTecnico());
      allow create: if isAdmin();
      allow update: if isAdmin() || request.auth.uid == userId;
      allow delete: if isAdmin();
    }

    // Coleção de unidades escolares
    match /unidades/{unidadeId} {
      allow read: if isAuth();
      allow write: if isAdmin();
    }

    // Coleção de chamados
    match /chamados/{chamadoId} {
      // Solicitante só vê chamados da própria unidade
      allow read: if isAuth() && (
        isAdmin() ||
        isTecnico() ||
        (isSolicitante() && resource.data.unidadeId == get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.unidadeId)
      );

      // Solicitante cria chamado com sua unidade obrigatoriamente
      allow create: if isAuth() && (
        isAdmin() ||
        isTecnico() ||
        (isSolicitante() && request.resource.data.unidadeId == get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.unidadeId)
      );

      // Somente admin e técnico podem atualizar (atribuir técnico, mudar status)
      allow update: if isAuth() && (isAdmin() || isTecnico());
      allow delete: if isAdmin();
    }

    // Coleção de notificações
    match /notificacoes/{notifId} {
      allow read: if isAuth() && (
        resource.data.destinatario == request.auth.uid ||
        isAdmin()
      );
      allow create: if isAuth();
      allow update: if isAuth() && resource.data.destinatario == request.auth.uid;
      allow delete: if isAdmin();
    }
  }
}
```

## 5. Configurar App Web no Firebase

1. No console Firebase, clique na engrenagem ⚙️ > "Configurações do projeto"
2. Role até "Seus apps" e clique em **</>** (Web)
3. Nome do app: `TI Chamados Web`
4. **Marque** "Também configure o Firebase Hosting" se quiser usar Firebase Hosting
5. Copie o objeto `firebaseConfig` gerado
6. **Substitua** o objeto `firebaseConfig` no arquivo `js/firebase-config.js`

## 6. Deploy no GitHub Pages

1. Crie um repositório no GitHub
2. Faça upload de todos os arquivos do projeto
3. Vá em Settings > Pages
4. Em "Source", selecione a branch `main` e pasta `/` (root)
5. Salve — o site ficará disponível em `https://seu-usuario.github.io/nome-repo`

## 7. Autorizar o Domínio no Firebase

1. No Firebase Console > Authentication > Settings > Domínios autorizados
2. Adicione o domínio do GitHub Pages: `seu-usuario.github.io`

## 8. Criar o Primeiro Usuário Admin

Após fazer deploy, acesse a página de login e registre o primeiro usuário via console do navegador:

```javascript
// No console do navegador, após carregar a página:
// 1. Primeiro crie a conta pelo sistema normalmente
// 2. Depois no Firestore Console, vá em usuarios > [uid] > edite o campo "perfil" para "admin"
```

Ou use o script de inicialização disponível em `js/init-admin.js`
