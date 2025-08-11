import { http, setAuthToken } from './client';

export const authApi = {
  register: async ({ name, email, password }) => {
    const res = await http.post('/api/auth/register', { name, email, password }, { auth: false });
    if (res?.token) setAuthToken(res.token);
    return res;
  },
  login: async ({ email, password }) => {
    const res = await http.post('/api/auth/login', { email, password }, { auth: false });
    if (res?.token) setAuthToken(res.token);
    return res;
  },
  me: () => http.get('/api/auth/me'),
  updateProfile: (payload) => http.put('/api/auth/me', payload),
  changePassword: ({ currentPassword, newPassword }) => http.put('/api/auth/change-password', { currentPassword, newPassword }),
  logout: () => setAuthToken(null),
};

export default authApi; 