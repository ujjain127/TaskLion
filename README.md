# TaskLion 🦁

TaskLion is an intelligent task management system that uses AI-powered Lion Optimization Algorithm (LOA) to automatically prioritize your tasks. It features a modern, responsive UI and smart task optimization.

## Environment Variables 🔐

Create a `.env` file in both frontend and backend directories:

### Backend `.env`
```
FLASK_ENV=development
FLASK_APP=app.py
DATABASE_URL=sqlite:///tasklion.db
SECRET_KEY=your_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

### Frontend `.env`
```
REACT_APP_API_URL=http://localhost:5000
```

## Features ✨

- **AI-Powered Task Prioritization**: Uses nature-inspired Lion Optimization Algorithm to intelligently prioritize tasks
- **Smart Priority Calculation**: Considers deadlines, task age, and other factors
- **Modern UI/UX**: Clean, responsive interface with animations and intuitive design
- **Real-time Updates**: Instant feedback on task changes and priority updates
- **Deadline Management**: Set and track task deadlines with visual indicators
- **Priority Levels**: Three-tier priority system (Low, Medium, High) with color coding

## Technology Stack 🛠️

### Frontend
- React with TypeScript
- Material-UI (MUI) for components
- Framer Motion for animations
- Axios for API communication

### Backend
- Python with Flask
- SQLAlchemy ORM
- SQLite database
- NumPy for AI computations

## AI Features 🧠

TaskLion uses the Lion Optimization Algorithm (LOA), a nature-inspired AI algorithm that:
- Automatically balances multiple task factors
- Adapts priorities based on deadlines and task age
- Uses population-based optimization with 10 virtual "lions"
- Evolves solutions over 50 iterations to find optimal task priorities

## Setup Instructions 🚀

### Prerequisites
- Python 3.8 or higher
- Node.js 14 or higher
- npm or yarn

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Initialize database
python migrate.py

# Start the server
python wsgi.py
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

## Usage Guide 📖

1. **Adding Tasks**
   - Click "Add New Task"
   - Fill in task details (title, description)
   - Set priority (low, medium, high)
   - Set deadline (optional)

2. **Managing Tasks**
   - Mark tasks as complete using the checkbox
   - Delete tasks using the trash icon
   - View task details including priority and deadline

3. **AI Optimization**
   - Click "Optimize Tasks" to run the AI algorithm
   - The system will automatically adjust priorities based on:
     - Deadline proximity
     - Task age
     - Current workload
     - Task dependencies

4. **Priority Indicators**
   - 🔴 High Priority
   - 🟡 Medium Priority
   - 🟢 Low Priority

## API Documentation 📚

### Endpoints

- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/<id>` - Update a task
- `DELETE /api/tasks/<id>` - Delete a task
- `POST /api/tasks/optimize` - Run AI optimization

### Task Object Structure
```typescript
interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  deadline: string | null;
  completed: boolean;
}
```

## Development Guidelines 💻

### Code Style
- Follow PEP 8 for Python code
- Use ESLint and Prettier for JavaScript/TypeScript
- Write meaningful commit messages
- Comment complex logic and AI algorithm implementations

### Branch Strategy
- `main` - production ready code
- `develop` - main development branch
- `feature/*` - for new features
- `bugfix/*` - for bug fixes

### Testing
```bash
# Backend tests
cd backend
python -m pytest

# Frontend tests
cd frontend
npm test
```

## Troubleshooting 🔧

### Common Issues

1. **Database Connection Issues**
   - Ensure SQLite is properly installed
   - Check database file permissions
   - Verify DATABASE_URL in .env

2. **Frontend API Connection**
   - Confirm backend server is running
   - Check REACT_APP_API_URL in frontend .env
   - Verify CORS settings in backend

3. **AI Optimization Not Working**
   - Ensure NumPy is properly installed
   - Check Python version compatibility
   - Verify task data format

### Error Codes

- `E001`: Database connection failed
- `E002`: AI optimization error
- `E003`: Invalid task format
- `E004`: API authentication error

## Contributing 🤝

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## Performance Optimization 🚀

- Backend uses connection pooling
- Frontend implements React.memo for optimization
- AI algorithm cached results for similar patterns
- Batch processing for multiple task updates

## Security Considerations 🔒

- API endpoints are rate-limited
- Input validation on all forms
- SQL injection prevention through ORM
- XSS protection in frontend
- CSRF tokens implemented

## Monitoring and Logging 📊

- Application logs stored in `logs/`
- Performance metrics tracked
- AI optimization statistics logged
- Error tracking and reporting

## Backup and Recovery 💾

- Automatic database backups daily
- Task data export functionality
- System state recovery procedures
- Backup retention policy

## License 📄

MIT License - feel free to use this project for any purpose.

## Acknowledgments 🙏

- Material-UI team for the amazing component library
- React team for the frontend framework
- Flask team for the backend framework 