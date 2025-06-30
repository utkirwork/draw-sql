# DrawSQL Clone - Professional Database Schema Designer

🚀 **Professional-grade database diagramming tool** built with modern web technologies. Create beautiful database diagrams with real-time collaboration, just like DrawSQL.

![DrawSQL Clone](https://via.placeholder.com/800x400/3b82f6/ffffff?text=DrawSQL+Clone+-+Database+Schema+Designer)

## ✨ Features

### 🎨 **Beautiful Database Diagrams**
- **Visual Schema Design**: Drag-and-drop interface for creating database tables
- **Professional Styling**: Clean, modern UI with customizable themes
- **Multiple Database Support**: PostgreSQL, MySQL, SQL Server, MariaDB
- **Export Options**: PNG, SVG, PDF, SQL, JSON formats

### 🤝 **Real-time Collaboration**
- **Live Editing**: Multiple users can edit diagrams simultaneously
- **User Cursors**: See where other users are working in real-time
- **Comments System**: Add comments and discussions to specific diagram areas
- **Version History**: Track changes and revert to previous versions

### 💾 **Database Support**
- **PostgreSQL**: Full support with advanced data types
- **MySQL/MariaDB**: Complete compatibility
- **SQL Server**: Comprehensive feature support
- **Schema Import/Export**: Import from existing databases

### 🔐 **Enterprise Features**
- **Team Management**: Create teams and manage permissions
- **Access Control**: Public, private, and team-only diagrams
- **User Authentication**: Secure JWT-based authentication
- **Audit Logging**: Track all user activities

### 📱 **Modern Tech Stack**
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Redis caching
- **Real-time**: Socket.IO for live collaboration
- **Styling**: Tailwind CSS + Framer Motion
- **Canvas**: Konva.js for high-performance rendering

## 🏗️ **Architecture**

```
drawSql/
├── frontend/           # React + TypeScript frontend
├── backend/           # Node.js + Express API
├── database/          # PostgreSQL schema and seeds
├── docker-compose.yml # Development environment
└── README.md         # This file
```

## 🚀 **Quick Start**

### Prerequisites
- **Node.js** 18+ 
- **Docker** and **Docker Compose**
- **Git**

### 1. Clone Repository
```bash
git clone <repository-url>
cd drawSql
```

### 2. Start Database Services
```bash
docker compose up -d
```

This will start:
- **PostgreSQL** on port 5432
- **Redis** on port 6379  
- **pgAdmin** on port 8080

### 3. Install Dependencies
```bash
# Install root dependencies
npm install

# Install all project dependencies
npm run install:all
```

### 4. Environment Setup
```bash
# Copy environment file
cp .env.example .env

# Edit environment variables if needed
nano .env
```

### 5. Start Development Servers
```bash
# Start both frontend and backend
npm run dev

# Or start them separately:
npm run dev:backend   # Backend on port 5000
npm run dev:frontend  # Frontend on port 3000
```

### 6. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **pgAdmin**: http://localhost:8080 (admin@drawsql.local / admin123)

## 📋 **Default Accounts**

| Email | Password | Role | Description |
|-------|----------|------|-------------|
| admin@drawsql.local | password123 | admin | Administrator account |
| john@example.com | password123 | user | Regular user |
| jane@example.com | password123 | premium | Premium user |
| demo@drawsql.local | password123 | user | Demo account |

## 🛠️ **Development**

### Backend Development
```bash
cd backend
npm run dev          # Start development server
npm run build        # Build production version
npm run test         # Run tests
npm run lint         # Lint code
```

### Frontend Development
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build production version
npm run preview      # Preview production build
npm run lint         # Lint code
```

### Database Operations
```bash
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed demo data
```

## 🐳 **Docker Commands**

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# View logs
docker compose logs

# Restart a specific service
docker compose restart postgres

# Access database directly
docker compose exec postgres psql -U drawsql_user -d drawsql_db
```

## 📊 **Database Schema**

The application uses a comprehensive PostgreSQL schema with the following main entities:

- **Users & Authentication**: User management with JWT tokens
- **Teams & Collaboration**: Team-based access control
- **Diagrams**: Database schema definitions
- **Tables & Columns**: Visual database elements
- **Relationships**: Foreign key relationships
- **Comments**: Collaborative feedback system
- **Version History**: Track diagram changes
- **Templates**: Reusable diagram templates

## 🔧 **Configuration**

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |
| `JWT_SECRET` | JWT signing secret | Required |
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Backend server port | `5000` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

### Database Configuration
```sql
-- Main database
Database: drawsql_db
User: drawsql_user
Password: drawsql_password_2024!
Port: 5432
```

## 🚢 **Production Deployment**

### Build for Production
```bash
# Build both frontend and backend
npm run build

# Build individually
npm run build:backend
npm run build:frontend
```

### Docker Production
```bash
# Use production docker-compose file
docker compose -f docker-compose.prod.yml up -d
```

### Environment Setup
1. Set secure JWT secrets
2. Configure production database
3. Set up SSL certificates
4. Configure reverse proxy (nginx)
5. Set up monitoring and logging

## 📈 **Performance**

- **Frontend**: Optimized React with code splitting
- **Backend**: Efficient PostgreSQL queries with indexing
- **Caching**: Redis for session and query caching
- **Real-time**: Optimized Socket.IO event handling
- **Assets**: CDN-ready static assets

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines
- Follow TypeScript strict mode
- Use conventional commit messages
- Add tests for new features
- Update documentation
- Follow ESLint configuration

## 📝 **API Documentation**

### Authentication
```bash
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
GET  /api/auth/me
```

### Diagrams
```bash
GET    /api/diagrams          # List user diagrams
POST   /api/diagrams          # Create new diagram
GET    /api/diagrams/:id      # Get diagram details
PUT    /api/diagrams/:id      # Update diagram
DELETE /api/diagrams/:id      # Delete diagram
```

### Tables & Columns
```bash
GET    /api/diagrams/:id/tables     # Get diagram tables
POST   /api/diagrams/:id/tables     # Add table
PUT    /api/tables/:id              # Update table
DELETE /api/tables/:id              # Delete table
```

### Real-time Events
```javascript
// Join diagram for collaboration
socket.emit('join_diagram', { diagram_id })

// Real-time cursor movements
socket.emit('cursor_move', { diagram_id, position })

// Live diagram changes
socket.emit('diagram_change', { diagram_id, type, payload })
```

## 🧪 **Testing**

```bash
# Run all tests
npm test

# Run backend tests
npm run test:backend

# Run frontend tests  
npm run test:frontend

# Run with coverage
npm run test:coverage
```

## 📚 **Tech Stack Details**

### Frontend
- **React 18**: Latest React with concurrent features
- **TypeScript**: Type-safe development
- **Vite**: Lightning-fast build tool
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Smooth animations
- **Konva.js**: 2D canvas for diagram rendering
- **React Query**: Server state management
- **Zustand**: Client state management
- **Socket.IO Client**: Real-time communication

### Backend
- **Node.js**: JavaScript runtime
- **Express**: Web framework
- **TypeScript**: Type-safe server development
- **PostgreSQL**: Primary database
- **Redis**: Caching and sessions
- **Socket.IO**: Real-time WebSocket server
- **JWT**: Authentication tokens
- **Winston**: Logging
- **Joi/Zod**: Validation

### DevOps
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration
- **PostgreSQL**: Database with advanced features
- **Redis**: In-memory data structure store
- **Nginx**: Reverse proxy (production)

## 🔒 **Security**

- **JWT Authentication**: Secure token-based auth
- **CORS Protection**: Configured cross-origin requests
- **Rate Limiting**: API request throttling
- **Input Validation**: Comprehensive data validation
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Content Security Policy
- **HTTPS**: SSL/TLS encryption (production)

## 📞 **Support**

- **Documentation**: Check this README and code comments
- **Issues**: Use GitHub Issues for bug reports
- **Discussions**: GitHub Discussions for questions
- **Email**: support@drawsql-clone.com

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **DrawSQL**: Inspiration for the original design
- **React Community**: Amazing ecosystem and tools
- **PostgreSQL**: Robust database foundation
- **Open Source**: All the amazing libraries used

---

**Made with ❤️ by Professional Developers**

*Create beautiful database diagrams with the power of modern web technologies.* 