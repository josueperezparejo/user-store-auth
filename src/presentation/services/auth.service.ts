import { JwtAdapter, bcryptAdapter } from "../../config";
import { userModel } from "../../data";
import { CustomError, LoginUserDto, RegisterUserDto, UserEntity } from "../../domain";

export class AuthService {

    constructor() { }

    public async registerUser(registerUserDto: RegisterUserDto) {
        const user = await userModel.findOne({ email: registerUserDto.email })

        if (user) throw CustomError.badRequest('User already exists')

        try {
            const user = new userModel(registerUserDto)

            user.password = bcryptAdapter.hash(registerUserDto.password)

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

    public async loginUser(loginUserDto: LoginUserDto) {
        const user = await userModel.findOne({ email: loginUserDto.email })

        if (!user) throw CustomError.badRequest('User not exists')

        try {
            const isMatching = bcryptAdapter.compare(loginUserDto.password, user.password)
            if (!isMatching) throw CustomError.badRequest('Password is not valid')

            const { password, ...userEntity } = UserEntity.fromObject(user)

            const token = await JwtAdapter.generateToken({ id: user.id })
            if (!token) throw CustomError.internalServerError('Error while creating JWT')

            return {
                user: userEntity,
                token
            }

        } catch (error) {
            throw CustomError.internalServerError(`Error creating user ${error}`)
        }
    }
}