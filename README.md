# PodSum - AI Podcast Summarizer

A modern, responsive podcast summarization app built with React, TypeScript, and Tailwind CSS. Transform any podcast into actionable insights with AI-powered summarization.

## 🚀 Features

- **Smart Upload**: Drag & drop audio files or paste podcast URLs
- **AI Summarization**: Get key takeaways, timestamps, and structured summaries
- **Multiple Sources**: Supports Spotify, Apple Podcasts, RSS feeds, and direct uploads
- **Beautiful UI**: Glass morphism design with Spotify × Notion aesthetic
- **Responsive**: Mobile-first design that works on all devices
- **Accessibility**: WCAG AA compliant with keyboard navigation
- **Authentication**: Ready for Firebase Google Sign-In integration

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Router**: React Router v6
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Build**: Vite
- **Styling**: Custom design system with glass panels

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd podsum
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   # Create a .env.local file with your Firebase configuration
   touch .env.local
   ```

4. Configure Firebase (required for full functionality):
   ```env
   # Add these to your .env.local file
   VITE_FIREBASE_API_KEY=your_firebase_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   
   # Optional API configuration
   VITE_API_BASE_URL=http://localhost:3000/api
   VITE_APP_ENV=development
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:8080](http://localhost:8080) in your browser

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AuthGate.tsx    # Authentication wrapper
│   ├── Avatar.tsx      # User avatar component
│   ├── Badge.tsx       # Status badges
│   ├── Button.tsx      # Button with variants
│   ├── Container.tsx   # Layout container
│   ├── EmptyState.tsx  # Empty state illustrations
│   ├── FileDropzone.tsx # File upload component
│   ├── Footer.tsx      # App footer
│   ├── Header.tsx      # Navigation header
│   ├── Input.tsx       # Form input component
│   ├── Kbd.tsx         # Keyboard shortcut display
│   ├── LoadingSpinner.tsx # Loading animations
│   ├── Pagination.tsx  # Pagination controls
│   ├── ProgressBar.tsx # Progress indicators
│   ├── SearchInput.tsx # Search with shortcuts
│   ├── Skeleton.tsx    # Loading skeletons
│   ├── SummaryCard.tsx # Podcast summary cards
│   ├── Tabs.tsx        # Tab navigation
│   └── Tooltip.tsx     # Tooltip component
├── pages/              # Page components
│   ├── Dashboard.tsx   # User dashboard
│   ├── Landing.tsx     # Landing page
│   ├── Profile.tsx     # User profile & settings
│   ├── Summary.tsx     # Summary detail view
│   └── Upload.tsx      # Upload & processing
├── lib/                # Utilities and services
│   ├── api.ts         # API client functions
│   ├── firebase.ts    # Firebase configuration
│   ├── firestore.ts   # Database operations
│   ├── formatting.ts  # Data formatting utils
│   ├── storage.ts     # File storage operations
│   └── utils.ts       # General utilities
├── assets/            # Static assets
└── App.tsx           # Main application component
```

## 🎨 Design System

The app uses a custom design system with:

- **Colors**: Ink (grays) and Brand (blues) color scales
- **Typography**: Inter font with custom spacing
- **Components**: Glass panels with backdrop blur
- **Animations**: Smooth Framer Motion transitions
- **Icons**: Lucide React icon set

## 🔌 API Integration

The app includes mock API services that can be replaced with real implementations:

### Upload Endpoint
```typescript
POST /api/upload
{
  "type": "file" | "url",
  "file"?: File,
  "url"?: string,
  "options"?: {
    "lang": string,
    "detail": "brief" | "standard" | "deep",
    "timestamps": boolean
  }
}
```

### Summary Endpoints
```typescript
GET /api/summaries/:id      # Get single summary
GET /api/summaries          # List summaries with pagination
```

## 🔥 Firebase Integration

Ready for Firebase integration with:

- **Authentication**: Google Sign-In setup
- **Firestore**: User and summary data models
- **Storage**: Audio file uploads
- **Security**: RLS policies for user data

## ♿ Accessibility

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Focus management
- Color contrast compliance
- Screen reader optimization

## 🎯 Key Features Implementation

### Landing Page
- Hero section with gradient text effects
- Interactive file upload demo
- "How it works" animated steps
- Social proof and testimonials
- FAQ section (expandable)

### Upload & Processing
- Dual upload modes (file/URL)
- Real-time progress tracking
- Processing state visualization
- Advanced options drawer
- Error handling and retry

### Dashboard
- Search with keyboard shortcuts
- Filter and sort options
- Summary cards with actions
- Usage statistics
- Pagination support

### Summary Detail
- Structured summary display
- Timestamp navigation
- Copy/download/share actions
- Regeneration options
- Sidebar metadata

### Profile & Settings
- User account management
- Usage statistics
- Privacy controls
- Data export
- Account deletion

## 🚀 Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Preview the build:
   ```bash
   npm run preview
   ```

3. Deploy to your preferred platform:
   - Vercel: `vercel deploy`
   - Netlify: Connect repository
   - Firebase Hosting: `firebase deploy`

## 📝 Environment Variables

```env
# Firebase Configuration (Required)
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# API Configuration (Optional)
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_KEY=your_api_key_here

# App Configuration
VITE_APP_ENV=development
VITE_APP_NAME=PodSum
VITE_APP_VERSION=1.0.0
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

If you have any questions or need help, please:

1. Check the [documentation](docs/)
2. Open an [issue](issues/)
3. Join our [Discord community](discord-link)

---

Made with ❤️ for podcast lovers everywhere