/* ═══════════════════════════════════════════
   KrishiSetu — js/api.js
   (Centralized API helper)
   ═══════════════════════════════════════════ */

const API_BASE = (window.location.protocol === 'file:')
  ? 'http://localhost:3001/api'
  : '/api';

function getToken() {
  return localStorage.getItem('krishisetu_token');
}

function setToken(token) {
  localStorage.setItem('krishisetu_token', token);
}

function clearToken() {
  localStorage.removeItem('krishisetu_token');
  localStorage.removeItem('krishisetu_user');
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('krishisetu_user'));
  } catch { return null; }
}

function setUser(user) {
  localStorage.setItem('krishisetu_user', JSON.stringify(user));
}

async function apiCall(endpoint, method = 'GET', body = null) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const config = { method, headers };
  if (body && method !== 'GET') config.body = JSON.stringify(body);

  const url = `${API_BASE}${endpoint}`;
  console.log(`[API] ${method} ${url}`);

  const res = await fetch(url, config);
  
  // Check content type before parsing
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    console.error(`[API] Expected JSON but got ${contentType}. Response:`, text.substring(0, 200));
    throw new Error(`Server returned HTML instead of JSON. Make sure the server is running at ${API_BASE}`);
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'API error');
  return data;
}

async function apiUpload(file) {
  const token = getToken();
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    body: formData
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload error');
  return data;
}

/* ── Auth ── */
async function signup(data) { return apiCall('/auth/signup', 'POST', data); }
async function signin(data) { return apiCall('/auth/signin', 'POST', data); }
async function signout() { return apiCall('/auth/signout', 'POST'); }
async function fetchMe() { return apiCall('/auth/me'); }

/* ── Land ── */
async function getLand(params = '') { return apiCall(`/land${params ? '?' + params : ''}`); }
async function getMyLand() { return apiCall('/land/my'); }
async function createLand(data) { return apiCall('/land', 'POST', data); }
async function updateLand(id, data) { return apiCall(`/land/${id}`, 'PUT', data); }
async function deleteLand(id) { return apiCall(`/land/${id}`, 'DELETE'); }

/* ── Equipment ── */
async function getEquipment(params = '') { return apiCall(`/equipment${params ? '?' + params : ''}`); }
async function getMyEquipment() { return apiCall('/equipment/my'); }
async function createEquipment(data) { return apiCall('/equipment', 'POST', data); }
async function updateEquipment(id, data) { return apiCall(`/equipment/${id}`, 'PUT', data); }
async function deleteEquipment(id) { return apiCall(`/equipment/${id}`, 'DELETE'); }

/* ── Labour ── */
async function getLabour(params = '') { return apiCall(`/labour${params ? '?' + params : ''}`); }
async function getMyLabour() { return apiCall('/labour/my'); }
async function createLabour(data) { return apiCall('/labour', 'POST', data); }
async function updateLabour(id, data) { return apiCall(`/labour/${id}`, 'PUT', data); }
async function deleteLabour(id) { return apiCall(`/labour/${id}`, 'DELETE'); }

/* ── Produce ── */
async function getProduce(params = '') { return apiCall(`/produce${params ? '?' + params : ''}`); }
async function getMyProduce() { return apiCall('/produce/my'); }
async function createProduce(data) { return apiCall('/produce', 'POST', data); }
async function updateProduce(id, data) { return apiCall(`/produce/${id}`, 'PUT', data); }
async function deleteProduce(id) { return apiCall(`/produce/${id}`, 'DELETE'); }

/* ── Bookings ── */
async function getMyBookings() { return apiCall('/bookings'); }
async function getIncomingBookings() { return apiCall('/bookings/incoming'); }
async function createBooking(data) { return apiCall('/bookings', 'POST', data); }
async function updateBooking(id, data) { return apiCall(`/bookings/${id}`, 'PUT', data); }
async function deleteBooking(id) { return apiCall(`/bookings/${id}`, 'DELETE'); }

/* ── Messages ── */
async function getConversations() { return apiCall('/messages'); }
async function getThread(userId) { return apiCall(`/messages/${userId}`); }
async function sendMessage(data) { return apiCall('/messages', 'POST', data); }
async function getUnreadCount() { return apiCall('/messages/unread/count'); }

/* ── Payments ── */
async function getMyPayments() { return apiCall('/payments'); }
async function createPayment(data) { return apiCall('/payments', 'POST', data); }
async function releasePayment(id) { return apiCall(`/payments/${id}/release`, 'PUT'); }
async function refundPayment(id) { return apiCall(`/payments/${id}/refund`, 'PUT'); }

/* ── Profile ── */
async function getProfile() { return apiCall('/profile'); }
async function updateProfile(data) { return apiCall('/profile', 'PUT', data); }
async function changePassword(data) { return apiCall('/profile/password', 'PUT', data); }

/* ── Admin ── */
async function getAdminStats() { return apiCall('/admin/stats'); }
async function getPendingListings(type = '') { return apiCall(`/admin/listings/pending${type ? '?type=' + type : ''}`); }
async function approveListing(type, id, status) { return apiCall(`/admin/approve/${type}/${id}`, 'PUT', { status }); }
async function getAdminUsers(params = '') { return apiCall(`/admin/users${params ? '?' + params : ''}`); }
async function deleteUser(id) { return apiCall(`/admin/users/${id}`, 'DELETE'); }
