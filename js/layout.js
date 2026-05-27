// ============================================================
// layout.js — Sidebar dinâmica por perfil + topbar
// ============================================================

const Layout = (() => {

  const menus = {
    admin: [
      { section: 'Principal' },
      { icon: '📊', label: 'Dashboard',       href: 'admin-dashboard.html',   id: 'dashboard' },
      { icon: '📋', label: 'Todos os Chamados', href: 'admin-chamados.html',  id: 'chamados' },
      { section: 'Gerenciamento' },
      { icon: '👥', label: 'Usuários',         href: 'admin-usuarios.html',   id: 'usuarios' },
      { icon: '🏫', label: 'Unidades Escolares', href: 'admin-unidades.html', id: 'unidades' },
      { section: 'Relatórios' },
      { icon: '📈', label: 'Relatórios',       href: 'admin-relatorios.html', id: 'relatorios' },
    ],
    tecnico: [
      { section: 'Principal' },
      { icon: '📊', label: 'Dashboard',        href: 'tecnico-dashboard.html',  id: 'dashboard' },
      { icon: '📋', label: 'Meus Chamados',    href: 'tecnico-chamados.html',   id: 'chamados' },
      { icon: '📂', label: 'Todos os Chamados', href: 'tecnico-todos.html',     id: 'todos' },
    ],
    solicitante: [
      { section: 'Principal' },
      { icon: '📊', label: 'Meus Chamados',   href: 'solicitante-dashboard.html', id: 'dashboard' },
      { icon: '➕', label: 'Novo Chamado',    href: 'solicitante-novo.html',      id: 'novo' },
    ],
  };

  function renderSidebar(perfil, paginaAtiva, dadosUsuario) {
    const itens = menus[perfil] || [];
    const nomeExibido = dadosUsuario?.nome || 'Usuário';
    const iniciais = nomeExibido.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
    const perfilLabel = { admin: 'Administrador', tecnico: 'Técnico de TI', solicitante: 'Solicitante' }[perfil] || perfil;

    let navHtml = '';
    itens.forEach(item => {
      if (item.section) {
        navHtml += `<div class="nav-section">${item.section}</div>`;
      } else {
        const ativo = item.id === paginaAtiva ? 'active' : '';
        const badge = item.id === 'chamados' ? `<span class="nav-badge" id="nav-badge-${item.id}" style="display:none">0</span>` : '';
        navHtml += `
          <a class="nav-item ${ativo}" href="${item.href}">
            <span class="nav-icon">${item.icon}</span>
            <span>${item.label}</span>
            ${badge}
          </a>`;
      }
    });

    const sidebarHtml = `
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-logo">
          <div class="logo-icon">🖥️</div>
          <div>
            <h1>TI Chamados</h1>
            <span>Suporte Escolar</span>
          </div>
        </div>
        <nav class="sidebar-nav">${navHtml}</nav>
        <div class="sidebar-footer">
          <div class="user-info">
            <div class="user-avatar">${iniciais}</div>
            <div>
              <div class="user-name">${sanitize(nomeExibido)}</div>
              <div class="user-role">${perfilLabel}</div>
            </div>
          </div>
          <button class="btn-logout" onclick="Auth.logout()">
            🚪 Sair do Sistema
          </button>
        </div>
      </aside>
      <div class="sidebar-overlay" id="sidebar-overlay" onclick="toggleSidebar()"></div>`;

    document.getElementById('sidebar-container').innerHTML = sidebarHtml;
  }

  function renderTopbar(titulo, acoes = '') {
    document.getElementById('topbar-container').innerHTML = `
      <header class="topbar">
        <button class="sidebar-toggle" onclick="toggleSidebar()">☰</button>
        <span class="topbar-title">${titulo}</span>
        <div class="topbar-actions">
          ${acoes}
          <button class="btn-notif" onclick="abrirPainelNotificacoes()" title="Notificações">
            🔔 <span id="notif-badge"></span>
          </button>
        </div>
      </header>`;
  }

  return { renderSidebar, renderTopbar };
})();

function toggleSidebar() {
  document.getElementById('sidebar')?.classList.toggle('open');
  document.getElementById('sidebar-overlay')?.classList.toggle('open');
}

// ── Painel de Notificações ────────────────────────────────────
async function abrirPainelNotificacoes() {
  const uid = Auth.getUser()?.uid;
  const perfil = Auth.getPerfil()?.perfil;
  if (!uid) return;

  let el = document.getElementById('notif-painel');
  if (!el) {
    el = document.createElement('div');
    el.id = 'notif-painel';
    el.innerHTML = `
      <div class="notif-overlay" onclick="fecharNotifPainel()"></div>
      <div class="notif-drawer">
        <div class="notif-header">
          <h3>🔔 Notificações</h3>
          <button onclick="marcarTodasLidas()" class="btn btn-xs btn-secondary">Marcar todas lidas</button>
          <button onclick="fecharNotifPainel()" class="modal-close">✕</button>
        </div>
        <div id="notif-list" class="notif-list"><div class="empty-state"><div class="empty-icon">🔔</div><p>Nenhuma notificação.</p></div></div>
      </div>`;
    el.style.cssText = 'position:fixed;inset:0;z-index:300;';
    document.body.appendChild(el);

    // Estilos do painel
    const style = document.createElement('style');
    style.textContent = `
      .notif-overlay{position:absolute;inset:0;background:#00000070;}
      .notif-drawer{position:absolute;top:0;right:0;width:360px;height:100vh;background:var(--bg2);border-left:1px solid var(--border);display:flex;flex-direction:column;animation:slideIn .25s ease;}
      @keyframes slideIn{from{transform:translateX(100%)}}
      .notif-header{display:flex;align-items:center;gap:10px;padding:18px 16px;border-bottom:1px solid var(--border);}
      .notif-header h3{flex:1;font-size:.95rem;}
      .notif-list{flex:1;overflow-y:auto;padding:8px 0;}
      .notif-item{padding:14px 16px;border-bottom:1px solid var(--border);cursor:pointer;transition:background .15s;}
      .notif-item:hover{background:var(--bg3);}
      .notif-item.unread{border-left:3px solid var(--accent);}
      .notif-item-title{font-size:.85rem;font-weight:600;margin-bottom:3px;}
      .notif-item-msg{font-size:.8rem;color:var(--text2);}
      .notif-item-time{font-size:.72rem;color:var(--text3);margin-top:4px;}
    `;
    document.head.appendChild(style);
  }
  el.style.display = 'block';

  // Carrega notificações
  await carregarNotificacoes(uid, perfil);
  await NotifManager.marcarLidas(uid);
}

async function carregarNotificacoes(uid, perfil) {
  const listEl = document.getElementById('notif-list');
  try {
    let query = db.collection('notificacoes').orderBy('criadoEm', 'desc').limit(30);
    const snap = await query.get();
    const minhas = snap.docs.filter(d => {
      const dest = d.data().destinatario;
      return dest === uid || dest === 'todos_tecnicos' && ['admin','tecnico'].includes(perfil);
    });
    if (minhas.length === 0) {
      listEl.innerHTML = `<div class="empty-state"><div class="empty-icon">🔔</div><p>Nenhuma notificação.</p></div>`;
      return;
    }
    listEl.innerHTML = minhas.map(d => {
      const n = d.data();
      const lida = n.lida ? '' : 'unread';
      return `<div class="notif-item ${lida}" onclick="irParaChamado('${n.chamadoId}')">
        <div class="notif-item-title">${sanitize(n.tipo === 'novo_chamado' ? '📋 Novo Chamado' : n.tipo === 'atribuido' ? '👤 Chamado Atribuído' : '🔄 Atualização')}</div>
        <div class="notif-item-msg">${sanitize(n.mensagem || '')}</div>
        <div class="notif-item-time">${tempoRelativo(n.criadoEm)}</div>
      </div>`;
    }).join('');
  } catch(e) {
    listEl.innerHTML = `<div class="empty-state"><p>Erro ao carregar notificações.</p></div>`;
  }
}

function fecharNotifPainel() {
  const el = document.getElementById('notif-painel');
  if (el) el.style.display = 'none';
}

async function marcarTodasLidas() {
  const uid = Auth.getUser()?.uid;
  if (uid) await NotifManager.marcarLidas(uid);
  fecharNotifPainel();
  Toast.success('Notificações marcadas como lidas.');
}

function irParaChamado(chamadoId) {
  if (!chamadoId) return;
  fecharNotifPainel();
  const perfil = Auth.getPerfil()?.perfil;
  const base = perfil === 'admin' ? 'admin-chamados.html' : perfil === 'tecnico' ? 'tecnico-chamados.html' : 'solicitante-dashboard.html';
  window.location.href = `${base}?chamado=${chamadoId}`;
}
