import React, { useState, useEffect } from 'react';
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline, 
  Container, 
  Box, 
  Typography, 
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  Fab,
  useMediaQuery,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  ListItemButton
} from '@mui/material';
import {
  Menu as MenuIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  AssignmentTurnedIn as TaskIcon,
  AutoFixHigh as OptimizeIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
} from '@mui/icons-material';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import { Task } from './types';
import { fetchTasks, createTask, updateTask, deleteTask, optimizeTasks } from './api';

// Create a theme with both light and dark mode
const createAppTheme = (mode: 'light' | 'dark') => createTheme({
  palette: {
    mode,
    primary: {
      main: mode === 'light' ? '#2196f3' : '#90caf9',
    },
    secondary: {
      main: mode === 'light' ? '#f50057' : '#f48fb1',
    },
    background: {
      default: mode === 'light' ? '#f5f7fa' : '#121212',
      paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      marginBottom: '1rem',
    },
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: mode === 'light' 
            ? '0 4px 20px rgba(0, 0, 0, 0.05)' 
            : '0 4px 20px rgba(0, 0, 0, 0.5)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [addTaskOpen, setAddTaskOpen] = useState<boolean>(false);
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  const theme = React.useMemo(() => createAppTheme(mode), [mode]);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const toggleColorMode = () => {
    setMode(prevMode => prevMode === 'light' ? 'dark' : 'light');
  };

  const fetchAllTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedTasks = await fetchTasks();
      setTasks(fetchedTasks);
    } catch (error) {
      setError('Failed to fetch tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTasks();
  }, []);

  const handleCreateTask = async (taskData: Omit<Task, 'id'>) => {
    try {
      await createTask(taskData);
      await fetchAllTasks();
      setAddTaskOpen(false);
      showNotification('Task created successfully', 'success');
    } catch (error) {
      showNotification('Failed to create task', 'error');
    }
  };

  const handleUpdateTask = async (id: number, updates: Partial<Task>) => {
    try {
      await updateTask(id, updates);
      await fetchAllTasks();
      if (updates.completed !== undefined) {
        showNotification(
          updates.completed ? 'Task completed!' : 'Task marked as incomplete',
          'success'
        );
      } else {
        showNotification('Task updated successfully', 'success');
      }
    } catch (error) {
      showNotification('Failed to update task', 'error');
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      await deleteTask(id);
      await fetchAllTasks();
      showNotification('Task deleted successfully', 'success');
    } catch (error) {
      showNotification('Failed to delete task', 'error');
    }
  };

  const handleOptimize = async () => {
    try {
      setLoading(true);
      await optimizeTasks();
      await fetchAllTasks();
      showNotification('Tasks optimized successfully!', 'success');
    } catch (error) {
      showNotification('Failed to optimize tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
  };

  const handleCloseNotification = () => {
    setNotification(null);
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const drawerContent = (
    <Box sx={{ width: 250 }} role="presentation">
      <List>
        <ListItem sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <img 
              src="/logo192.png" 
              alt="TaskLion Logo" 
              style={{ width: 40, height: 40, marginRight: 16 }} 
            />
            <Typography variant="h6" color="primary">
              TaskLion
            </Typography>
          </Box>
        </ListItem>
        <Divider />
        <ListItem disablePadding>
          <ListItemButton onClick={() => { toggleDrawer(); }}>
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => { setAddTaskOpen(true); toggleDrawer(); }}>
            <ListItemIcon>
              <AddIcon />
            </ListItemIcon>
            <ListItemText primary="Add New Task" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => { handleOptimize(); toggleDrawer(); }}>
            <ListItemIcon>
              <OptimizeIcon />
            </ListItemIcon>
            <ListItemText primary="Optimize Tasks" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => { toggleDrawer(); }}>
            <ListItemIcon>
              <CheckCircleIcon />
            </ListItemIcon>
            <ListItemText primary="Completed Tasks" />
          </ListItemButton>
        </ListItem>
        <Divider />
        <ListItem disablePadding>
          <ListItemButton onClick={toggleColorMode}>
            <ListItemIcon>
              {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </ListItemIcon>
            <ListItemText primary={mode === 'dark' ? 'Light Mode' : 'Dark Mode'} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => { toggleDrawer(); }}>
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      {/* App Bar */}
      <AppBar 
        position="fixed" 
        elevation={0} 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: mode === 'light' 
            ? 'linear-gradient(90deg, #2196f3 0%, #1976d2 100%)' 
            : 'linear-gradient(90deg, #424242 0%, #212121 100%)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <img 
              src="/logo192.png" 
              alt="TaskLion Logo" 
              style={{ width: 36, height: 36, marginRight: 12 }} 
            />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              TaskLion
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton color="inherit" onClick={toggleColorMode}>
            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
      >
        {drawerContent}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          pt: { xs: 10, sm: 12 },
          pb: 10,
          px: { xs: 2, sm: 4 },
          background: mode === 'light' 
            ? 'linear-gradient(135deg, #f5f7fa 0%, #ebeff5 100%)' 
            : 'linear-gradient(135deg, #121212 0%, #1e1e1e 100%)',
        }}
      >
        <Container maxWidth="md">
          {loading && tasks.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Paper elevation={2} sx={{ p: 4, my: 4, textAlign: 'center', color: 'error.main' }}>
              <Typography variant="h6">{error}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Please check your connection and try again.
              </Typography>
            </Paper>
          ) : (
            <>
              {addTaskOpen && (
                <Paper elevation={2} sx={{ p: 3, mb: 4, position: 'relative' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5">Add New Task</Typography>
                    <IconButton 
                      size="small" 
                      onClick={() => setAddTaskOpen(false)}
                      sx={{ 
                        bgcolor: 'background.default', 
                        '&:hover': { bgcolor: 'action.hover' } 
                      }}
                    >
                      ✕
                    </IconButton>
                  </Box>
                  <TaskForm onTaskAdded={handleCreateTask} />
                </Paper>
              )}
              <TaskList
                tasks={tasks}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                onOptimize={handleOptimize}
              />
            </>
          )}
        </Container>
      </Box>

      {/* Floating Action Button */}
      {!addTaskOpen && (
        <Fab 
          color="primary" 
          aria-label="add task" 
          onClick={() => setAddTaskOpen(true)}
          sx={{ 
            position: 'fixed', 
            bottom: 16, 
            right: 16,
            boxShadow: '0 4px 10px rgba(33, 150, 243, 0.5)'
          }}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Notification */}
      <Snackbar
        open={notification !== null}
        autoHideDuration={5000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification?.type || 'info'} 
          variant="filled"
          sx={{ 
            width: '100%',
            borderRadius: 2,
            boxShadow: 3,
            display: notification ? 'flex' : 'none'
          }}
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App;
