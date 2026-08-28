import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			unique: true
		},
		slug: {
			type: String,
			required: true,
			trim: true,
			lowercase: true,
			unique: true
		},
		description: {
			type: String,
			trim: true
		},
		isActive: {
			type: Boolean,
			default: true
		}
	},
	{
		timestamps: true
	}
);

categorySchema.index({ isActive: 1 });

export const CategoryModel = mongoose.model('Category', categorySchema)