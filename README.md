# SpaceTwo

A modern design tool community platform built with Next.js, React, and TypeScript, featuring Supabase authentication.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/alan-giojellis-projects/v0-space-two)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/KBUEF3AHCBc)

## Overview

SpaceTwo is a platform for designers and creators to share, discover, and collaborate on design projects. It provides a clean, intuitive interface for browsing community content, organizing projects, and viewing detailed file information with secure user authentication.

## Features

- **🔍 Smart Search**: Advanced search functionality with keyboard shortcuts (⌘K/Ctrl+K)
- **🔐 Authentication**: Google OAuth login via Supabase
- **👤 User Profiles**: Automatic profile creation and management
- **🏠 Community View**: Browse trending and categorized design content
- **📁 Project Management**: Organize and view your design projects
- **📄 File Details**: View comprehensive information about design files
- **📱 Responsive Design**: Works seamlessly across different device sizes
- **🌙 Dark Mode**: Modern dark interface for reduced eye strain
- **🛡️ Protected Routes**: Secure areas requiring authentication

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Authentication**: [Supabase](https://supabase.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: React Hooks + Context
- **Animation**: [Framer Motion](https://www.framer.com/motion/)

## Documentation

- **Engineering**: [Notion | Engineering](https://www.notion.so/Engineering-2140295e491a8082925fe63ba4fcccbd)

## Getting Started

### Prerequisites

- Node.js 20.x or later
- Yarn 1.22.x or npm 10.x
- Supabase account (for authentication)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/spacetwo.git
cd spacetwo

# Install dependencies
yarn install
# or
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials (can be found in Notion | Engineering)

# Start the development server
yarn dev
# or
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

### Authentication Setup

For complete authentication setup including Supabase configuration and Google OAuth provider, see [AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md).

### Build

```bash
yarn build
# or
npm run build
```

## Project Structure

- `app/`: Next.js app router pages and API routes
- `components/`: Reusable UI components
- `containers/`: Component containers with business logic
- `contexts/`: React contexts (authentication, etc.)
- `lib/`: Utility functions and data services
- `data/`: Mock data for development
- `hooks/`: Custom React hooks
- `public/`: Static assets
- `styles/`: Global CSS and Tailwind configuration

## Authentication Features

- **OAuth Login**: Google sign-in
- **Session Management**: Automatic token refresh and persistence
- **Profile Management**: User profiles with avatar and metadata
- **Protected Routes**: Secure areas requiring authentication
- **Sign Out**: Clean session termination

## Deployment

This project is automatically deployed to Vercel from the main branch.

Live site: [https://v0-space-two.vercel.app/](https://v0-space-two.vercel.app/)

## Built with v0.dev

This project was initially created using [v0.dev](https://v0.dev), an AI-powered design tool. Changes made in v0.dev are automatically synced to this repository.

## License

MIT
