-- Seed data for DrawSQL Clone
-- Development and demo data

-- Insert demo users
INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_email_verified, subscription_plan) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'admin@drawsql.local', '$2b$10$rQvvRKG/uKxQ6u.zNLBk/OzZhLlvJ4uZKqZvUxJ4qZ7zJBJhJ5qvS', 'Admin', 'User', 'admin', TRUE, 'premium'),
    ('550e8400-e29b-41d4-a716-446655440002', 'john@example.com', '$2b$10$rQvvRKG/uKxQ6u.zNLBk/OzZhLlvJ4uZKqZvUxJ4qZ7zJBJhJ5qvS', 'John', 'Doe', 'user', TRUE, 'free'),
    ('550e8400-e29b-41d4-a716-446655440003', 'jane@example.com', '$2b$10$rQvvRKG/uKxQ6u.zNLBk/OzZhLlvJ4uZKqZvUxJ4qZ7zJBJhJ5qvS', 'Jane', 'Smith', 'premium', TRUE, 'premium'),
    ('550e8400-e29b-41d4-a716-446655440004', 'demo@drawsql.local', '$2b$10$rQvvRKG/uKxQ6u.zNLBk/OzZhLlvJ4uZKqZvUxJ4qZ7zJBJhJ5qvS', 'Demo', 'User', 'user', TRUE, 'free');

-- Insert demo team
INSERT INTO teams (id, name, description, owner_id, invite_code) VALUES
    ('660e8400-e29b-41d4-a716-446655440001', 'Development Team', 'Main development team for the project', '550e8400-e29b-41d4-a716-446655440001', 'DEV2024');

-- Insert team members
INSERT INTO team_members (team_id, user_id, role) VALUES
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'owner'),
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'member'),
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'admin');

-- Insert diagram templates
INSERT INTO diagram_templates (id, name, description, category, diagram_data, is_featured) VALUES
    ('770e8400-e29b-41d4-a716-446655440001', 'E-commerce Database', 'Complete e-commerce database schema with users, products, orders, and payments', 'e-commerce', 
     '{"tables": [{"name": "users", "columns": [{"name": "id", "type": "uuid", "primary": true}, {"name": "email", "type": "varchar"}, {"name": "password", "type": "varchar"}]}, {"name": "products", "columns": [{"name": "id", "type": "uuid", "primary": true}, {"name": "name", "type": "varchar"}, {"name": "price", "type": "decimal"}]}]}', 
     TRUE),
    ('770e8400-e29b-41d4-a716-446655440002', 'Blog Database', 'Simple blog database with posts, comments, and categories', 'blog',
     '{"tables": [{"name": "posts", "columns": [{"name": "id", "type": "uuid", "primary": true}, {"name": "title", "type": "varchar"}, {"name": "content", "type": "text"}]}, {"name": "comments", "columns": [{"name": "id", "type": "uuid", "primary": true}, {"name": "post_id", "type": "uuid"}, {"name": "content", "type": "text"}]}]}',
     TRUE),
    ('770e8400-e29b-41d4-a716-446655440003', 'Social Media Database', 'Social media platform database schema', 'social-media',
     '{"tables": [{"name": "users", "columns": [{"name": "id", "type": "uuid", "primary": true}, {"name": "username", "type": "varchar"}, {"name": "email", "type": "varchar"}]}, {"name": "posts", "columns": [{"name": "id", "type": "uuid", "primary": true}, {"name": "user_id", "type": "uuid"}, {"name": "content", "type": "text"}]}]}',
     FALSE);

-- Insert demo diagrams
INSERT INTO diagrams (id, title, description, visibility, owner_id, team_id, database_type, tags) VALUES
    ('880e8400-e29b-41d4-a716-446655440001', 'User Management System', 'Complete user management with authentication and authorization', 'public', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'postgresql', ARRAY['authentication', 'users', 'roles']),
    ('880e8400-e29b-41d4-a716-446655440002', 'E-commerce Platform', 'Full e-commerce database design', 'private', '550e8400-e29b-41d4-a716-446655440002', NULL, 'postgresql', ARRAY['e-commerce', 'orders', 'products']),
    ('880e8400-e29b-41d4-a716-446655440003', 'Content Management', 'CMS database structure', 'public', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', 'mysql', ARRAY['cms', 'content', 'media']);

-- Insert demo tables for User Management System diagram
INSERT INTO diagram_tables (id, diagram_id, name, display_name, position_x, position_y, width, height, color) VALUES
    ('990e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', 'users', 'Users', 100, 100, 250, 200, '#e3f2fd'),
    ('990e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440001', 'roles', 'Roles', 400, 100, 200, 150, '#f3e5f5'),
    ('990e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440001', 'user_roles', 'User Roles', 250, 300, 220, 120, '#e8f5e8');

-- Insert demo columns for users table
INSERT INTO table_columns (table_id, name, data_type, is_primary_key, is_nullable, description, order_index) VALUES
    ('990e8400-e29b-41d4-a716-446655440001', 'id', 'uuid', TRUE, FALSE, 'Primary key', 1),
    ('990e8400-e29b-41d4-a716-446655440001', 'email', 'varchar', FALSE, FALSE, 'User email address', 2),
    ('990e8400-e29b-41d4-a716-446655440001', 'password_hash', 'varchar', FALSE, FALSE, 'Hashed password', 3),
    ('990e8400-e29b-41d4-a716-446655440001', 'first_name', 'varchar', FALSE, FALSE, 'First name', 4),
    ('990e8400-e29b-41d4-a716-446655440001', 'last_name', 'varchar', FALSE, FALSE, 'Last name', 5),
    ('990e8400-e29b-41d4-a716-446655440001', 'created_at', 'timestamp', FALSE, FALSE, 'Creation timestamp', 6),
    ('990e8400-e29b-41d4-a716-446655440001', 'updated_at', 'timestamp', FALSE, FALSE, 'Last update timestamp', 7);

-- Insert demo columns for roles table
INSERT INTO table_columns (table_id, name, data_type, is_primary_key, is_nullable, description, order_index) VALUES
    ('990e8400-e29b-41d4-a716-446655440002', 'id', 'uuid', TRUE, FALSE, 'Primary key', 1),
    ('990e8400-e29b-41d4-a716-446655440002', 'name', 'varchar', FALSE, FALSE, 'Role name', 2),
    ('990e8400-e29b-41d4-a716-446655440002', 'description', 'text', FALSE, TRUE, 'Role description', 3),
    ('990e8400-e29b-41d4-a716-446655440002', 'permissions', 'jsonb', FALSE, TRUE, 'Role permissions', 4),
    ('990e8400-e29b-41d4-a716-446655440002', 'created_at', 'timestamp', FALSE, FALSE, 'Creation timestamp', 5);

-- Insert demo columns for user_roles table
INSERT INTO table_columns (table_id, name, data_type, is_primary_key, is_foreign_key, is_nullable, description, order_index) VALUES
    ('990e8400-e29b-41d4-a716-446655440003', 'id', 'uuid', TRUE, FALSE, FALSE, 'Primary key', 1),
    ('990e8400-e29b-41d4-a716-446655440003', 'user_id', 'uuid', FALSE, TRUE, FALSE, 'User reference', 2),
    ('990e8400-e29b-41d4-a716-446655440003', 'role_id', 'uuid', FALSE, TRUE, FALSE, 'Role reference', 3),
    ('990e8400-e29b-41d4-a716-446655440003', 'assigned_at', 'timestamp', FALSE, FALSE, FALSE, 'Assignment timestamp', 4);

-- Insert demo relationships
INSERT INTO table_relationships (diagram_id, from_table_id, to_table_id, from_column_id, to_column_id, relationship_type, constraint_name) VALUES
    ('880e8400-e29b-41d4-a716-446655440001', 
     '990e8400-e29b-41d4-a716-446655440003', 
     '990e8400-e29b-41d4-a716-446655440001',
     (SELECT id FROM table_columns WHERE table_id = '990e8400-e29b-41d4-a716-446655440003' AND name = 'user_id'),
     (SELECT id FROM table_columns WHERE table_id = '990e8400-e29b-41d4-a716-446655440001' AND name = 'id'),
     'many_to_many', 'fk_user_roles_user_id'),
    ('880e8400-e29b-41d4-a716-446655440001',
     '990e8400-e29b-41d4-a716-446655440003',
     '990e8400-e29b-41d4-a716-446655440002',
     (SELECT id FROM table_columns WHERE table_id = '990e8400-e29b-41d4-a716-446655440003' AND name = 'role_id'),
     (SELECT id FROM table_columns WHERE table_id = '990e8400-e29b-41d4-a716-446655440002' AND name = 'id'),
     'many_to_many', 'fk_user_roles_role_id');

-- Insert demo comments
INSERT INTO diagram_comments (diagram_id, user_id, content, position_x, position_y) VALUES
    ('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Should we add an email verification field?', 200, 150),
    ('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'Consider adding audit fields to track changes', 350, 200); 