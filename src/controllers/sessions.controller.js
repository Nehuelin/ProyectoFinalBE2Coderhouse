import { generateToken } from "../utils/jwt.js";
import { UserDTO } from "../dto/user.dto.js";

export const register = async (req, res) => {
  res.status(201).json({
    status: 'success',
    message: 'Usuario registrado correctamente',
  });
};

export const login = async (req, res) => {
  try {

    const user = req.user;

    const token = generateToken(user); 

    res.cookie("currentUser", token, {httpOnly: true, sameSite: 'lax', maxAge: 60*60*1000, secure: process.env.NODE_ENV === 'production'}); 
    
    res.status(200).json({
      status: 'success',
      message: 'Usuario logueado correctamente',
      token: token
    });

  } catch (error) {
    
    console.error(error);

    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor"
    })
  }
};

export const githubCallback = async (req, res) => {
  try {

    const user = req.user;
    const token = generateToken(user); 

    res.cookie("currentUser", token, {httpOnly: true, sameSite: 'lax', maxAge: 60*60*1000, secure: process.env.NODE_ENV === 'production'}); 
    
    res.status(200).json({
      status: 'success',
      message: 'Usuario logueado correctamente con GitHub',
      token: token
    });

  } catch (error) {
    
    console.error(error);

    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor"
    })
  }
}

export const getCurrentUser = (req, res) => {
  try {

    const user = req.user;

    const userDTO = new UserDTO(user);
    
    return res.status(200).json({
      status: "success",
      payload: userDTO
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor"
    });
  }
}

export const logout = (req, res) => {
  res.clearCookie("currentUser", {httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict"});

  return res.status(200).json({
    status: "success",
    message: "Sesión cerrada"
  });
};
