# 📈 Stonkers.ai

> Your intelligent stock analysis platform

A modern, responsive web application built with React and TypeScript that provides comprehensive stock market analysis, portfolio management, and financial insights powered by real-time market data.

![React](https://img.shields.io/badge/React-19.0.0-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.1.0-646CFF?logo=vite)
![Mantine](https://img.shields.io/badge/Mantine-7.16.3-339af0?logo=mantine)

[Try it out here!](https://stonkersai.vercel.app/)

## ✨ Features

### 🏠 **Market Overview**
- Stock quotes and market data
- Company profiles and financial metrics
- Market news and analysis
- AI generated analysis of risks and competitive advantages

### 💼 **Portfolio Management**
- Track stock holdings and cash positions
- Portfolio valuation
- Drag-and-drop portfolio reordering
- Performance tracking
- Interactive pie chart visualization

### 👁️ **Watchlist**
- Monitor favorite stocks
- Customizable watchlist ordering
- Quick access to stock details

### 🧮 **Investment Calculator**
- Calculate potential returns and target prices
- Scenario analysis tools
- Supports 2 methods: EPS and FCF

### 🔍 **Advanced Search**
- Intelligent stock symbol search
- Company lookup and discovery

### 🔐 **Authentication**
- Google OAuth integration
- Guest access mode
- Secure session management
- Protected routes

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API server (configured separately)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SimonMilord/stonkers.ai.git
   cd stonkers.ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   VITE_BACKEND_URL=your_backend_api_url
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🏗️ Tech Stack

### Frontend Framework
- **React 19** - Modern UI library with hooks and context
- **TypeScript** - Type-safe JavaScript development
- **Vite** - Fast build tool and development server

### UI & Styling
- **Mantine 7.16** - Modern React components library
- **Chart.js** - Interactive charts and data visualization
- **React Icons** - Comprehensive icon library
- **CSS Custom Properties** - Theming and responsive design

### State Management
- **React Context** - Authentication and stock data management
- **Custom Hooks** - Reusable business logic
- **Local State** - Component-level state management

### Routing & Navigation
- **React Router 5** - Client-side routing
- **Protected Routes** - Authentication-based access control

### Development Tools
- **ESLint** - Code quality and consistency
- **Prettier** - Code formatting
- **PostCSS** - CSS processing and optimization

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── addHoldingForm/   # Portfolio stock/cash addition
│   ├── calculatorFormCard/  # Investment calculator
│   ├── companyProfileCard/  # Company information display
│   ├── portfolioTable/   # Portfolio holdings table
│   ├── searchBox/        # Stock symbol search
│   └── ...
├── contexts/            # React Context providers
│   ├── authContext.tsx  # Authentication state
│   └── stockContext.tsx # Stock data management
├── hooks/               # Custom React hooks
│   ├── usePortfolioHoldings.ts  # Portfolio state management
│   ├── useStockData.ts  # Market data fetching
│   └── ...
├── pages/               # Main application pages
│   ├── homePage.tsx     # Market overview
│   ├── portfolioPage.tsx # Portfolio management
│   ├── watchlistPage.tsx # Stock watchlist
│   ├── calculatorPage.tsx # Investment calculator
│   └── ...
├── types/               # TypeScript type definitions
├── utils/               # Utility functions and API calls
└── styles/              # Global styles and themes
```

## 🎨 Key Components

### Portfolio Management
- **Real-time tracking** of stock holdings and cash positions
- **Drag-and-drop reordering** with persistent backend sync
- **Performance metrics** including total value, gains/losses
- **Interactive visualizations** with pie charts

### Market Data Integration
- **Finnhub API integration** for real-time market data
- **Bulk quote fetching** for optimal performance
- **Error handling and fallbacks** for reliable data access
- **Caching strategies** for improved user experience

### User Experience
- **Responsive design** for mobile and desktop
- **Loading states and error handling** for smooth interactions
- **Toast notifications** for user feedback
- **Dark theme support** with CSS custom properties

## 🔮 What's Coming in V2.0

The next major release will bring powerful new features and enhancements:

### 🔄 **Real-time Updates**
- **WebSocket integration** for automatic quote refresh
- Real-time portfolio value updates

### 🔍 **Enhanced Search & Discovery**
- Query suggestions for improved stock discovery
- Enhanced company lookup capabilities

### 📊 **Advanced Analytics & Reporting**
- **Earnings summary page** with comprehensive analysis
- **Insider transactions tracking** for better investment insights
- **AI-powered comprehensive stock reports** with deep analysis
- Enhanced earnings surprise analysis

### 📈 **Improved Portfolio Features**
- **Multi-currency support** for international portfolios
- **Transaction history tracking** for detailed performance analysis
- **Advanced performance metrics** and benchmarking
- Enhanced portfolio analytics dashboard

### 💹 **Enhanced Charting & Visualization**
- Additional chart types and timeframes
- Advanced portfolio visualization tools
- Performance comparison charts

### 🧮 **Advanced Calculator**
- **Extended investment parameters** for more accurate projections
- Additional valuation methods and models
- Scenario analysis with multiple variables

### 👁️ **Watchlist Improvements**
- **Multiple watchlist support** for better organization
- **Notes and annotations** for each stock
- Custom alerts and notifications

*Stay tuned for these exciting updates coming in 2026!*

## 🚀 Deployment

### Vercel Deployment
The project is configured for Vercel deployment with:
- Automatic builds from `develop` branch
- SPA routing configuration
- Environment variable support

## 🔌 API Integration

The application integrates with a backend API for:
- **Authentication** - Google OAuth and guest access
- **Portfolio data** - CRUD operations for holdings
- **Watchlist management** - Stock tracking and organization
- **Market data** - Real-time quotes and company information
- **AI inference** - Groq inference API to generate content

## 🎯 Performance Optimizations

- **Code splitting** with React lazy loading
- **Memoized calculations** for expensive operations
- **Bulk API requests** to minimize network calls
- **Progressive loading** for improved perceived performance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Finnhub.io](https://finnhub.io) - Financial data API
- [Mantine](https://mantine.dev) - React components library
- [Chart.js](https://www.chartjs.org) - Data visualization
- [React](https://reactjs.org) - UI framework
- [Groq](https://groq.com) - AI Inference API