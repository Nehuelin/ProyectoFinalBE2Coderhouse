export class CategoryDTO {
  constructor(category) {
    this.id = category._id;
    this.name = category.name;
    this.slug = category.slug;
    this.description = category.description;
    this.isActive = category.isActive;
    this.createdAt = category.createdAt;
    this.updatedAt = category.updatedAt;
  }
}