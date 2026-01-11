import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('❌ ERROR DEL SERVIDOR:', err.message);
    if (err.stack) console.error(err.stack);

    res.status(err.status || 500).json({
        error: err.message || 'Error interno del servidor',
        status: err.status || 500
    });
};

export default errorHandler;
