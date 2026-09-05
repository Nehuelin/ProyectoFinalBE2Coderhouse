import userRepository from "../repositories/user.repository.js";
import { createHash, isValidPassword } from "../utils/hash.js";
import { normalizeEmail } from "../utils/emailFunctions.js";

class UserService {
  async registerUser({ first_name, last_name, email, password }) {
    
    const userExists = await userRepository.getByEmail(email);

    if (userExists) {
      throw new Error("EMAIL_EXISTS");
    }

    const hashedPassword = await createHash(password);

    const newUser = await userRepository.createUser({
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

  async registerGithubUser({ first_name, last_name, email, providerId }){
    const normalizedEmail = normalizeEmail(email);

    let user = await userRepository.getByEmail(normalizedEmail);

    if (user){
      return user;
    }

    user = await userRepository.createUser({
      first_name, 
      last_name, 
      email: normalizedEmail, 
      password: null, 
      role: "user", 
      provider: "github", 
      providerId
    });

    return user;
  }

  async getAllUsers() {
    users = await userRepository.getAll();

    return users;
  }
}

export default new UserService();