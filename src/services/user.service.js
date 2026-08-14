import usersRepository from "../repositories/users.repository.js";
import { createHash, isValidPassword } from "../utils/hash.js";
import { generateToken } from "../utils/jwt.js";

class UserService {
  async registerUser({ first_name, last_name, email, password }) {
    
    const userExists = await usersRepository.getByEmail(email);

    if (userExists) {
      throw new Error("EMAIL_EXISTS");
    }

    const hashedPassword = await createHash(password);

    const newUser = await usersRepository.create({
      first_name: first_name,
      last_name: last_name,
      email: email,
      password: hashedPassword,
      role: "user"
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

export default new UserService();