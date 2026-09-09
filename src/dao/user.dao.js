import User from "../models/user.model.js"

export class UserDAO {
	async findAll(filter = {}){
		return await User.find(filter);
	}

	async findByEmail(email) {
		return await User.findOne({email});
	}

	async findById(id){
		return await User.findById(id);
	}

	async create(userData) {
		return await User.create(userData);
	}
}