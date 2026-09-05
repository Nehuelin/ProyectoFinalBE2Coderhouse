import { categoryService } from "../services/category.service.js";

export const createCategory = async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json({ status: "success", message: "Categoría creada", data: category });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getCategories();
    res.json({ status: "success", data: categories });
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req, res, next) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    res.json({ status: "success", data: category });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    res.json({ status: "success", message: "Categoría actualizada", data: category });
  } catch (error) {
    next(error);
  }
};

export const changeCategoryStatus = async (req, res, next) => {
  try {
    const category = await categoryService.changeStatus(req.params.id, req.body.isActive);
    res.json({ status: "success", message: "Estado de la categoría actualizado", data: category });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const category = await categoryService.deleteCategory(req.params.id);
    res.json({ status: "success", message: "Categoría eliminada", data: category });
  } catch (error) {
    next(error);
  }
};
