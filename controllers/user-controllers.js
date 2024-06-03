const ApiError = require( '../exception/api-error' )
const userService = require('../service/user-service')
const {validationResult} = require('express-validator')
const { MongoClient } = require('mongodb');
class UserControllers {
	async registration(req, res, next) {
		try {
			const errors = validationResult(req)
			if (!errors.isEmpty()) {
				return next(ApiError.BadRequest('Не коректні дані', errors.array()))
			}
			const {email, password} = req.body
			const userData = await userService.registration(email, password)
			res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
			return res.json(userData)
		} catch (e) {
			console.log(e);
			next(e)	
		}
	}
	async login(req, res, next) {
		try {
			const {email, password} = req.body
			const userData = await userService.login(email, password)
			res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
			return res.json(userData)
		} catch (e) {
			next(e)	
		}
	}
	async logout(req, res, next) {
		try {
			const {refreshToken} = req.cookies
			const token = await userService.logout(refreshToken)
			res.clearCookie('refreshToken')
			return res.json(token)
		} catch (e) {
			next(e)	
		}
	}
	async activate(req, res, next) {
		try {
			const activateLink = req.params.link
			await userService.activate(activateLink)
			res.redirect(process.env.CLIENT_URL)
		} catch (e) {
			next(e)	
		}
	}
	async refresh(req, res, next) {
		try {
			const {refreshToken} = req.cookies
			const userData = await userService.refresh(refreshToken)
			res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
			return res.json(userData)
		} catch (e) {
			next(e)	
		}
	}
	async getUsers(req, res, next) {
		try {
			const users = await userService.getUsers()
			return res.json(users)
		} catch (e) {
			console.log(e);
			next(e)	
		}
	}
	async updateUserInfo(req, res, next) {
		const {email, userName, userImage} = req.body
    const uri = "mongodb+srv://sergiykudrych24:h2iLVTxYPtG0kiU5@auth.z7v6wuw.mongodb.net/?retryWrites=true&w=majority&appName=auth";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const database = client.db("test");
        const collection = database.collection("users");
        const filter = { email: email };
				const updateDoc = {
						$set: {
								userName: userName,
								userImage: userImage,
						},
				};
				const options = { returnDocument: 'after' };
				await collection.findOneAndUpdate(filter, updateDoc, options);
				return res.json('Успішно оновленно!')
		} catch (e) {
			return res.json('Виникла якась помилка!')
    } finally {
        await client.close();
    }
	}
	async updateUserRole(req, res, next) {
		try {
			const role = req.body.role
			const { id } = req.params
			const result = await userService.updateUserRole(id, role)
			return res.json(result)
		} catch (e) {
			console.log(e);
			next(e)	
		}
	}
}
module.exports = new UserControllers()