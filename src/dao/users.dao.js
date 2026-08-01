import User from "../models/user.model.js"

class UsersDAO {
    async findByEmail(email) {
        return await User.findOne({email});
    }

    async create(userData) {
        return await User.create(userData);
    }
}

export default new UsersDAO();