import usersRepository from "../repositories/users.repository.js";
import { createHash } from "../utils/hash.js";

class SessionsService {
  async register(data) {
    const { first_name, last_name, email, password } = data;

    if (!first_name || !last_name || !email || !password) {
      throw new Error("Faltan campos obligatorios");
    }

    const normalizedEmail = normalizeEmail(email);

    if (!isValidEmail(normalizedEmail)) {
      throw new Error("El formato del email no es válido");
    }

    if (password.length < 8) {
      throw new Error("La contraseña debe tener al menos 8 caracteres");
    }

    const userExists = await usersRepository.getByEmail(normalizedEmail);

    if (userExists) {
      throw new Error("EMAIL_EXISTS");
    }

    const hashedPassword = await createHash(password);

    const newUser = await usersRepository.create({
      ...data,
      email: normalizedEmail,
      password: hashedPassword,
    });

    return {
      id: newUser._id,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      email: newUser.email,
      role: newUser.role,
    };
  }
}

const normalizeEmail = (email) => email.toLowerCase().trim();

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default new SessionsService();