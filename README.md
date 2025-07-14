# Subriva Billing System

A comprehensive billing and inventory management system built with React 19, TypeScript, and Ant Design.

## 🚀 Features

### Core Functionality
- **Sales Management**: Create and manage sales records
- **Inventory Control**: Stock in/out management with expiry tracking
- **Customer Management**: Complete customer and vendor database
- **Product Management**: Products, categories, variants, and units
- **Multi-tenant Architecture**: Support for multiple organizations
- **Role-based Access Control**: Granular permissions system

### UI/UX Features
- **Customizable Themes**: 20+ preset themes with live preview
- **Draggable Interface**: Move theme button anywhere on screen
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Mode Support**: Full dark theme implementation
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support

### Technical Features
- **Error Boundaries**: Graceful error handling
- **Performance Monitoring**: Real-time performance tracking
- **Type Safety**: Full TypeScript implementation
- **State Management**: Redux Toolkit with dynamic selectors
- **Lazy Loading**: Code splitting for better performance

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Modern browser (Chrome, Firefox, Safari, Edge)

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd probilldesk
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm start
```

4. **Open in browser**
```
http://localhost:3000
```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable components
│   ├── antd/          # Ant Design components
│   ├── common/        # Shared components
│   └── Header/        # Header components
├── pages/             # Page components
│   ├── Dashboard/     # Dashboard pages
│   ├── login/         # Authentication pages
│   └── ...           # Feature pages
├── services/          # API and business logic
│   ├── api/          # API services
│   └── redux/        # State management
├── helpers/           # Utility functions
├── hooks/             # Custom React hooks
└── types/             # TypeScript type definitions
```

## 🔧 Available Scripts

```bash
# Development
npm start              # Start development server
npm run dev            # Start with linting

# Building
npm run build          # Build for production
npm run eject          # Eject from Create React App

# Testing
npm test               # Run tests
npm run test:coverage  # Run tests with coverage

# Code Quality
npm run lint           # Run ESLint
npm run lint:fix       # Fix ESLint issues
npm run format         # Format code with Prettier
npm run type-check     # TypeScript type checking
```

## 🎨 Theme Customization

The app includes a comprehensive theme system:

### Available Themes
- **Classic**: Traditional blue gradient
- **Violet**: Purple theme
- **Dark**: Dark mode
- **Sunset**: Orange/red gradient
- **Modern**: Ocean, Sunrise, Mint, Plum, Blush, Emerald, Midnight

### Customization
1. Click the floating palette button (right edge)
2. Choose from preset themes
3. Select sidebar position (left, right, top)
4. Add custom background images
5. Drag the theme button to any position

## 🔐 Authentication & Authorization

### User Roles
- **Super Admin**: Full system access
- **Tenant**: Multi-tenant management
- **Organization Admin**: Organization-level access
- **Branch Admin**: Branch-level access
- **Sales Person**: Limited sales access

### Security Features
- JWT token authentication
- Role-based menu filtering
- Session management
- Automatic token refresh

## 📊 API Integration

### Base Configuration
```typescript
// Development
const apiService = new APIService("http://localhost:8247/");

// Production
const apiService = new APIService('https://api.freshfocuzstudio.com/');
```

### CRUD Operations
The app uses an automated CRUD system:

```typescript
// Simple entity creation
const apiRoutes = getEntityApiRoutes("Customer");

return (
  <GenericCrudPage
    config={{
      title: 'Customers',
      columns: customerColumns,
      formItems: customerFormItems,
      apiRoutes: apiRoutes,
      formColumns: 2,
    }}
  />
);
```

## 🧪 Testing

### Running Tests
```bash
npm test                    # Run all tests
npm test -- --coverage     # Run with coverage
npm test -- --watch        # Watch mode
```

### Test Structure
```
src/
├── __tests__/            # Test files
├── components/           # Component tests
└── pages/               # Page tests
```

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Variables
Create `.env` files for different environments:

```bash
# .env.development
REACT_APP_API_URL=http://localhost:8247/

# .env.production
REACT_APP_API_URL=https://api.freshfocuzstudio.com/
```

## 🔧 Configuration

### API Routes
Configure API endpoints in `src/services/api/utils.ts`:

```typescript
export const API_ROUTES = {
  Customer: createCrudRoutes("/customer", "Customer"),
  Product: createCrudRoutes("/products", "Product"),
  // Add new entities here
};
```

### Theme Configuration
Add new themes in `src/components/antd/sidebar/themePresets.ts`:

```typescript
export const themePresets = [
  {
    key: 'custom-theme',
    label: 'Custom Theme',
    variables: {
      '--sidebar-bg': 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
      '--menu-item-selected': '#667eea',
    },
  },
];
```

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**
   ```bash
   npm run lint:fix
   npm run type-check
   ```

2. **API Connection Issues**
   - Check API server status
   - Verify API URL in configuration
   - Check network connectivity

3. **Theme Not Applying**
   - Clear browser cache
   - Check localStorage for theme settings
   - Restart development server

### Performance Issues

1. **Slow Loading**
   - Check network tab for slow requests
   - Verify API response times
   - Monitor memory usage

2. **Memory Leaks**
   - Check for unmounted component subscriptions
   - Verify cleanup in useEffect hooks
   - Monitor performance metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Changelog

### Version 0.1.0
- Initial release
- Core billing functionality
- Theme customization system
- Multi-tenant support
- Role-based access control
- Performance monitoring
- Accessibility features