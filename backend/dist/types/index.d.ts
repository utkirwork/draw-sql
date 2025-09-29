import { Request } from 'express';
export interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: 'admin' | 'user' | 'premium';
    avatar_url?: string;
    is_email_verified: boolean;
    last_login?: Date;
    subscription_plan: string;
    subscription_expires?: Date;
    created_at: Date;
    updated_at: Date;
}
export interface CreateUserRequest {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
}
export interface LoginRequest {
    email: string;
    password: string;
}
export interface AuthResponse {
    user: Omit<User, 'password_hash'>;
    token: string;
    refresh_token: string;
}
export interface Team {
    id: string;
    name: string;
    description?: string;
    owner_id: string;
    invite_code?: string;
    max_members: number;
    created_at: Date;
    updated_at: Date;
}
export interface TeamMember {
    id: string;
    team_id: string;
    user_id: string;
    role: 'owner' | 'admin' | 'member';
    joined_at: Date;
    user?: User;
}
export type DiagramVisibility = 'public' | 'private' | 'team';
export type DatabaseType = 'postgresql' | 'mysql' | 'sqlserver' | 'mariadb';
export interface Diagram {
    id: string;
    title: string;
    description?: string;
    visibility: DiagramVisibility;
    owner_id: string;
    team_id?: string;
    database_type: DatabaseType;
    canvas_data: Record<string, any>;
    version: number;
    is_template: boolean;
    tags: string[];
    view_count: number;
    fork_count: number;
    parent_diagram_id?: string;
    created_at: Date;
    updated_at: Date;
    owner?: User;
    team?: Team;
    tables?: DiagramTable[];
}
export interface CreateDiagramRequest {
    title: string;
    description?: string;
    visibility: DiagramVisibility;
    team_id?: string;
    database_type: DatabaseType;
    tags?: string[];
}
export interface UpdateDiagramRequest {
    title?: string;
    description?: string;
    visibility?: DiagramVisibility;
    canvas_data?: Record<string, any>;
    tags?: string[];
}
export type ColumnDataType = 'varchar' | 'text' | 'char' | 'integer' | 'bigint' | 'smallint' | 'decimal' | 'numeric' | 'real' | 'double_precision' | 'serial' | 'bigserial' | 'boolean' | 'date' | 'time' | 'timestamp' | 'timestamptz' | 'json' | 'jsonb' | 'uuid' | 'bytea' | 'inet' | 'cidr' | 'macaddr';
export interface DiagramTable {
    id: string;
    diagram_id: string;
    name: string;
    display_name?: string;
    description?: string;
    position_x: number;
    position_y: number;
    width: number;
    height: number;
    color: string;
    created_at: Date;
    updated_at: Date;
    columns?: TableColumn[];
}
export interface TableColumn {
    id: string;
    table_id: string;
    name: string;
    data_type: ColumnDataType;
    length?: number;
    precision?: number;
    scale?: number;
    is_primary_key: boolean;
    is_foreign_key: boolean;
    is_unique: boolean;
    is_nullable: boolean;
    is_auto_increment: boolean;
    default_value?: string;
    description?: string;
    order_index: number;
    created_at: Date;
    updated_at: Date;
}
export interface CreateTableRequest {
    name: string;
    display_name?: string;
    description?: string;
    position_x: number;
    position_y: number;
    width?: number;
    height?: number;
    color?: string;
    columns: CreateColumnRequest[];
}
export interface CreateColumnRequest {
    name: string;
    data_type: ColumnDataType;
    length?: number;
    precision?: number;
    scale?: number;
    is_primary_key?: boolean;
    is_foreign_key?: boolean;
    is_unique?: boolean;
    is_nullable?: boolean;
    is_auto_increment?: boolean;
    default_value?: string;
    description?: string;
}
export interface UpdateTableRequest {
    name?: string;
    display_name?: string;
    description?: string;
    position_x?: number;
    position_y?: number;
    width?: number;
    height?: number;
    color?: string;
}
export type RelationshipType = 'one_to_one' | 'one_to_many' | 'many_to_many';
export interface TableRelationship {
    id: string;
    diagram_id: string;
    from_table_id: string;
    to_table_id: string;
    from_column_id: string;
    to_column_id: string;
    relationship_type: RelationshipType;
    constraint_name?: string;
    on_delete: string;
    on_update: string;
    created_at: Date;
    updated_at: Date;
    from_table?: DiagramTable;
    to_table?: DiagramTable;
    from_column?: TableColumn;
    to_column?: TableColumn;
}
export interface CreateRelationshipRequest {
    from_table_id: string;
    to_table_id: string;
    from_column_id: string;
    to_column_id: string;
    relationship_type: RelationshipType;
    constraint_name?: string;
    on_delete?: string;
    on_update?: string;
}
export interface DiagramComment {
    id: string;
    diagram_id: string;
    user_id: string;
    parent_comment_id?: string;
    content: string;
    position_x?: number;
    position_y?: number;
    is_resolved: boolean;
    created_at: Date;
    updated_at: Date;
    user?: User;
    replies?: DiagramComment[];
}
export interface CreateCommentRequest {
    content: string;
    position_x?: number;
    position_y?: number;
    parent_comment_id?: string;
}
export interface DiagramTemplate {
    id: string;
    name: string;
    description?: string;
    category?: string;
    diagram_data: Record<string, any>;
    preview_image_url?: string;
    is_featured: boolean;
    download_count: number;
    created_by?: string;
    created_at: Date;
    creator?: User;
}
export interface CollaborationSession {
    id: string;
    diagram_id: string;
    user_id: string;
    cursor_position?: Record<string, any>;
    last_seen: Date;
    is_active: boolean;
    created_at: Date;
    user?: User;
}
export interface DiagramVersion {
    id: string;
    diagram_id: string;
    version_number: number;
    title?: string;
    description?: string;
    changes_summary?: string;
    diagram_data: Record<string, any>;
    created_by: string;
    created_at: Date;
    creator?: User;
}
export interface UserActivity {
    id: string;
    user_id: string;
    diagram_id?: string;
    action: string;
    details?: Record<string, any>;
    ip_address?: string;
    user_agent?: string;
    created_at: Date;
    user?: User;
    diagram?: Diagram;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        total_pages?: number;
    };
}
export interface PaginationQuery {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    search?: string;
}
export interface SocketUser {
    id: string;
    user: User;
    socket_id: string;
    diagram_id?: string;
    cursor_position?: {
        x: number;
        y: number;
    };
    last_activity: Date;
}
export interface SocketMessage {
    type: string;
    payload: any;
    user_id: string;
    diagram_id?: string;
    timestamp: Date;
}
export interface QueryResult<T = any> {
    rows: T[];
    rowCount: number;
    command: string;
}
export interface AuthenticatedRequest extends Request {
    user?: User;
}
export interface FileUpload {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
}
export interface ExportOptions {
    format: 'sql' | 'json' | 'png' | 'svg' | 'pdf';
    include_data?: boolean;
    database_type?: DatabaseType;
}
export interface ImportOptions {
    format: 'sql' | 'json';
    database_type?: DatabaseType;
    merge_strategy?: 'replace' | 'merge' | 'append';
}
//# sourceMappingURL=index.d.ts.map