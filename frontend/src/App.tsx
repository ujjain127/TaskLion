import React from 'react';
import { ThemeProvider, createTheme, CssBaseline, Container, Box, Typography, Paper } from '@mui/material';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import { Task } from './types';
import { fetchTasks, createTask, updateTask, deleteTask, optimizeTasks } from './api';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      marginBottom: '1rem',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

function App() {
  const [tasks, setTasks] = React.useState<Task[]>([]);

  const fetchAllTasks = async () => {
    const fetchedTasks = await fetchTasks();
    setTasks(fetchedTasks);
  };

  React.useEffect(() => {
    fetchAllTasks();
  }, []);

  const handleCreateTask = async (taskData: Omit<Task, 'id'>) => {
    await createTask(taskData);
    fetchAllTasks();
  };

  const handleUpdateTask = async (id: number, updates: Partial<Task>) => {
    await updateTask(id, updates);
    fetchAllTasks();
  };

  const handleDeleteTask = async (id: number) => {
    await deleteTask(id);
    fetchAllTasks();
  };

  const handleOptimize = async () => {
    await optimizeTasks();
    fetchAllTasks();
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          py: 4,
          background: 'linear-gradient(45deg, #f3f4f6 0%, #fff 100%)',
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h1" color="primary">
              TaskLion
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
              Organize and optimize your tasks efficiently
            </Typography>
          </Box>
          <Paper elevation={0} sx={{ p: 3, mb: 3 }}>
            <TaskForm onTaskAdded={handleCreateTask} />
          </Paper>
          <Paper elevation={0} sx={{ p: 3 }}>
            <TaskList
              tasks={tasks}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onOptimize={handleOptimize}
            />
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
