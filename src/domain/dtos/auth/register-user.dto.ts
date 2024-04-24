import { regularExps } from "../../../config";

export class RegisterUserDto {

    constructor(
        public name: string,
        public email: string,
        public password: string,
    ) { }

    static create(object: { [key: string]: any }): [string?, RegisterUserDto?] {
        const { name, email, password } = object;
        if (!name) return ["Missing name fields", undefined];
        if (!email) return ["Missing email fields", undefined];
        if (!regularExps.email.test(email)) return ["Email is not valid", undefined];
        if (!password) return ["Missing password fields", undefined];
        if (password.length < 6) return ["Password must be at least 6 characters", undefined];

        return [undefined, new RegisterUserDto(name, email, password)];
    }
}