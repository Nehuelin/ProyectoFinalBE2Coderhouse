import usersDAO from "../dao/users.dao.js";

class UserRepository {
    async getAll(){
        return await usersDAO.findAll();
    }

    async getByEmail(email) {
        return await usersDAO.findByEmail(email);
    }

    async getById(id){
        return await usersDAO.findById(id);
    }

    async createUser(userData){
        return await usersDAO.create(userData);
    }
}

export default new UserRepository();