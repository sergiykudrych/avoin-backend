const CategoryModel = require('../models/category-model');
const ApiError = require('../exception/api-error')

class CategoryService {
	async getAllCategorys() {
		const categorys = await CategoryModel.find();
		return categorys
	}
	async createCategory(title, slug) {
		const items = await CategoryModel.findOne({title});	
		if (items) {
			throw ApiError.BadRequest(`Така категорія вже існує`);
		};
		const response = await CategoryModel.create({title, slug});
		if (!response) {
			throw ApiError.BadRequest(`Така категорія вже існує`);
		};
		return {message: 'Категорію створено'}
	}
	async removeCategory(title) {
		const items = await CategoryModel.findOne({title});	
		if (!items) {
			throw ApiError.BadRequest(`Такої категорії немає`);
		};
		await CategoryModel.deleteOne({title});
		return {message: 'Категорію видалено'}
	}
}

module.exports = new CategoryService()