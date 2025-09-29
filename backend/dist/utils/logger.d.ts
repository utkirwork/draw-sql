import winston from 'winston';
export declare const logger: winston.Logger;
export declare const loggers: {
    auth: (message: string, meta?: any) => winston.Logger;
    db: (message: string, meta?: any) => winston.Logger;
    ws: (message: string, meta?: any) => winston.Logger;
    api: (message: string, meta?: any) => winston.Logger;
    security: (message: string, meta?: any) => winston.Logger;
    performance: (message: string, meta?: any) => winston.Logger;
};
//# sourceMappingURL=logger.d.ts.map