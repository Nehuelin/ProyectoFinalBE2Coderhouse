import { verifyToken } from "../utils/jwt.js";

export const auth = (req, res, next) => {
  try {
    const token = req.cookies?.currentUser;

    if (!token) {
      return res.status(401).json({
        error: "Autenticación requerida",
      });
    }

    const payload = verifyToken(token);

    req.user = {
      userid: payload.id,
      email: payload.email,
      role: payload.role
    }

    next();

  } catch (error) {

    return res.status(401).json({
      error: "No autenticado",
    })
  }
}