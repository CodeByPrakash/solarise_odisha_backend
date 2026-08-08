# Solarise Odisha Admin Portal

A admin portal for Solarise Odisha built with React, Vite, and Tailwind CSS.

## Features

- Responsive layout with collapsible sidebar
- Dashboard with key metrics cards
- Recent activity feed
- Custom color scheme (Solarise Green, Blue, Yellow)
- Built with modern frontend stack:
  - React 19
  - Vite 8
  - Tailwind CSS 4

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:5174](http://localhost:5174) in your browser

## Environment Variables

Create a `.env` file in the root directory:

```
VITE_API_URL=http://localhost:5000/api
```

## Project Structure

```
src/
  ├── main.jsx         # Entry point
  ├── App.jsx          # Main application component
  ├── index.css        # Tailwind CSS imports
  └── components/      # Reusable components (to be added)
```

## Design System

- **Primary Color**: Solarise Green (#4CAF50)
- **Secondary Color**: Solarise Blue (#2196F3)
- **Accent Color**: Solarise Yellow (#FFEB3B)
- **Theme**: Minimalist with clay-inspired elements
- **Responsiveness**: Mobile-first design

## Next Steps

1. Implement authentication
2. Create components for each module:
   - Projects management
   - Consumers directory
   - Document handling
   - Payment processing
   - Reports and analytics
3. Connect to the Solarise Odisha API
4. Add role-based access control
5. Implement offline capabilities for field agents

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

---
Built for Solarise Odisha Admin Team