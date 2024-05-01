import { productModel } from "../../data";
import { CreateProductDto, CustomError, PaginationDto } from "../../domain";

export class ProductService {
    constructor() { }

    async createProduct(createProductDto: CreateProductDto) {
        const productExists = await productModel.findOne({ name: createProductDto.name })
        if (productExists) throw CustomError.badRequest('Product already exists')

        try {
            const product = new productModel({ ...createProductDto })

            await product.save()

            return product

        } catch (error) {
            throw CustomError.internalServerError('Internal server error')
        }
    }

    async getProducts(paginationDto: PaginationDto) {
        const { page, limit } = paginationDto
        try {

            const [total, products] = await Promise.all([
                productModel.countDocuments(),
                productModel.find()
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .populate('user')
                    .populate('category')
            ])

            return {
                page: page,
                limit: limit,
                total: total,
                next: `/api/products?page${(page + 1)}&limit=${limit}`,
                prev: (page - 1 > 0) ? `/api/products?page=${(page - 1)}&limit=${limit}` : null,
                products: products
            }

        } catch (error) {
            throw CustomError.internalServerError('Internal server error')
        }
    }
}