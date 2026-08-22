import UserRepository from "../repositories/user.repository.js"

export const getAllUsers = async (req, res) => {
  const payload = await UserRepository.getAll();

  res.status(200).json({
    status: 'success',
    users: payload
  })
}