import mongoose from "mongoose";

interface Options {
    mongoUrl: string
    dbName: string
}

export class MongoDatabase {
    constructor() {}

    static connect = async (options: Options) => {
        const { mongoUrl, dbName } = options;
        
        try {
            await mongoose.connect(mongoUrl, {
                dbName
            });

            return true

        } catch (error) {
            console.log("Mongo connection error")
            throw error
        }
    }

    static disconnect = async () => {
        await mongoose.disconnect();
    }
}