import sessionsService from "../services/sessions.service.js";
import { createHash, isValidPassword } from "../utils/hash.js";

export const register = async (req, res) => {
  try {
    const result = await sessionsService.register(req.body);
    
    res.status(201).json({
      status: 'success',
      message: 'Usuario registrado correctamente',
      payload: result
    });

  } catch (error) {
    if (error.message === "EMAIL_EXISTS") {

      return res.status(409).json({
        status: 'error',
        message: 'Ya existe un usuario registrado con ese email'
      });

    } else {

      return res.status(400).json({
        status: 'error',
        message: error.message
      })
    }
  };
};