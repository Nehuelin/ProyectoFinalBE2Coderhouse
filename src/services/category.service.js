import mongoose from "mongoose";
import { CategoryRepository } from "../repositories/category.repository.js";
import { CategoryDTO } from "../dto/category.dto.js";

const businessError = (message, statusCode = 400) => {
  return Object.assign(new Error(message), { status: statusCode, statusCode });
};

const slugify = value => value
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");

export class CategoryService {
  constructor() {
    this.categoryRepository = new CategoryRepository();
  }

  validateObjectId(id) {
    if (!mongoose.isValidObjectId(id)) {
      throw businessError("ID de categoría inválido");
    }
  }

  async createCategory(data) {
    const name = typeof data.name === "string" ? data.name.trim() : "";
    const slug = typeof data.slug === "string" && data.slug.trim()
      ? slugify(data.slug)
      : slugify(name);

    if (!name) throw businessError("El nombre de la categoría es obligatorio");
    if (!slug) throw businessError("El slug de la categoría es obligatorio");

    const category = await this.categoryRepository.create({
      name,
      slug,
      description: data.description,
      isActive: data.isActive ?? true
    });

    return new CategoryDTO(category);
  }

  async getCategories() {
    const categories = await this.categoryRepository.findAll({ isActive: true });
    return categories.map(category => new CategoryDTO(category));
  }

  async getCategoryById(id) {
    this.validateObjectId(id);
    const category = await this.categoryRepository.findById(id, { isActive: true });

    if (!category) throw businessError("Categoría no encontrada", 404);
    return new CategoryDTO(category);
  }

  async updateCategory(id, data) {
    this.validateObjectId(id);
    const category = await this.categoryRepository.findById(id);

    if (!category) throw businessError("Categoría no encontrada", 404);

    const updateData = {};
    if (data.name !== undefined) {
      if (typeof data.name !== "string" || !data.name.trim()) {
        throw businessError("El nombre de la categoría no puede estar vacío");
      }
      updateData.name = data.name.trim();
    }
    if (data.slug !== undefined) {
      if (typeof data.slug !== "string" || !data.slug.trim()) {
        throw businessError("El slug de la categoría no puede estar vacío");
      }
      updateData.slug = slugify(data.slug);
    }
    if (data.description !== undefined) updateData.description = data.description;

    if (!Object.keys(updateData).length) {
      throw businessError("No hay campos válidos para actualizar");
    }

    const updatedCategory = await this.categoryRepository.updateById(id, updateData);
    return new CategoryDTO(updatedCategory);
  }

  async changeStatus(id, isActive) {
    this.validateObjectId(id);
    if (typeof isActive !== "boolean") {
      throw businessError("El campo isActive debe ser booleano");
    }

    const category = await this.categoryRepository.updateById(id, { isActive });
    if (!category) throw businessError("Categoría no encontrada", 404);
    return new CategoryDTO(category);
  }

  async deleteCategory(id) {
    return this.changeStatus(id, false);
  }
}

export const categoryService = new CategoryService();
