# 🛸 Drone Tracker

A real-time drone tracking system that displays drones on an interactive map of Israel. The system automatically generates new drones every 10 seconds, validates their locations to ensure they're within Israel's boundaries, and broadcasts updates to connected clients via WebSocket.

![Drone Tracker](https://via.placeholder.com/800x400/111827/ffffff?text=Drone+Tracker+Map+View)

## ✨ Features

- **Automatic Drone Generation** - Creates new drones every 10 seconds with realistic random locations
- **Geographic Validation** - Ensures drones only appear within Israel's land boundaries using polygon validation
- **Real-time Updates** - WebSocket broadcasts new drones instantly to all connected clients
- **Interactive Map** - Pan, zoom, and interact with markers on an OpenStreetMap-based map
- **Hover Tooltips** - Quick view of drone details on mouseover
- **Click Popups** - Persistent popup with full drone information
- **REST API** - Full CRUD operations for drone management
- **API Documentation** - Swagger UI available at `/docs` and `/api`

## 🏗️ Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Frontend  │ ◄─────► │    Backend   │ ◄─────► │ PostgreSQL  │
│   (React)   │  REST   │   (NestJS)   │  ORM    │  Database   │
└─────────────┘         └──────────────┘         └─────────────┘
       ▲                        │
       │                        │
       └──────── WebSocket ──────┘
```

### Data Flow

1. **Backend** automatically generates drones every 10 seconds
2. **Geographic validation** ensures drones are within Israel's boundaries
3. **Database** persists all drone records
4. **WebSocket** broadcasts new drones to all connected clients
5. **Frontend** displays drones on an interactive map with real-time updates

## 🛠️ Tech Stack

### Backend
- **NestJS** - Modern Node.js framework with TypeScript
- **TypeORM** - Object-relational mapping for PostgreSQL
- **PostgreSQL** - Relational database for drone persistence
- **Socket.IO** - WebSocket library for real-time communication
- **@nestjs/schedule** - Task scheduling for automated drone generation
- **@nestjs/swagger** - API documentation generation

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **MapLibre GL** - Open-source map rendering library
- **Axios** - HTTP client for API calls
- **Socket.IO Client** - WebSocket client for real-time updates

### Infrastructure
- **Docker** - Containerization for PostgreSQL

## 📋 Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- Git

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/drone-tracker.git
cd drone-tracker
```

### 2. Start PostgreSQL database

```bash
docker compose up -d
```

This starts PostgreSQL 15 in a Docker container on port 5432.

### 3. Set up Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=drones_db
PORT=3000
```

### 4. Set up Frontend

```bash
cd ../frontend
npm install
```

Optionally create a `.env` file in the `frontend` directory:

```env
VITE_API_BASE=http://127.0.0.1:3000
VITE_WS_URL=ws://127.0.0.1:3000/ws
```

## 🏃 Running the Application

### Start Backend

```bash
cd backend
npm run start:dev
```

The backend will start on `http://localhost:3000`

- API Documentation: `http://localhost:3000/docs` or `http://localhost:3000/api`
- Health Check: `http://localhost:3000/health`

### Start Frontend

In a new terminal:

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

Open your browser and navigate to `http://localhost:5173` to see the interactive map.

## 📡 API Endpoints

### REST API

- `GET /drones` - Get all drones
- `GET /drones/:id` - Get a specific drone by ID
- `POST /drones` - Create a new drone
- `DELETE /drones/reset` - Delete all drones

### WebSocket

- **Namespace**: `/ws`
- **Event**: `newDrone` - Emitted when a new drone is created

## 🗺️ Map Features

- **Interactive Map** - Pan and zoom using mouse or touch gestures
- **Drone Markers** - Each drone appears as a marker on the map
- **Hover Tooltips** - Hover over a marker to see quick drone details
- **Click Popups** - Click a marker to see full drone information
- **Real-time Updates** - New drones appear automatically without page refresh

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm run test
```

### E2E Tests

```bash
cd backend
npm run test:e2e
```

## 📁 Project Structure

```
drone-tracker/
├── backend/              # NestJS backend
│   ├── src/
│   │   ├── main.ts      # Application entry
│   │   ├── app.module.ts
│   │   ├── health.controller.ts
│   │   ├── drones/      # Drone feature module
│   │   │   ├── drone.entity.ts
│   │   │   ├── drones.controller.ts
│   │   │   ├── drones.service.ts
│   │   │   ├── drones.gateway.ts
│   │   │   └── DTO/
│   │   └── geo/         # Geographic utilities
│   │       ├── geo.util.ts
│   │       └── israel.geo.json
│   └── package.json
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   │   └── MapView.tsx
│   │   ├── api/         # API client
│   │   ├── hooks/       # React hooks
│   │   ├── types/       # TypeScript types
│   │   └── lib/         # Utilities
│   └── package.json
├── docker-compose.yml   # Database container
└── README.md
```

## 🔧 Configuration

### Environment Variables

#### Backend
- `DB_HOST` - Database host (default: 127.0.0.1)
- `DB_PORT` - Database port (default: 5432)
- `DB_USER` - Database username (default: postgres)
- `DB_PASS` - Database password (default: postgres)
- `DB_NAME` - Database name (default: drones_db)
- `PORT` - Backend server port (default: 3000)

#### Frontend
- `VITE_API_BASE` - Backend API base URL (default: http://127.0.0.1:3000)
- `VITE_WS_URL` - WebSocket URL (default: derived from API base)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author

Your Name - [@yourusername](https://github.com/yourusername)

## 🙏 Acknowledgments

- OpenStreetMap for map tiles
- MapLibre for the open-source map library
- NestJS and React communities for excellent frameworks

---

⭐ If you find this project useful, please consider giving it a star!

