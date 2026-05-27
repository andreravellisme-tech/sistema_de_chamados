// ============================================================
// ATENÇÃO: Substitua os valores abaixo pelas suas credenciais
// do Firebase Console > Configurações do projeto > Seus apps
// ============================================================

const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "SEU_PROJECT_ID.firebaseapp.com",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_PROJECT_ID.appspot.com",
  messagingSenderId: "SEU_MESSAGING_SENDER_ID",
  appId: "SEU_APP_ID"
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);

// Instâncias globais
const auth = firebase.auth();
const db = firebase.firestore();

// Configurações de segurança do Firestore
db.settings({ experimentalForceLongPolling: false });

// Persistência offline (opcional, melhora UX)
db.enablePersistence({ synchronizeTabs: true }).catch(err => {
  if (err.code === 'failed-precondition') {
    console.warn('Persistência offline: múltiplas abas abertas.');
  } else if (err.code === 'unimplemented') {
    console.warn('Persistência offline não suportada neste navegador.');
  }
});
