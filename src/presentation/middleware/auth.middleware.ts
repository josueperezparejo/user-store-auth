import { NextFunction, Request, Response } from "express";
import { JwtAdapter } from "../../config";
import { userModel } from "../../data";
import { UserEntity } from "../../domain";

export class AuthMiddleware {
    static async validateJWT(req: Request, res: Response, next: NextFunction) {
        const { authorization } = req.headers;
        if(!authorization) return res.status(400).json({ error: 'Token not found' });
        if(!authorization.startsWith('Bearer')) return res.status(400).json({ error: 'Invalid token' });

        const token = authorization.split(' ')[1] || '';

        try {

            const payload = await JwtAdapter.validateToken<{id: string}>(token);
            if(!payload) return res.status(401).json({ error: 'Invalid token' });

            const user = await userModel.findById(payload.id);
            if(!user) return res.status(400).json({ error: 'Invalid token - user' });

            req.body.user = UserEntity.fromObject(user);

            next()
            
        } catch (error) {
         console.log(error)   
         res.status(500).json({ error: 'Internal server error' });
        }
    }
}