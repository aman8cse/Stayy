import * as authService from '../services/authService.js';

export async function signup(req, res) {
  const { name, email, password, phone } = req.body ?? {};
  const { user, token } = await authService.signupUser({ name, email, password, phone });
  res.status(201).json({
    success: true,
    user,
    token,
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
