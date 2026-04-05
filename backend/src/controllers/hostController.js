import * as userService from '../services/userService.js';

export async function becomeHost(req, res) {
  const { user, token } = await userService.promoteUserToHost(req.user.id);
  res.status(200).json({
    success: true,
    user,
    token,
  });
}
