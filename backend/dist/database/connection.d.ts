import { Pool, PoolClient } from 'pg';
export declare const connectDatabase: () => Promise<Pool>;
export declare const getDatabase: () => Pool;
export declare const closeDatabase: () => Promise<void>;
export declare const withTransaction: <T>(callback: (client: PoolClient) => Promise<T>) => Promise<T>;
export declare const query: (text: string, params?: any[], logQuery?: boolean) => Promise<any>;
//# sourceMappingURL=connection.d.ts.map