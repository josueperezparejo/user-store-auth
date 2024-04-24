import { userModel } from "../../data";
import { CustomError, RegisterUserDto, UserEntity } from "../../domain";

export class AuthService {

    constructor() { }

    public async registerUser(registerUserDto: RegisterUserDto) {
        const existUser = await userModel.findOne({ email: registerUserDto.email })

        if (existUser) throw CustomError.badRequest('User already exists')

        try {
            const user = new userModel(registerUserDto)
            await user.save()

            const { password, ...userEntity } = UserEntity.fromObject(user)

            return {
                user: userEntity,
                token: 'token'
            }

        } catch (error) {
            throw CustomError.internalServerError(`Error creating user ${error}`)
        }
    }
}