import userService from "../services/user.service.js";

export const getAllUsers = async (req, res) => {
  const payload = await userService.getAllUsers();

  res.status(200).json({
    status: 'success',
    users: payload
  })
}