import { UserDAO } from "../dao/user.dao.js";

class UserRepository {
  constructor() {
    this.dao = new UserDAO();
  }

  async getAll(filter = {}){
    return await this.dao.findAll(filter);
  }

  async getByEmail(email) {
    return await this.dao.findByEmail(email);
  }

  async getById(id){
    return await this.dao.findById(id);
  }

  async createUser(userData){
    return await this.dao.create(userData);
  }
}

export default new UserRepository();