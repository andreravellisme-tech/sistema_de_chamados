// ============================================================
// ATENÇÃO: Substitua os valores abaixo pelas suas credenciais
// do Firebase Console > Configurações do projeto > Seus apps
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyBu7afq2XzjLN-gbi-ayLx_fjyCqJN0WVQ",
  authDomain: "sistema-de-chamados-b8185.firebaseapp.com",
  projectId: "sistema-de-chamados-b8185",
  storageBucket: "sistema-de-chamados-b8185.firebasestorage.app",
  messagingSenderId: "673764598147",
  appId: "1:673764598147:web:b8bd29d035a7d4e95096b6",
  measurementId: "G-Z19209LDSX"
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
