module.exports = class UserDto {
	email;
	id;
	isActivated;
	userName;
	userImage;
	constructor(user) {
		this.id = user._id
		this.email = user.email
		this.isActivated = user.isActivated
		this.userName = user.userName
		this.userImage = user.userImage
		this.role = user.role
	}
}