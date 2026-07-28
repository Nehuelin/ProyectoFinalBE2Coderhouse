export const getSession = async (req, res) => {
  try {
    res.json({
      status: 'success',
      sessionToken: 'abc123'
    })
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el token de sesion' })
  }
}