import { httpClient } from './httpClient';

export const authApi = {
  sendOtp: (phone, purpose = 'signup') =>
    httpClient('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, purpose })
    }),

  verifyOtp: (phone, code, purpose = 'signup') =>
    httpClient('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, code, purpose })
    }),

  register: (payload) =>
    httpClient('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  login: (phone, password) =>
    httpClient('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password })
    }),

  forgotPasswordReset: (payload) =>
    httpClient('/auth/forgot-password/reset', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getMe: () => httpClient('/auth/me')
};
