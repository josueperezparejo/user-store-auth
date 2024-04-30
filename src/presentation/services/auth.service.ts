import { JwtAdapter, bcryptAdapter, envs } from "../../config";
import { userModel } from "../../data";
import { CustomError, LoginUserDto, RegisterUserDto, UserEntity } from "../../domain";
import { EmailService } from './email.service';

export class AuthService {

    constructor(
        private readonly emailService: EmailService
    ) { }

    public async registerUser(registerUserDto: RegisterUserDto) {
        const user = await userModel.findOne({ email: registerUserDto.email })

        if (user) throw CustomError.badRequest('User already exists')

        try {
            const user = new userModel(registerUserDto)

            user.password = bcryptAdapter.hash(registerUserDto.password)

            await user.save()

            await this.sendEmailValidationLink(user.email)

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

    private sendEmailValidationLink = async (email: string) => {
        const token = await JwtAdapter.generateToken({ email })
        if (!token) throw CustomError.internalServerError('Error while creating JWT')

        const link = `${envs.BASE_URL}/auth/validate-email/${token}`

        const message = `
            <h1>Welcome to the app</h1>
            <p>Please use this link to validate your email: <a href="${link}">${link}</a></p>
        `
        const options = {
            to: email,
            subject: 'Validate your email',
            htmlBody: message
        }

        const isSet = await this.emailService.sendEmail(options)
        if (!isSet) throw CustomError.internalServerError('Error while sending email')

        return true
    }

    public validateEmail = async (token: string) => {
        const payload = await JwtAdapter.validateToken(token)
        if (!payload) throw CustomError.badRequest('Invalid token')

        const { email } = payload as { email: string }
        if (!email) throw CustomError.internalServerError('Invalid token')

        const user = await userModel.findOne({ email })
        if (!user) throw CustomError.internalServerError('User not exists')

        user.emailValidated = true
        await user.save()
        return true
    }
}