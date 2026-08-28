import { CategoryDAO } from "../dao/category.dao.js";

export class CategoryRepository {
  constructor() {
    this.dao = new CategoryDAO();
  }

  create(data) {
    return this.dao.create(data);
  }

  findAll(filter) {
    return this.dao.findAll(filter);
  }

  findById(id, filter) {
    return this.dao.findById(id, filter);
  }

  updateById(id, data) {
    return this.dao.updateById(id, data);
  }
}
