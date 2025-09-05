# 🔌 LARK Labs - Electrical Diagnosis Trainer

[![Netlify Status](https://api.netlify.com/api/v1/badges/your-badge-id/deploy-status)](https://app.netlify.com/sites/lark-labs-electrical-trainer/deploys)

## 🚀 Overview

Professional electrical diagnosis training platform featuring virtual multimeters, interactive circuit simulations, and comprehensive safety training. Built for HVAC professionals, electrical technicians, students, and educators.

## ✨ Key Features

### 🔧 Virtual Multimeter
- **Realistic Interface**: Professional-grade multimeter simulation with accurate displays
- **8 Measurement Modes**: DC/AC voltage, current, resistance, continuity, frequency, capacitance, diode test
- **Touch-Optimized**: Mobile-responsive with gesture controls and haptic feedback
- **Safety Integration**: Real-time safety warnings and NFPA 70E compliance checking

### ⚡ Circuit Simulation Engine
- **Advanced Calculations**: Professional electrical simulation using nodal analysis
- **Real-Time Feedback**: Accurate measurements with realistic instrument noise
- **Fault Injection**: Practice troubleshooting with simulated component failures
- **Safety Assessment**: Comprehensive hazard analysis and PPE recommendations

### 🎓 Training Circuits (Free Tier)
1. **Basic DC Voltage Measurement** - Multimeter fundamentals
2. **Series Resistance Circuit** - Series circuit analysis
3. **Parallel Resistance Circuit** - Parallel relationships
4. **Simple LED Circuit** - Voltage division concepts
5. **Continuity Testing Basics** - Troubleshooting techniques

### 📱 Mobile-First Design
- **Responsive Layout**: Optimized for mobile, tablet, and desktop
- **Touch Controls**: Drag-and-drop probes with snap-to connection points
- **Offline Capable**: Progressive Web App for field use
- **Accessibility**: Screen reader support and high contrast modes

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **State Management**: Zustand
- **3D Graphics**: Three.js (future premium features)
- **Deployment**: Netlify (website) + Vercel (app)

### Project Structure
```
├── apps/
│   └── electrical-trainer/          # Vite React app
│       ├── src/
│       │   ├── components/         # React components
│       │   ├── engines/            # Simulation engines
│       │   ├── hooks/              # Custom hooks
│       │   └── types/              # TypeScript definitions
│       ├── public/                 # Static assets
│       └── package.json            # App dependencies
├── index.html                      # Main website
├── netlify.toml                    # Netlify config
└── package.json                    # Website dependencies
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- Git

### Installation
```bash
# Clone repository
git clone https://github.com/larklabs/electrical-trainer.git
cd electrical-trainer

# Install main website dependencies
npm install

# Install app dependencies
cd apps/electrical-trainer
npm install
```

### Development
```bash
# Start main website (Netlify dev)
npm run dev

# Start electrical trainer app (Vite)
cd apps/electrical-trainer
npm run dev
```

### Building
```bash
# Build website
npm run build

# Build app
cd apps/electrical-trainer
npm run build
```

## 🌐 Deployment

### Main Website (Netlify)
- **URL**: https://larklabs.org
- **Auto-deploy**: Main branch
- **Build Command**: `npm run build`
- **Publish Directory**: `.` (root)

### Electrical Trainer App (Vercel)
- **URL**: https://electrical-trainer.larklabs.org
- **Auto-deploy**: Main branch
- **Build Command**: `cd apps/electrical-trainer && npm run build`
- **Output Directory**: `apps/electrical-trainer/dist`

## 🔒 Safety Features

### NFPA 70E Compliance
- **Arc Flash Calculations**: IEEE 1584 standard implementation
- **PPE Requirements**: Category-based equipment recommendations
- **Approach Boundaries**: Restricted and limited approach distances
- **Lockout/Tagout**: Comprehensive LOTO procedure validation

### Real-Time Warnings
- **Voltage Level Detection**: Automatic hazard classification
- **Probe Placement Validation**: Safety violation detection
- **Circuit State Monitoring**: Energized circuit warnings
- **Emergency Procedures**: Step-by-step safety protocols

## 📊 Educational Standards

### Learning Objectives Alignment
- **NECA/IBEW Standards**: Electrical apprenticeship requirements
- **Canadian Trade Qualifications**: Red Seal program alignment
- **College Curriculum**: Post-secondary electrical programs
- **Industry Certifications**: Licensing exam preparation

## 🛠️ Development Guidelines

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Consistent formatting
- **Testing**: Vitest for unit tests

### Git Workflow
- **Main Branch**: Production-ready code
- **Feature Branches**: `feature/description`
- **Commit Messages**: Conventional commits
- **Pull Requests**: Required for main branch

## 📈 Performance

### Optimization Features
- **Code Splitting**: Route-based chunks
- **Lazy Loading**: Component-level loading
- **Image Optimization**: WebP format support
- **Caching**: Service worker implementation
- **Bundle Analysis**: Webpack bundle analyzer

### Mobile Performance
- **Lighthouse Score**: 95+ on all metrics
- **Touch Response**: <100ms interaction latency
- **Battery Optimization**: Efficient 3D rendering
- **Offline Support**: Critical path caching

## 🎯 Roadmap

### Phase 2 (Premium Features)
- [ ] 3D Virtual Electrical Panels
- [ ] Advanced Troubleshooting Scenarios (50+ circuits)
- [ ] Certification Exam Preparation
- [ ] Multi-user Progress Tracking
- [ ] Equipment Manual Integration

### Phase 3 (Enterprise)
- [ ] Institutional LMS Integration
- [ ] Custom Circuit Builder
- [ ] Instructor Dashboard
- [ ] Performance Analytics
- [ ] White-label Solutions

## 🤝 Contributing

We welcome contributions from the electrical education community!

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: https://docs.larklabs.org
- **Issues**: [GitHub Issues](https://github.com/larklabs/electrical-trainer/issues)
- **Email**: support@larklabs.org
- **Community**: [Discord Server](https://discord.gg/larklabs)

## 🏆 Acknowledgments

- **Fanshawe College**: HVAC program collaboration
- **NECA**: Industry standard consultation  
- **IBEW**: Apprenticeship program alignment
- **Canadian Standards Association**: Safety standard integration

---

<div align="center">
  <strong>Building the Future of Electrical Education</strong>
  <br>
  <em>LARK Labs - Where Innovation Meets Education</em>
</div>