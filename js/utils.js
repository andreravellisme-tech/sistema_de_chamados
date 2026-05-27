// ============================================================
// utils.js — Utilitários, notificações e helpers globais
// ============================================================

// ── Notificações Toast ──────────────────────────────────────
const Toast = (() => {
  function show(msg, tipo = 'info', duracao = 4000) {
    const container = document.getElementById('toast-container') || criarContainer();
    const toast = document.createElement('div');
    const icons = { success: '✔', error: '✖', info: 'ℹ', warning: '⚠' };
    toast.className = `toast toast-${tipo}`;
    toast.innerHTML = `<span class="toast-icon">${icons[tipo] || 'ℹ'}</span><span class="toast-msg">${msg}</span>`;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, duracao);
  }

  function criarContainer() {
    const c = document.createElement('div');
    c.id = 'toast-container';
    document.body.appendChild(c);
    return c;
  }

  return { show, success: m => show(m, 'success'), error: m => show(m, 'error'), warning: m => show(m, 'warning'), info: m => show(m, 'info') };
})();

// ── Formatadores ────────────────────────────────────────────
function formatarData(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatarDataCurta(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('pt-BR');
}

function tempoRelativo(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'agora mesmo';
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h}h`;
  const dias = Math.floor(h / 24);
  if (dias < 7) return `há ${dias} dia${dias > 1 ? 's' : ''}`;
  return formatarDataCurta(ts);
}

// ── Badges de Status ─────────────────────────────────────────
const STATUS_CONFIG = {
  aberto:       { label: 'Aberto',       cor: '#e74c3c', icon: '🔴' },
  andamento:    { label: 'Em Andamento', cor: '#f39c12', icon: '🟡' },
  aguardando:   { label: 'Aguardando',   cor: '#3498db', icon: '🔵' },
  resolvido:    { label: 'Resolvido',    cor: '#27ae60', icon: '🟢' },
  cancelado:    { label: 'Cancelado',    cor: '#95a5a6', icon: '⚫' },
};

const PRIORIDADE_CONFIG = {
  baixa:   { label: 'Baixa',   cor: '#27ae60' },
  media:   { label: 'Média',   cor: '#f39c12' },
  alta:    { label: 'Alta',    cor: '#e67e22' },
  critica: { label: 'Crítica', cor: '#e74c3c' },
};

function badgeStatus(status) {
  const c = STATUS_CONFIG[status] || { label: status, cor: '#888' };
  return `<span class="badge" style="background:${c.cor}20;color:${c.cor};border:1px solid ${c.cor}40">${c.icon || ''} ${c.label}</span>`;
}

function badgePrioridade(prioridade) {
  const c = PRIORIDADE_CONFIG[prioridade] || { label: prioridade, cor: '#888' };
  return `<span class="badge-prioridade" style="background:${c.cor}20;color:${c.cor};border:1px solid ${c.cor}40">${c.label}</span>`;
}

// ── Modal Genérico ───────────────────────────────────────────
function abrirModal(id) {
  const m = document.getElementById(id);
  if (m) { m.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
}
function fecharModal(id) {
  const m = document.getElementById(id);
  if (m) { m.style.display = 'none'; document.body.style.overflow = ''; }
}

// Fechar modal clicando fora
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.style.display = 'none';
    document.body.style.overflow = '';
  }
});

// ── Loading ──────────────────────────────────────────────────
function showLoading(texto = 'Carregando...') {
  let el = document.getElementById('global-loading');
  if (!el) {
    el = document.createElement('div');
    el.id = 'global-loading';
    el.innerHTML = `<div class="loading-box"><div class="spinner"></div><p>${texto}</p></div>`;
    document.body.appendChild(el);
  } else {
    el.querySelector('p').textContent = texto;
    el.style.display = 'flex';
  }
}
function hideLoading() {
  const el = document.getElementById('global-loading');
  if (el) el.style.display = 'none';
}

// ── Sanitização básica ───────────────────────────────────────
function sanitize(str) {
  if (!str) return '';
  return String(str).replace(/[<>&"'/]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#x27;','/':'&#x2F;'}[c]));
}

// ── Notificações em tempo real (sino) ────────────────────────
const NotifManager = (() => {
  let unsubscribe = null;
  let badgeEl = null;

  function iniciar(uid, perfil) {
    badgeEl = document.getElementById('notif-badge');
    if (!uid) return;

    let query = db.collection('notificacoes').where('lida', '==', false);

    // Admin e técnico veem tudo não lido direcionado a eles
    if (perfil === 'admin' || perfil === 'tecnico') {
      query = query.where('destinatario', 'in', [uid, 'todos_tecnicos']);
    } else {
      query = query.where('destinatario', '==', uid);
    }

    unsubscribe = query.onSnapshot(snap => {
      const count = snap.size;
      if (badgeEl) {
        badgeEl.textContent = count > 9 ? '9+' : count;
        badgeEl.style.display = count > 0 ? 'flex' : 'none';
      }

      // Som e notificação do browser para novos chamados
      snap.docChanges().forEach(change => {
        if (change.type === 'added') {
          const data = change.doc.data();
          if (data.tipo === 'novo_chamado' && Notification.permission === 'granted') {
            new Notification('📋 Novo Chamado', {
              body: data.mensagem || 'Um novo chamado foi aberto.',
              icon: '/assets/icon-192.png'
            });
          }
        }
      });
    }, err => console.warn('Notif error:', err));
  }

  function parar() {
    if (unsubscribe) { unsubscribe(); unsubscribe = null; }
  }

  async function marcarLidas(uid) {
    const snap = await db.collection('notificacoes')
      .where('destinatario', '==', uid)
      .where('lida', '==', false)
      .get();
    const batch = db.batch();
    snap.docs.forEach(d => batch.update(d.ref, { lida: true }));
    await batch.commit();
  }

  async function criarNotificacao(destinatario, tipo, mensagem, chamadoId = null) {
    await db.collection('notificacoes').add({
      destinatario,
      tipo,
      mensagem,
      chamadoId,
      lida: false,
      criadoEm: firebase.firestore.FieldValue.serverTimestamp()
    });
  }

  return { iniciar, parar, marcarLidas, criarNotificacao };
})();

// ── Solicitar permissão de notificação ───────────────────────
async function solicitarPermissaoNotificacao() {
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission();
  }
}
