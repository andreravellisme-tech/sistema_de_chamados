// ============================================================
// ATENÇÃO: Substitua os valores abaixo pelas suas credenciais
// do Firebase Console > Configurações do projeto > Seus apps
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyA_JFdju1pcwYayX5J3Nh-Fru0gKteXGbw",
  authDomain: "ti-chamados-escolar.firebaseapp.com",
  projectId: "ti-chamados-escolar",
  storageBucket: "ti-chamados-escolar.firebasestorage.app",
  messagingSenderId: "403272914832",
  appId: "1:403272914832:web:f400eb38304a06fb5b8515",
  measurementId: "G-8N57XX2EZQ"
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
