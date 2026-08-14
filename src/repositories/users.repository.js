import usersDAO from "../dao/users.dao.js";

class UsersRepository {
    async getByEmail(email) {
        return await usersDAO.findByEmail(email);
    }

    async getById(id){
        return await usersDAO.findById(id);
    }

    async create(userData){
        return await usersDAO.create(userData);
    }
}

export default new UsersRepository();