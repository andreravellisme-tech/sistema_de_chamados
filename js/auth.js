// ============================================================
// auth.js — Autenticação, sessão e controle de perfil
// ============================================================

const Auth = (() => {
  let currentUser = null;
  let currentPerfil = null;

  // Rate limiting para tentativas de login
  const loginAttempts = {};
  const MAX_ATTEMPTS = 5;
  const BLOCK_TIME = 15 * 60 * 1000; // 15 minutos

  function checkRateLimit(email) {
    const now = Date.now();
    if (!loginAttempts[email]) return true;
    const { count, firstAttempt, blocked } = loginAttempts[email];
    if (blocked && now - blocked < BLOCK_TIME) return false;
    if (blocked && now - blocked >= BLOCK_TIME) {
      delete loginAttempts[email];
      return true;
    }
    return count < MAX_ATTEMPTS;
  }

  function registerFailedAttempt(email) {
    const now = Date.now();
    if (!loginAttempts[email]) {
      loginAttempts[email] = { count: 1, firstAttempt: now };
    } else {
      loginAttempts[email].count++;
      if (loginAttempts[email].count >= MAX_ATTEMPTS) {
        loginAttempts[email].blocked = now;
      }
    }
  }

  function clearAttempts(email) {
    delete loginAttempts[email];
  }

  // Login com e-mail e senha
  async function login(email, password) {
    email = email.trim().toLowerCase();

    if (!checkRateLimit(email)) {
      const minutos = Math.ceil(BLOCK_TIME / 60000);
      throw new Error(`Muitas tentativas. Aguarde ${minutos} minutos.`);
    }

    try {
      await auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
      const cred = await auth.signInWithEmailAndPassword(email, password);
      clearAttempts(email);

      // Verifica se usuário está ativo
      const snap = await db.collection('usuarios').doc(cred.user.uid).get();
      if (!snap.exists || snap.data().ativo === false) {
        await auth.signOut();
        throw new Error('Conta desativada. Contate o administrador.');
      }

      return cred.user;
    } catch (err) {
      if (
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/invalid-credential'
      ) {
        registerFailedAttempt(email);
        throw new Error('E-mail ou senha inválidos.');
      }
      throw err;
    }
  }

  // Logout
  async function logout() {
    currentUser = null;
    currentPerfil = null;
    await auth.signOut();
    window.location.href = '/index.html';
  }

  // Observa mudanças de autenticação
  function onAuthChange(callback) {
    return auth.onAuthStateChanged(async user => {
      if (user) {
        currentUser = user;
        try {
          const snap = await db.collection('usuarios').doc(user.uid).get();
          currentPerfil = snap.exists ? snap.data() : null;
        } catch {
          currentPerfil = null;
        }
      } else {
        currentUser = null;
        currentPerfil = null;
      }
      callback(user, currentPerfil);
    });
  }

  // Retorna perfil em cache
  function getPerfil() { return currentPerfil; }
  function getUser() { return currentUser; }

  // Requer autenticação — redireciona se não logado
  async function requireAuth(perfilPermitido = null) {
    return new Promise(resolve => {
      const unsub = auth.onAuthStateChanged(async user => {
        unsub();
        if (!user) {
          window.location.href = '/index.html';
          return;
        }
        const snap = await db.collection('usuarios').doc(user.uid).get();
        const perfil = snap.exists ? snap.data() : null;
        if (!perfil || perfil.ativo === false) {
          await auth.signOut();
          window.location.href = '/index.html';
          return;
        }
        if (perfilPermitido && !perfilPermitido.includes(perfil.perfil)) {
          window.location.href = '/pages/acesso-negado.html';
          return;
        }
        currentUser = user;
        currentPerfil = perfil;
        resolve({ user, perfil });
      });
    });
  }

  // Redefinir senha
  async function resetPassword(email) {
    await auth.sendPasswordResetEmail(email.trim().toLowerCase());
  }

  return { login, logout, onAuthChange, getPerfil, getUser, requireAuth, resetPassword };
})();
