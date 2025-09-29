import { DiagramTable, TableRelationship, DatabaseType } from '../types';
export declare class SQLExportService {
    /**
     * Generate SQL schema from diagram data
     */
    generateSQLSchema(tables: DiagramTable[], relationships: TableRelationship[], databaseType?: DatabaseType, schemaName?: string): string;
    /**
     * Generate CREATE TABLE statement for a single table
     */
    private generateCreateTableSQL;
    /**
     * Generate column definition
     */
    private generateColumnDefinition;
    /**
     * Map data types to database-specific types
     */
    private mapDataType;
    private mapPostgreSQLType;
    private mapMySQLType;
    private mapSQLServerType;
    private mapMariaDBType;
    /**
     * Generate foreign key constraints
     */
    private generateForeignKeyConstraints;
    /**
     * Generate indexes
     */
    private generateIndexes;
    /**
     * Generate table comment
     */
    private generateCommentSQL;
    /**
     * Quote identifier based on database type
     */
    private quoteIdentifier;
    /**
     * Escape string for SQL
     */
    private escapeString;
    /**
     * Format default value
     */
    private formatDefaultValue;
}
//# sourceMappingURL=sqlExportService.d.ts.map