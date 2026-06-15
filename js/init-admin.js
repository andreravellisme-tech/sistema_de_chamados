// ============================================================
// init-admin.js — Script de inicialização do primeiro admin
// Instruções:
// 1. Acesse a página index.html e faça LOGIN com o e-mail/senha
//    que deseja tornar administrador (crie a conta pela tela de
//    login tentando entrar — NÃO, use o console do Firebase
//    Authentication para criar manualmente, ou use outro usuário
//    admin que já exista).
//
// 2. Após logar, abra o Console do Navegador (F12) e cole:
//
//    const uid = firebase.auth().currentUser.uid;
//    await firebase.firestore().collection('usuarios').doc(uid).set({
//      nome: 'Administrador',
//      email: firebase.auth().currentUser.email,
//      perfil: 'admin',
//      ativo: true,
//      criadoEm: firebase.firestore.FieldValue.serverTimestamp()
//    });
//    console.log('Admin criado! UID:', uid);
//
// 3. Recarregue a página — você será redirecionado ao Dashboard Admin.
// ============================================================

// Alternativamente, use o Firebase Console diretamente:
// 1. Vá em Authentication > Users > Add User
//    Informe e-mail e senha do administrador
//    Copie o UID gerado
//
// 2. Vá em Firestore > usuarios > Add Document
//    Document ID: "kCSIOPxf3rPrEQliyXxob8dH09r1"
//    Campos:
//      nome     (string): "Administrador"
//      email    (string): "ravelli1982@gmail.com"
//      perfil   (string): "admin"
//      ativo    (boolean): true
//      criadoEm (timestamp): "15/06/2026"
