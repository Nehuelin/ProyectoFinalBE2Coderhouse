import { CategoryModel } from "../models/category.model.js";

export class CategoryDAO {
  async create(data) {
    return CategoryModel.create(data);
  }

  async findAll(filter = {}) {
    return CategoryModel.find(filter).sort({ name: 1 });
  }

  async findById(id, filter = {}) {
    return CategoryModel.findOne({ _id: id, ...filter });
  }

  async updateById(id, data) {
    return CategoryModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true
    });
  }
}
