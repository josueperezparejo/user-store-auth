import { envs } from "../../config"
import { MongoDatabase, categoryModel, productModel, userModel } from "../mongo"
import { seedData } from "./data"

(async () => {
    await MongoDatabase.connect({
        dbName: envs.MONGO_DB_NAME,
        mongoUrl: envs.MONGO_URL
    })

    await main()

    await MongoDatabase.disconnect()

})()

const randomBetween0andX = (x: number = 10) => {
    return Math.floor(Math.random() * x)
}

async function main() {
    await Promise.all([
        userModel.deleteMany(),
        categoryModel.deleteMany(),
        productModel.deleteMany()
    ])

    const users = await userModel.insertMany(seedData.users)

    const categories = await categoryModel.insertMany(
        seedData.categories.map(category => {
            return {
                ...category,
                user: users[0]._id
            }
        })
    )

    const products = await productModel.insertMany(
        seedData.products.map(product => {
            return {
                ...product,
                user: users[randomBetween0andX(seedData.users.length - 1)]._id,
                category: categories[randomBetween0andX(seedData.categories.length - 1)]._id
            }
        })
    )
    console.log("SEEDED")
}