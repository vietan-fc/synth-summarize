# PodSum API

AI-powered podcast summarization backend service built with Node.js, Express, and TypeScript.

## 🚀 Features

- **Audio Processing**: Upload audio files or URLs for processing
- **AI Transcription**: Whisper-powered audio transcription
- **AI Summarization**: GPT-4 powered content summarization
- **Multiple Detail Levels**: Brief, standard, and deep analysis
- **Authentication**: Firebase Auth integration
- **File Upload**: Secure file handling with validation
- **Health Monitoring**: Comprehensive health checks
- **Rate Limiting**: User-based rate limiting
- **Logging**: Structured logging with performance metrics

## 🛠️ Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Authentication**: Firebase Admin SDK
- **AI Services**: OpenAI (Whisper + GPT-4)
- **File Processing**: FFmpeg for audio processing
- **Upload Handling**: Multer for file uploads
- **Security**: Helmet, CORS, input validation
- **Logging**: Custom structured logging system

## 📦 Installation

1. **Clone and setup**:
   ```bash
   cd api
   npm install
   ```

2. **Environment Configuration**:
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Required Environment Variables**:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `FIREBASE_PROJECT_ID`: Firebase project ID
   - `FIREBASE_CLIENT_EMAIL`: Firebase service account email
   - `FIREBASE_PRIVATE_KEY`: Firebase service account private key
   - `JWT_SECRET`: Secret for JWT token signing

## 🚀 Development

```bash
# Development with hot reload
npm run dev

# Development with file watching
npm run dev:watch

# Type checking
npm run type-check

# Build for production
npm run build

# Start production server
npm start
```

## 📝 API Endpoints

### Health Check
```
GET /api/health          # Basic health check
GET /api/health/detailed # Detailed system information
GET /api/health/ping     # Simple ping endpoint
```

### Authentication
All endpoints except health checks require authentication via Firebase ID token:
```
Authorization: Bearer <firebase_id_token>
```

### Upload & Processing
```
POST /api/upload                 # Upload file or URL for processing
GET /api/upload/status/:jobId    # Get processing status
DELETE /api/upload/cancel/:jobId # Cancel processing job
GET /api/upload/queue           # Get queue status
```

**Upload Request Format**:
```json
{
  "type": "file" | "url",
  "url": "https://example.com/podcast.mp3", // if type=url
  "options": {
    "detail": "brief" | "standard" | "deep",
    "timestamps": true,
    "lang": "en" // optional language code
  }
}
```

### Summaries
```
GET /api/summaries              # List user summaries (with pagination)
GET /api/summaries/:id          # Get specific summary
PUT /api/summaries/:id          # Update summary metadata
DELETE /api/summaries/:id       # Delete summary
POST /api/summaries/:id/regenerate # Regenerate with new options
GET /api/summaries/:id/export   # Export in various formats
```

**Query Parameters for Listing**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `search`: Search in title, description, content
- `sort`: Sort by (createdAt, updatedAt, title, duration)
- `order`: Sort order (asc, desc)
- `language`: Filter by language
- `detailLevel`: Filter by detail level
- `tags`: Filter by tags (comma-separated)

## 🏗️ Architecture

```
src/
├── index.ts              # Main server entry point
├── types/
│   └── index.ts         # TypeScript type definitions
├── utils/
│   ├── config.ts        # Configuration management
│   └── logger.ts        # Logging utilities
├── middleware/
│   ├── auth.ts          # Authentication middleware
│   ├── validation.ts    # Request validation
│   └── upload.ts        # File upload handling
├── services/
│   ├── openai.ts        # OpenAI integration
│   └── processor.ts     # Audio processing service
└── routes/
    ├── health.ts        # Health check endpoints
    ├── upload.ts        # Upload & processing routes
    └── summaries.ts     # Summary management routes
```

## 🔧 Configuration

The API uses environment variables for configuration. See `env.example` for all available options.

### Key Configuration Areas

1. **Server Settings**: Port, environment, CORS origins
2. **Upload Limits**: File size, allowed types, upload directory
3. **OpenAI**: API key, model settings, token limits
4. **Firebase**: Service account credentials
5. **Security**: JWT settings, rate limiting
6. **Logging**: Log levels and formats

## 🔒 Security Features

- **Input Validation**: Comprehensive request validation
- **File Type Restrictions**: Only audio/video files allowed
- **Size Limits**: Configurable file size limits
- **Rate Limiting**: Per-user request limits
- **CORS Protection**: Configurable allowed origins
- **Security Headers**: Helmet.js security headers
- **Authentication**: Firebase ID token verification
- **Authorization**: User-based resource access control

## 📊 Monitoring & Health

### Health Check Response
```json
{
  "status": "healthy" | "degraded" | "unhealthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "uptime": 3600,
  "services": {
    "database": "connected",
    "openai": "available",
    "storage": "accessible"
  },
  "system": {
    "memory": { "used": 123456, "total": 987654, "percentage": 12 },
    "cpu": { "usage": 15.5 },
    "disk": { "used": 1000000, "total": 10000000, "percentage": 10 }
  }
}
```

### Logging

The API provides structured logging with different levels:
- **Debug**: Detailed debugging information
- **Info**: General information messages
- **Warn**: Warning conditions
- **Error**: Error conditions

Log entries include contextual information like user IDs, request details, and performance metrics.

## 🔄 Processing Flow

1. **Upload**: User uploads audio file or provides URL
2. **Validation**: File type, size, and format validation
3. **Job Creation**: Processing job queued with unique ID
4. **Audio Processing**: Convert and optimize audio for transcription
5. **Transcription**: OpenAI Whisper processes audio to text
6. **Summarization**: GPT-4 generates structured summary
7. **Storage**: Summary stored and linked to user
8. **Notification**: Job completed, results available

## 🚨 Error Handling

The API provides comprehensive error handling with standardized error responses:

```json
{
  "error": "Error Type",
  "message": "Human-readable error message",
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/endpoint",
  "validation": [
    {
      "field": "fieldName",
      "message": "Field-specific error message",
      "value": "invalid_value"
    }
  ]
}
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📚 API Documentation

The API provides self-documenting endpoints:
- `GET /`: API overview and available endpoints
- `GET /api/docs`: Detailed API documentation

## 🚀 Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Set production environment variables**

3. **Start the server**:
   ```bash
   npm start
   ```

4. **Health check**:
   ```bash
   curl http://localhost:3000/api/health
   ```

### Docker Deployment (optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙋‍♂️ Support

For support and questions:
1. Check the API documentation at `/api/docs`
2. Review the health check endpoints
3. Check the application logs
4. Open an issue in the repository

---

Made with ❤️ for podcast enthusiasts everywhere
