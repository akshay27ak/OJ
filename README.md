# Online Judge Platform - Verdiq

A competitive programming platform for coding challenges with automated evaluation and real-time feedback.

## Features

- **Multi-language Support**: C++, Java, Python
- **Secure Code Execution**: Docker-based isolation
- **Real-time Compilation**: Instant feedback and error reporting
- **AI Code Review**: Intelligent code analysis and suggestions
- **User Dashboard**: Progress tracking and submission history
- **Problem Management**: Create, browse, and solve coding problems

## Tech Stack

- **Frontend**: React.js + Vite, Tailwind CSS, shadcn/ui
- **Backend**: Node.js + Express.js, MongoDB, JWT Authentication
- **Compiler Service**: Docker, Node.js, Multi-language execution
- **Deployment**: Vercel (Frontend), Render (Backend), AWS ECS (Compiler)

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB
- Docker (for compiler service)

### Installation

1. **Clone the repository**
\`\`\`bash
git clone https://github.com/akshay27ak/OJ.git
cd online-judge
\`\`\`

2. **Backend Setup**
\`\`\`bash
cd backend
npm install
cp .env.example .env  # Configure your environment variables
npm start
\`\`\`

3. **Frontend Setup**
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

4. **Compiler Service Setup**
\`\`\`bash
cd compiler-service
npm install
docker build -t oj-compiler .
docker run -p 8000:8000 oj-compiler
\`\`\`

### Environment Variables

**Backend (.env)**
\`\`\`
MONGODB_URI=`atlas url`
SECRET_KEY=your-jwt-secret-key
PORT=5000
\`\`\`

**Frontend (.env)**
\`\`\`
VITE_BACKEND_URL=http://localhost:5000
VITE_COMPILER_URL=http://localhost:8000
\`\`\`

## API Documentation

### Authentication
- `POST /register` - User registration
- `POST /login` - User login
- `POST /logout` - User logout

### Problems
- `GET /api/problems` - Get all problems
- `GET /api/problems/:id` - Get problem by ID
- `POST /api/problems` - Create problem (auth required)

### Submissions
- `POST /api/submissions` - Submit solution
- `GET /api/submissions` - Get user submissions

### Compiler Service
- `POST /run` - Execute code
- `POST /submit` - Submit and validate
- `POST /ai-review` - Get AI feedback

## Deployment

### Production URLs
- **Frontend**: https://oj-kappa.vercel.app
- **Backend**: https://oj-nivt.onrender.com
- **Compiler**: AWS ECS Fargate

### Deploy Your Own

1. **Frontend (Vercel)**
   - Connect GitHub repository
   - Set environment variables
   - Deploy automatically

2. **Backend (Render)**
   - Connect GitHub repository
   - Add MongoDB connection string
   - Deploy as web service

3. **Compiler Service (AWS ECS)**
   - Build Docker image
   - Push to ECR
   - Deploy with Fargate

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

