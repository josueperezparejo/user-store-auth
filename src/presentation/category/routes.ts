import { Router } from 'express';
import { CategoryController } from './controller';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { ProductService } from '../services';

export class CategoryRoutes {

    static get routes(): Router {
        const router = Router();
        const categoryService = new ProductService();
        const controller = new CategoryController(categoryService);

        router.get('/', controller.getCategories)
        router.post('/',[AuthMiddleware.validateJWT], controller.createCategory)

        return router
    }
}