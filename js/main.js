/* KrishiSetu — js/main.js (Core app logic) */

function navigateTo(viewId) {
  document.querySelectorAll('.page-view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById(viewId);
  if (target) target.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navMap = {
    'view-home': 'nav-home', 'view-land-leasing': 'nav-land', 'view-list-land': 'nav-land',
    'view-equipment-rental': 'nav-equipment', 'view-list-equipment': 'nav-equipment',
    'view-labour': 'nav-labour', 'view-list-labour': 'nav-labour',
    'view-admin': 'nav-admin', 'view-signin': 'nav-signin', 'view-signup': 'nav-signup'
  };
  const navId = navMap[viewId];
  if (navId) { const el = document.getElementById(navId); if (el) el.classList.add('active'); }
  const navLinks = document.getElementById('navLinks');
  if (navLinks) navLinks.classList.remove('show');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showToast(msg, duration = 3000) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  if (!toast || !toastMsg) return;
  toastMsg.textContent = msg;
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; }, duration);
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-item').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const map = {
        'nav-home': 'view-home', 'nav-land': 'view-land-leasing',
        'nav-equipment': 'view-equipment-rental', 'nav-labour': 'view-labour',
        'nav-admin': 'view-admin'
      };
      navigateTo(map[link.id] || 'view-home');
      if (link.id === 'nav-land') loadLandListings();
      if (link.id === 'nav-equipment') loadEquipmentListings();
      if (link.id === 'nav-labour') loadLabourListings();
      if (link.id === 'nav-admin') loadAdminData();
    });
  });

  document.getElementById('findLandBtn')?.addEventListener('click', () => { navigateTo('view-land-leasing'); loadLandListings(); });
  document.getElementById('findEquipmentBtn')?.addEventListener('click', () => { navigateTo('view-equipment-rental'); loadEquipmentListings(); });
  document.getElementById('findProfessionalsBtn')?.addEventListener('click', () => { navigateTo('view-labour'); loadLabourListings(); });
  document.getElementById('actionSellProduce')?.addEventListener('click', () => navigateTo('view-produce'));
  document.getElementById('actionListLand')?.addEventListener('click', () => navigateTo('view-list-land'));
  document.getElementById('actionListEquipment')?.addEventListener('click', () => navigateTo('view-list-equipment'));
  document.getElementById('actionFarmLabour')?.addEventListener('click', () => { navigateTo('view-labour'); loadLabourListings(); });

  document.getElementById('btnBackFromListLand')?.addEventListener('click', () => navigateTo('view-land-leasing'));
  document.getElementById('btnBackFromListEquipment')?.addEventListener('click', () => navigateTo('view-equipment-rental'));
  document.getElementById('btnBackFromListLabour')?.addEventListener('click', () => navigateTo('view-labour'));
  document.getElementById('btnBackFromListProduce')?.addEventListener('click', () => navigateTo('view-produce'));
  document.getElementById('btnBackFromAdmin')?.addEventListener('click', () => navigateTo('view-home'));

  document.getElementById('btnGoListLand')?.addEventListener('click', () => navigateTo('view-list-land'));
  document.getElementById('btnGoListEquipment')?.addEventListener('click', () => navigateTo('view-list-equipment'));
  document.getElementById('btnGoListLabour')?.addEventListener('click', () => navigateTo('view-list-labour'));
  document.getElementById('btnGoListProduce')?.addEventListener('click', () => navigateTo('view-list-produce'));

  document.getElementById('nav-signin-btn')?.addEventListener('click', () => navigateTo('view-signin'));
  document.getElementById('nav-signup-btn')?.addEventListener('click', () => navigateTo('view-signup'));
  document.getElementById('goto-signup')?.addEventListener('click', (e) => { e.preventDefault(); navigateTo('view-signup'); });
  document.getElementById('goto-signin')?.addEventListener('click', (e) => { e.preventDefault(); navigateTo('view-signin'); });
  /* ── User dropdown toggle (open/close) ── */
  const userMenuBtn = document.getElementById('nav-user-btn');
  const userDropdown = document.getElementById('nav-user-dropdown');
  if (userMenuBtn && userDropdown) {
    userMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle('open');
    });
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
        userDropdown.classList.remove('open');
      }
    });
  }

  /* ── Dropdown menu items (user menu) ── */
  function closeDropdown() {
    const dd = document.getElementById('nav-user-dropdown');
    if (dd) dd.classList.remove('open');
  }
  document.getElementById('dd-bookings')?.addEventListener('click', () => { closeDropdown(); navigateTo('view-bookings'); loadBookings(); });
  document.getElementById('dd-messages')?.addEventListener('click', () => { closeDropdown(); navigateTo('view-messages'); loadConversations(); });
  document.getElementById('dd-produce')?.addEventListener('click', () => { closeDropdown(); navigateTo('view-produce'); loadProduceListings(); });
  document.getElementById('nav-profile-link')?.addEventListener('click', () => { closeDropdown(); navigateTo('view-profile'); loadProfile(); });

  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (hamburger && navLinks) hamburger.addEventListener('click', () => navLinks.classList.toggle('show'));

  document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      const container = btn.closest('.admin-card-container') || btn.parentElement.parentElement;
      container.querySelectorAll('.admin-tab-content').forEach(t => t.style.display = 'none');
      container.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
      const tabEl = document.getElementById(tabId);
      if (tabEl) tabEl.style.display = 'block';
      btn.classList.add('active');
      if (tabId === 'admin-analytics') loadAdminData();
      if (tabId === 'admin-pending') loadAdminPending();
      if (tabId === 'admin-users') loadAdminUsers();
    });
  });

  let searchTimers = {};
  ['searchLandInput','searchEquipInput','searchLabourInput','searchProduceInput'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', (e) => {
      clearTimeout(searchTimers[id]);
      searchTimers[id] = setTimeout(() => {
        if (id === 'searchLandInput') loadLandListings(e.target.value);
        if (id === 'searchEquipInput') loadEquipmentListings(e.target.value);
        if (id === 'searchLabourInput') loadLabourListings(e.target.value);
        if (id === 'searchProduceInput') loadProduceListings(e.target.value);
      }, 300);
    });
  });

  document.querySelectorAll('.stat-number').forEach(el => {
    const target = parseInt(el.dataset.target);
    if (!target) return;
    let current = 0;
    const step = Math.max(1, Math.floor(target / 40));
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { current = target; clearInterval(timer); }
      el.textContent = current;
    }, 30);
  });
});
