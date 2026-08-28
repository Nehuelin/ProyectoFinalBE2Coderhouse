import { Router } from "express";
import { authorizeRole } from "../middlewares/authorizeRoles.middleware.js";
import { authenticate } from "../middlewares/passport.middleware.js";
import {
  changeCategoryStatus,
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  updateCategory
} from "../controllers/categories.controller.js";

const router = Router();
const adminOnly = [authenticate("current", 401, "Autenticación requerida"), authorizeRole("admin")];

router.get("/", getCategories);
router.get("/:id", getCategoryById);
router.post("/", ...adminOnly, createCategory);
router.put("/:id", ...adminOnly, updateCategory);
router.patch("/:id/status", ...adminOnly, changeCategoryStatus);
router.delete("/:id", ...adminOnly, deleteCategory);

export default router;
