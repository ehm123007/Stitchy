const API_BASE = '/api';

export async function trackVisit(path = window.location.pathname) {
  try {
    await fetch(`${API_BASE}/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, referer: document.referrer || '' })
    });
  } catch (e) {
    // Silently fail for analytics tracking
  }
}

export async function getSettings() {
  const res = await fetch(`${API_BASE}/settings`);
  if (!res.ok) throw new Error('Failed to load settings');
  return res.json();
}

export async function updateSettings(data, token) {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update settings');
  return res.json();
}

export async function uploadBanglaQr(file, token) {
  const fd = new FormData();
  fd.append('qrImage', file);
  const res = await fetch(`${API_BASE}/settings/upload-qr`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: fd
  });
  if (!res.ok) throw new Error('Failed to upload Bangla QR code');
  return res.json();
}

export async function getProducts(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/products${qs ? `?${qs}` : ''}`);
  if (!res.ok) throw new Error('Failed to load products');
  return res.json();
}

export async function getProduct(id) {
  const res = await fetch(`${API_BASE}/products/${id}`);
  if (!res.ok) throw new Error('Product not found');
  return res.json();
}

export async function createProduct(data, token) {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create product');
  }
  return res.json();
}

export async function updateProduct(id, data, token) {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to update product');
  }
  return res.json();
}

export async function deleteProduct(id, token) {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to delete product');
  return res.json();
}

export async function adjustStock(id, data, token) {
  const res = await fetch(`${API_BASE}/products/${id}/adjust-stock`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to adjust stock');
  }
  return res.json();
}

export async function uploadProductImage(file, token) {
  const fd = new FormData();
  fd.append('image', file);
  const res = await fetch(`${API_BASE}/upload/product`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: fd
  });
  if (!res.ok) throw new Error('Failed to upload image');
  return res.json();
}

export async function validatePromoCode(code, subtotal) {
  const res = await fetch(`${API_BASE}/promo/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, subtotal })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Invalid promo code');
  return data;
}

export async function getPromos(token) {
  const res = await fetch(`${API_BASE}/promo`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch promo codes');
  return res.json();
}

export async function createPromo(data, token) {
  const res = await fetch(`${API_BASE}/promo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create promo code');
  }
  return res.json();
}

export async function updatePromo(id, data, token) {
  const res = await fetch(`${API_BASE}/promo/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update promo code');
  return res.json();
}

export async function deletePromo(id, token) {
  const res = await fetch(`${API_BASE}/promo/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to delete promo');
  return res.json();
}

export async function submitOrder(formData) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    body: formData // multipart/form-data
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Order could not be placed');
  return data;
}

export async function getOrders(params = {}, token) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/orders${qs ? `?${qs}` : ''}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to load orders');
  return res.json();
}

export async function updateOrderStatus(id, status, adminNotes, token) {
  const res = await fetch(`${API_BASE}/orders/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status, adminNotes })
  });
  if (!res.ok) throw new Error('Failed to update order status');
  return res.json();
}

export async function deleteOrder(id, token) {
  const res = await fetch(`${API_BASE}/orders/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to delete order');
  return res.json();
}

export async function clearAllOrders(token) {
  const res = await fetch(`${API_BASE}/orders/clear-all`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to clear orders');
  return res.json();
}

export async function clearAllProducts(token) {
  const res = await fetch(`${API_BASE}/products/clear-all`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to clear products');
  return res.json();
}

export async function sendOrderEmail(id, token) {
  const res = await fetch(`${API_BASE}/orders/${id}/send-email`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to send confirmation email');
  return res.json();
}

export async function getCustomers(token) {
  const res = await fetch(`${API_BASE}/customers`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to load customers');
  return res.json();
}

export async function getInventoryLogs(token) {
  const res = await fetch(`${API_BASE}/inventory/logs`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to load inventory logs');
  return res.json();
}

export async function getAnalytics(token) {
  const res = await fetch(`${API_BASE}/analytics`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to load analytics');
  return res.json();
}

export async function loginAdmin(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data;
}

export async function getTeam(token) {
  const res = await fetch(`${API_BASE}/auth/team`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to load team');
  return res.json();
}

export async function addTeamMember(data, token) {
  const res = await fetch(`${API_BASE}/auth/team`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to add team member');
  return json;
}

export async function deleteTeamMember(id, token) {
  const res = await fetch(`${API_BASE}/auth/team/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to delete member');
  return res.json();
}

export async function testEmailService(token) {
  const res = await fetch(`${API_BASE}/settings/test-email`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to send test email');
  return data;
}

export async function customerGoogleLogin(profile) {
  const res = await fetch(`${API_BASE}/customer/google-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Google login failed');
  return data;
}

export async function getCustomerOrders(email, phone = '') {
  const qs = new URLSearchParams({ email, phone }).toString();
  const res = await fetch(`${API_BASE}/customer/orders?${qs}`);
  if (!res.ok) throw new Error('Failed to load customer orders');
  return res.json();
}

export async function getSeoAndAds() {
  const res = await fetch(`${API_BASE}/seo`);
  if (!res.ok) throw new Error('Failed to load SEO data');
  return res.json();
}

export async function updateSeo(data, token) {
  const res = await fetch(`${API_BASE}/settings/seo`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update SEO');
  return res.json();
}

export async function updateGoogleAds(data, token) {
  const res = await fetch(`${API_BASE}/settings/google-ads`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update Google Ads');
  return res.json();
}

export async function getSystemStatus() {
  try {
    const res = await fetch(`${API_BASE}/system/status`);
    if (!res.ok) return { mongoConnected: false, storageMode: 'ephemeral_disk' };
    return res.json();
  } catch (e) {
    return { mongoConnected: false, storageMode: 'ephemeral_disk' };
  }
}

export async function downloadStoreBackup(token) {
  const res = await fetch(`${API_BASE}/backup/export`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to generate store backup');
  return res.json();
}

export async function restoreStoreBackup(backupData, token) {
  const res = await fetch(`${API_BASE}/backup/import`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(backupData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to restore store backup');
  return data;
}
