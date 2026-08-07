import sessionsService from "../services/sessions.service.js";

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

export const login = async (req, res) => {
  try {
    const result = await sessionsService.login(req.body);

    res.cookie("currentUser", result.token, {httpOnly: true, sameSite: 'lax', maxAge: 60*60*1000, secure: process.env.NODE_ENV === 'production'}); 
    
    res.status(200).json({
      status: 'success',
      message: 'Usuario logueado correctamente',
      token: result.token
    });

  } catch (error) {
    if (error.message === "INVALID_CREDENTIALS") {

      return res.status(401).json({
        status: 'error',
        message: 'Credenciales inválidas'
      });

    } else {

      return res.status(400).json({
        status: 'error',
        message: error.message
      })

    }
  }
};

export const getCurrentUser = (req, res) => {
  return res.status(200).json(req.user);
}

export const logout = (req, res) => {
  res.clearCookie("currentUser", {httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict"});

  return res.status(200).json({
    status: "success",
    message: "Sesión cerrada"
  });
};
