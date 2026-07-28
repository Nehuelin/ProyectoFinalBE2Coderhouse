export const getEvents = async (req, res) => {
  try {
    res.json({ message: 'Listado de eventos' })
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener eventos' })
  }
}

export const createEvent = async (req, res) => {
  try {
    res.json({ message: 'Crear evento' })
  } catch (error) {
    res.status(500).json({ error: 'Error al crear evento' })
  }
}