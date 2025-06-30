-- DrawSQL Clone Database Schema
-- Professional Database Schema Designer

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'user', 'premium');
CREATE TYPE diagram_visibility AS ENUM ('public', 'private', 'team');
CREATE TYPE column_data_type AS ENUM (
    'varchar', 'text', 'char', 'integer', 'bigint', 'smallint', 
    'decimal', 'numeric', 'real', 'double_precision', 'serial', 
    'bigserial', 'boolean', 'date', 'time', 'timestamp', 'timestamptz',
    'json', 'jsonb', 'uuid', 'bytea', 'inet', 'cidr', 'macaddr'
);
CREATE TYPE relationship_type AS ENUM ('one_to_one', 'one_to_many', 'many_to_many');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role DEFAULT 'user',
    avatar_url VARCHAR(500),
    is_email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    last_login TIMESTAMP,
    subscription_plan VARCHAR(50) DEFAULT 'free',
    subscription_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Teams table
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invite_code VARCHAR(50) UNIQUE,
    max_members INTEGER DEFAULT 5,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Team members
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member', -- owner, admin, member
    joined_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- Diagrams table
CREATE TABLE diagrams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    visibility diagram_visibility DEFAULT 'private',
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    database_type VARCHAR(50) DEFAULT 'postgresql', -- postgresql, mysql, sqlserver, mariadb
    canvas_data JSONB DEFAULT '{}', -- Canvas positions, zoom, etc.
    version INTEGER DEFAULT 1,
    is_template BOOLEAN DEFAULT FALSE,
    tags TEXT[], -- Array of tags
    view_count INTEGER DEFAULT 0,
    fork_count INTEGER DEFAULT 0,
    parent_diagram_id UUID REFERENCES diagrams(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tables in diagrams
CREATE TABLE diagram_tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    diagram_id UUID NOT NULL REFERENCES diagrams(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100),
    description TEXT,
    position_x REAL DEFAULT 0,
    position_y REAL DEFAULT 0,
    width REAL DEFAULT 200,
    height REAL DEFAULT 150,
    color VARCHAR(7) DEFAULT '#ffffff', -- Hex color
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(diagram_id, name)
);

-- Columns in tables
CREATE TABLE table_columns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_id UUID NOT NULL REFERENCES diagram_tables(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    data_type column_data_type NOT NULL,
    length INTEGER,
    precision INTEGER,
    scale INTEGER,
    is_primary_key BOOLEAN DEFAULT FALSE,
    is_foreign_key BOOLEAN DEFAULT FALSE,
    is_unique BOOLEAN DEFAULT FALSE,
    is_nullable BOOLEAN DEFAULT TRUE,
    is_auto_increment BOOLEAN DEFAULT FALSE,
    default_value TEXT,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(table_id, name)
);

-- Relationships between tables
CREATE TABLE table_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    diagram_id UUID NOT NULL REFERENCES diagrams(id) ON DELETE CASCADE,
    from_table_id UUID NOT NULL REFERENCES diagram_tables(id) ON DELETE CASCADE,
    to_table_id UUID NOT NULL REFERENCES diagram_tables(id) ON DELETE CASCADE,
    from_column_id UUID NOT NULL REFERENCES table_columns(id) ON DELETE CASCADE,
    to_column_id UUID NOT NULL REFERENCES table_columns(id) ON DELETE CASCADE,
    relationship_type relationship_type NOT NULL,
    constraint_name VARCHAR(100),
    on_delete VARCHAR(20) DEFAULT 'RESTRICT', -- CASCADE, RESTRICT, SET NULL, SET DEFAULT
    on_update VARCHAR(20) DEFAULT 'RESTRICT',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Diagram versions for version control
CREATE TABLE diagram_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    diagram_id UUID NOT NULL REFERENCES diagrams(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    title VARCHAR(200),
    description TEXT,
    changes_summary TEXT,
    diagram_data JSONB NOT NULL, -- Complete diagram state
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(diagram_id, version_number)
);

-- Comments and collaboration
CREATE TABLE diagram_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    diagram_id UUID NOT NULL REFERENCES diagrams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES diagram_comments(id),
    content TEXT NOT NULL,
    position_x REAL,
    position_y REAL,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Real-time collaboration sessions
CREATE TABLE collaboration_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    diagram_id UUID NOT NULL REFERENCES diagrams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cursor_position JSONB,
    last_seen TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Diagram templates
CREATE TABLE diagram_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- e-commerce, blog, social-media, etc.
    diagram_data JSONB NOT NULL,
    preview_image_url VARCHAR(500),
    is_featured BOOLEAN DEFAULT FALSE,
    download_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- User activities/audit log
CREATE TABLE user_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    diagram_id UUID REFERENCES diagrams(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL, -- created, updated, deleted, viewed, shared
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_diagrams_owner_id ON diagrams(owner_id);
CREATE INDEX idx_diagrams_team_id ON diagrams(team_id);
CREATE INDEX idx_diagrams_visibility ON diagrams(visibility);
CREATE INDEX idx_diagrams_created_at ON diagrams(created_at);
CREATE INDEX idx_diagram_tables_diagram_id ON diagram_tables(diagram_id);
CREATE INDEX idx_table_columns_table_id ON table_columns(table_id);
CREATE INDEX idx_table_relationships_diagram_id ON table_relationships(diagram_id);
CREATE INDEX idx_diagram_versions_diagram_id ON diagram_versions(diagram_id);
CREATE INDEX idx_collaboration_sessions_diagram_id ON collaboration_sessions(diagram_id);
CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX idx_user_activities_created_at ON user_activities(created_at);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_diagrams_updated_at BEFORE UPDATE ON diagrams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_diagram_tables_updated_at BEFORE UPDATE ON diagram_tables FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_table_columns_updated_at BEFORE UPDATE ON table_columns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_diagram_comments_updated_at BEFORE UPDATE ON diagram_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 