import * as authService from '../services/authService.js';

export async function signup(req, res) {
  const { name, email, password, phone } = req.body ?? {};
  const { user, token, message } = await authService.signupUser({ name, email, password, phone });
  res.status(201).json({
    success: true,
    user,
    token,
    message,
  });
}

export async function login(req, res) {
  const { email, password } = req.body ?? {};
  const { user, token } = await authService.loginUser({ email, password });
  res.status(200).json({
    success: true,
    user,
    token,
  });
}

export async function verifyOTP(req, res) {
  const { email, otpCode } = req.body ?? {};
  const { user } = await authService.verifyOTP(email, otpCode);
  res.status(200).json({
    success: true,
    user,
    message: 'Email verified successfully',
  });
}

export async function resendOTP(req, res) {
  const { email } = req.body ?? {};
  const { message } = await authService.resendOTP(email);
  res.status(200).json({
    success: true,
    message,
  });
}

export async function forgotPassword(req, res) {
  const { email } = req.body ?? {};
  const { message } = await authService.forgotPassword(email);
  res.status(200).json({
    success: true,
    message,
  });
}

export async function resetPassword(req, res) {
  const { email, otpCode, newPassword } = req.body ?? {};
  const { message } = await authService.resetPassword({ email, otpCode, newPassword });
  res.status(200).json({
    success: true,
    message,
  });
}
