import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    emailValidated: {
        type: Boolean,
        default: false
    },
    password: {
        type: String,
        required: true
    },
    img: {
        type: String
    },
    role: {
        type: [String],
        default: ['USER_ROLE'],
        enum: ['ADMIN_ROLE', 'USER_ROLE']
    }
})

export const userModel = mongoose.model('User', userSchema);