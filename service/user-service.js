const UserModel = require('../models/user-model');
const ProductModel = require('../models/product-model');
const bcrypt = require('bcryptjs');

const uuid = require('uuid');
const MailService = require('../service/mail-service')
const tokenService = require('../service/token-service')
const UserDto = require('../dtos/user-dto')
const ApiError = require('../exception/api-error')

class UserService {
	async registration(email, password) {
		const candidate = await UserModel.findOne({email});
		if (candidate) {
			throw ApiError.BadRequest(`Користувач з такою поштою вже існує, увійдіть`);
		};
		const hashPassword = await bcrypt.hash(password, 3);
		const activatorLink = uuid.v4();
		const user = await UserModel.create({email, password: hashPassword, activatorLink, userName: 'User', userImage: '', role: 'USER'});
		await MailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activatorLink}`);
		const userDto = new UserDto(user);
		const tokens = tokenService.generateTokens({...userDto});
		await tokenService.saveToken(userDto.id, tokens.refreshToken);
		return {...tokens, user: userDto}
	}
	async activate(link) {
		const user = await UserModel.findOne({activatorLink: link});
		if (!user) {
			throw ApiError.BadRequest('Не правильне посилання активації');
		}
		user.isActivated = true;
		await user.save();
	}
	async login(email, password) {
		const user = await UserModel.findOne({email});
		if (!user) {
			throw ApiError.BadRequest('Користувача з такою поштою не існує');
		}
		const isPassEquals = await bcrypt.compare(password, user.password);
		if (!isPassEquals) {	
			throw ApiError.BadRequest('Невірний пароль або email');
		}
		const userDto = new UserDto(user);
		const tokens = tokenService.generateTokens({...userDto});
		await tokenService.saveToken(userDto.id, tokens.refreshToken);
		return {...tokens, user: userDto}
	}
	async logout(refreshToken) {
		const token = await tokenService.removeToken(refreshToken);
		return token
	}
	async refresh(refreshToken) {
		if (!refreshToken) {
			throw ApiError.UnauthorizedError();
		}
		const userData = await tokenService.validateRefreshToken(refreshToken);

		const tokenFromDb = await tokenService.findToken(refreshToken);

		if (!userData || !tokenFromDb) {
			throw ApiError.UnauthorizedError();
		}
		const user = await UserModel.findById(userData.id);
		const userDto = new UserDto(user);
		const tokens = tokenService.generateTokens({...userDto});
		await tokenService.saveToken(userDto.id, tokens.refreshToken);
		return {...tokens, user: userDto}
	}
	async updateUserRole(id , role) {
		const updateDoc = {
			$set: {
				role: role,
			},
	};
		const options = { returnDocument: 'after' };
		const response = await UserModel.findOneAndUpdate({_id : id} , updateDoc, options);
		if (response) {
			return {message: 'Успішно оновлено'}
		} else if (!response) {
			throw ApiError.BadRequest(`Не вдалося оновити`);
		} else {
			throw ApiError.BadRequest(`Якась помилка`);
		}
	}
	async getUsers() {
		const users = await UserModel.find();
		return users
	}
}

module.exports = new UserService()