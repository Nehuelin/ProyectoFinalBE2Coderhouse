import jwt from "jsonwebtoken"

export const generateToken = user => {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      role: user.role
    }, 
    process.env.JWT_SECRET_KEY, 
    {
      expiresIn: process.env.JWT_EXPIRES_IN
    }
  )
}

export const verifyToken = token => {
    return jwt.verify(token, process.env.JWT_SECRET_KEY);
}