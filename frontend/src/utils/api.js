const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function isFormData(body) {
  return typeof FormData !== 'undefined' && body instanceof FormData;
}

export async function apiRequest(path, options = {}) {
  const { method = 'GET', body, headers, ...rest } = options;
  const requestHeaders = new Headers(headers || {});
  
  // ดึง Token จาก LocalStorage
  const token = localStorage.getItem('token'); 
  if (token) {
    // ถ้ามี Token ให้แนบไปใน Header ว่า "Bearer <token>"
    requestHeaders.set('Authorization', `Bearer ${token}`);
  }

  const config = {
    method,
    credentials: options.credentials ?? 'include', // เก็บไว้เผื่อ Backend ใช้ Cookie ด้วย
    ...rest
  };

  if (body !== undefined) {
    if (isFormData(body) || body instanceof Blob) {
      config.body = body;
    } else if (typeof body === 'string') {
      if (!requestHeaders.has('Content-Type')) {
        requestHeaders.set('Content-Type', 'application/json');
      }
      config.body = body;
    } else {
      requestHeaders.set('Content-Type', requestHeaders.get('Content-Type') || 'application/json');
      config.body = JSON.stringify(body);
    }
  }

  if ([...requestHeaders.keys()].length > 0) {
    config.headers = requestHeaders;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, config);
  
  // (ส่วนการจัดการ Response)
  const contentType = response.headers.get('content-type') || '';
  let data;
  if (contentType.includes('application/json')) {
    data = await response.json().catch(() => null);
  } else {
    data = await response.text().catch(() => null);
  }

  if (!response.ok) {
    const error = new Error(data && data.message ? data.message : response.statusText);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export { API_BASE_URL };