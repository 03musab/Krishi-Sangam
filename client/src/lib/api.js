const API_BASE = '/api';

const TOKEN_KEY = 'krishisangam_token';
const USER_KEY = 'krishisangam_user';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

export function setUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

async function apiCall(endpoint, method = 'GET', body = null) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const config = { method, headers };
  if (body && method !== 'GET') config.body = JSON.stringify(body);

  const url = `${API_BASE}${endpoint}`;

  const res = await fetch(url, config);

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    throw new Error(`Server returned an unexpected response. Make sure the server is running.`);
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'API error');
  return data;
}

export async function apiUpload(file) {
  const token = getToken();
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload error');
  return data;
}

/* Auth */
export const signup = (data) => apiCall('/auth/signup', 'POST', data);
export const signin = (data) => apiCall('/auth/signin', 'POST', data);
export const signinOtp = (data) => apiCall('/auth/signin-otp', 'POST', data);
export const signout = () => apiCall('/auth/signout', 'POST');
export const fetchMe = () => apiCall('/auth/me');
export const sendOtp = (data) => apiCall('/auth/send-otp', 'POST', data);
export const verifyOtp = (data) => apiCall('/auth/verify-otp', 'POST', data);
export const register = (data) => apiCall('/auth/register', 'POST', data);
export const checkUsername = (username) => apiCall(`/auth/check-username?username=${encodeURIComponent(username)}`);

/* Services (agricultural services & labour teams) */
export const bookService = (data) => apiCall('/services/book', 'POST', data);
export const getMyServices = () => apiCall('/services/my');
export const updateService = (id, data) => apiCall(`/services/${id}`, 'PUT', data);

/* Land */
export const getLand = (params = '') => apiCall(`/land${params ? '?' + params : ''}`);
export const getMyLand = () => apiCall('/land/my');
export const createLand = (data) => apiCall('/land', 'POST', data);
export const updateLand = (id, data) => apiCall(`/land/${id}`, 'PUT', data);
export const deleteLand = (id) => apiCall(`/land/${id}`, 'DELETE');

/* Equipment */
export const getEquipment = (params = '') => apiCall(`/equipment${params ? '?' + params : ''}`);
export const getMyEquipment = () => apiCall('/equipment/my');
export const createEquipment = (data) => apiCall('/equipment', 'POST', data);
export const updateEquipment = (id, data) => apiCall(`/equipment/${id}`, 'PUT', data);
export const deleteEquipment = (id) => apiCall(`/equipment/${id}`, 'DELETE');

/* Labour */
export const getLabour = (params = '') => apiCall(`/labour${params ? '?' + params : ''}`);
export const getMyLabour = () => apiCall('/labour/my');
export const createLabour = (data) => apiCall('/labour', 'POST', data);
export const updateLabour = (id, data) => apiCall(`/labour/${id}`, 'PUT', data);
export const deleteLabour = (id) => apiCall(`/labour/${id}`, 'DELETE');

/* Produce */
export const getProduce = (params = '') => apiCall(`/produce${params ? '?' + params : ''}`);
export const getMyProduce = () => apiCall('/produce/my');
export const createProduce = (data) => apiCall('/produce', 'POST', data);
export const updateProduce = (id, data) => apiCall(`/produce/${id}`, 'PUT', data);
export const deleteProduce = (id) => apiCall(`/produce/${id}`, 'DELETE');

/* Bookings */
export const getMyBookings = () => apiCall('/bookings');
export const getIncomingBookings = () => apiCall('/bookings/incoming');
export const createBooking = (data) => apiCall('/bookings', 'POST', data);
export const updateBooking = (id, data) => apiCall(`/bookings/${id}`, 'PUT', data);
export const deleteBooking = (id) => apiCall(`/bookings/${id}`, 'DELETE');

/* Messages */
export const getConversations = () => apiCall('/messages');
export const getThread = (userId) => apiCall(`/messages/${userId}`);
export const sendMessage = (data) => apiCall('/messages', 'POST', data);
export const getUnreadCount = () => apiCall('/messages/unread/count');

/* Payments */
export const getMyPayments = () => apiCall('/payments');
export const createPayment = (data) => apiCall('/payments', 'POST', data);
export const releasePayment = (id) => apiCall(`/payments/${id}/release`, 'PUT');
export const refundPayment = (id) => apiCall(`/payments/${id}/refund`, 'PUT');

/* Profile */
export const getProfile = () => apiCall('/profile');
export const updateProfile = (data) => apiCall('/profile', 'PUT', data);
export const changePassword = (data) => apiCall('/profile/password', 'PUT', data);

/* Admin */
export const getAdminStats = () => apiCall('/admin/stats');
export const getPendingListings = (type = '') => apiCall(`/admin/listings/pending${type ? '?type=' + type : ''}`);
export const approveListing = (type, id, status) => apiCall(`/admin/approve/${type}/${id}`, 'PUT', { status });
export const getAdminUsers = (params = '') => apiCall(`/admin/users${params ? '?' + params : ''}`);
export const deleteUser = (id) => apiCall(`/admin/users/${id}`, 'DELETE');
