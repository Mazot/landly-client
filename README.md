# 🌍 Landly Client

A modern React application for connecting people with businesses, helpers, and official representatives of different nationalities in foreign countries.

## 🛠️ Technology Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Fast build tool and dev server
- **Tanstack Query** (React Query) - Server state management
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **Axios** - HTTP client

## 📋 Prerequisites

- **Node.js 18+** - [Install Node.js](https://nodejs.org/)
- **npm or yarn** - Package manager (comes with Node.js)
- **landly-server** - Backend API running on `http://localhost:8080`

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
VITE_API_URL=http://localhost:8080/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

### 5. Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```text
src/
├── components/           # Reusable UI components
│   ├── auth/            # Authentication components
│   ├── layout/          # Layout components (Header, Footer)
│   └── organizations/   # Organization-specific components
├── hooks/               # Custom React hooks
│   ├── useAuth.ts       # Authentication hooks
│   ├── useOrganizations.ts
│   └── useReferences.ts
├── lib/                 # Third-party library configurations
│   └── axios.ts         # Axios instance with interceptors
├── pages/               # Page components
│   ├── auth/            # Login, Signup pages
│   ├── HomePage.tsx
│   ├── OrganizationsPage.tsx
│   ├── OrganizationDetailPage.tsx
│   └── ProfilePage.tsx
├── services/            # API service layer
│   ├── auth.service.ts
│   ├── organization.service.ts
│   └── reference.service.ts
├── stores/              # Zustand stores
│   └── authStore.ts
├── types/               # TypeScript type definitions
│   └── api.ts
├── App.tsx              # Main app component with routing
├── main.tsx             # Application entry point
└── index.css            # Global styles with Tailwind
```

## 🎨 Features

### Authentication

- ✅ Email/Password login and signup
- ✅ OAuth 2.0 with Google
- ✅ JWT token management
- ✅ Protected routes
- ✅ Automatic token refresh

### Organizations

- ✅ Browse all organizations
- ✅ Advanced filtering (country, type, origin)
- ✅ Search functionality
- ✅ View organization details
- ✅ Create/Edit organizations (authenticated users)
- ✅ Pagination support

### User Profile

- ✅ View user information
- ✅ Language preferences
- ✅ Manage organizations

### UI/UX

- ✅ Responsive design (mobile-first)
- ✅ Loading states
- ✅ Error handling
- ✅ Tailwind CSS utilities
- ✅ Smooth transitions

## 🔌 API Integration

The client connects to the landly-server REST API:

### Authentication Endpoints

- `POST /api/user/signup` - Create new account
- `POST /api/user/signin` - Login
- `GET /api/user/oauth/google/login` - Google OAuth
- `GET /api/user/me` - Get current user
- `POST /api/user/logout` - Logout

### Organization Endpoints

- `GET /api/organisations` - List organizations (with filters)
- `GET /api/organisations/:id` - Get organization details
- `POST /api/organisations` - Create organization
- `PUT /api/organisations/:id` - Update organization
- `DELETE /api/organisations/:id` - Delete organization

### Reference Data

- `GET /api/countries` - List countries
- `GET /api/languages` - List languages
- `GET /api/organisation-types` - List organization types

## 🎯 Available Scripts

```bash
# Development
npm run dev          # Start dev server

# Building
npm run build        # Build for production
npm run preview      # Preview production build

# Linting
npm run lint         # Run ESLint
```

## 🔧 Configuration

### Tailwind CSS

Custom configuration in `tailwind.config.js`:

- Custom color palette (primary shades)
- Component classes (btn-primary, input-field, card)
- Responsive breakpoints

### Vite

Configuration in `vite.config.ts`:

- Path aliases (`@/` points to `src/`)
- API proxy to backend server
- React plugin with Fast Refresh

### React Query

Default configuration in `main.tsx`:

- Retry: 1 attempt
- Stale time: 5 minutes
- No refetch on window focus

## 🌐 Proxy Configuration

The Vite dev server proxies `/api` requests to the backend:

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
  },
}
```

This allows calling the API as `/api/...` without CORS issues during development.

## 🚧 Future Enhancements

- [ ] Map integration (Google Maps / Leaflet)
- [ ] Real-time chat functionality
- [ ] Image upload for organizations
- [ ] Advanced search with autocomplete
- [ ] Multi-language support (i18n)
- [ ] Dark mode
- [ ] User reviews and ratings

## 🐛 Troubleshooting

### API Connection Issues

If you can't connect to the backend:

1. Ensure landly-server is running on `http://localhost:8080`
2. Check the `VITE_API_URL` in your `.env` file
3. Verify CORS settings in the backend

### Build Errors

If you encounter build errors:

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---
