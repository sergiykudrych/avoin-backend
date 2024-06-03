const categoryService = require( "../service/category-service" );

class CategoryControllers {
	async getAllCategorys(req, res, next) {
		try {
			const categorys = await categoryService.getAllCategorys()
			return res.json(categorys)
		} catch (e) {
			console.log(e);
			next(e)	
		}
	}	
	async createCategory(req, res, next) {
		try {
			const {title, slug} = req.body
			const userData = await categoryService.createCategory(title, slug)
			return res.json(userData)
		} catch (e) {
			console.log(e);
			next(e)	
		}
	}
	async removeCategory(req, res, next) {
		try {
			const title = req.params.title
			const userData = await categoryService.removeCategory(title)
			return res.json(userData)
		} catch (e) {
			console.log(e);
			next(e)	
		}
	}
}
module.exports = new CategoryControllers()