import React, { useState } from 'react';
import {
  List,
  ListItem,
  IconButton,
  Typography,
  Box,
  Chip,
  Button,
  Checkbox,
  Stack,
  Tooltip,
  Paper,
  LinearProgress,
  Collapse,
  Divider,
  Card,
  CardContent,
  Badge,
  Avatar,
  Grid,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  Flag as FlagIcon,
  AutoFixHigh as OptimizeIcon,
  Psychology as AIIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Lightbulb as LightbulbIcon,
  Cached as CachedIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '../types';

interface TaskListProps {
  tasks: Task[];
  onUpdateTask: (id: number, updates: Partial<Task>) => void;
  onDeleteTask: (id: number) => void;
  onOptimize: () => void;
}

const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
  switch (priority) {
    case 'high':
      return '#ef5350';
    case 'medium':
      return '#fb8c00';
    case 'low':
      return '#66bb6a';
    default:
      return '#90a4ae';
  }
};

const getImportanceColor = (score: number | null) => {
  if (score === null) return '#9e9e9e';
  if (score >= 0.7) return '#d32f2f';
  if (score >= 0.4) return '#f57c00';
  return '#388e3c';
};

const getImportanceLabel = (score: number | null) => {
  if (score === null) return 'Not analyzed';
  if (score >= 0.7) return 'High Importance';
  if (score >= 0.4) return 'Medium Importance';
  return 'Low Importance';
};

const getTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
};

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onUpdateTask,
  onDeleteTask,
  onOptimize,
}) => {
  const [expandedTask, setExpandedTask] = useState<number | null>(null);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleToggleComplete = (task: Task) => {
    onUpdateTask(task.id, { completed: !task.completed });
  };

  const toggleExpandTask = (taskId: number) => {
    setExpandedTask(expandedTask === taskId ? null : taskId);
  };

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card 
          elevation={2}
          sx={{ 
            mb: 4, 
            borderRadius: 3,
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            color: 'white',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ 
            position: 'absolute',
            width: '100%',
            height: '100%',
            opacity: 0.05,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          }} />
          <CardContent sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5 }}>
                  TaskLion
                </Typography>
                <Typography variant="body1">
                  Your intelligent task management dashboard
                </Typography>
              </Box>
              <Avatar 
                src="/logo192.png" 
                sx={{ 
                  width: 60, 
                  height: 60,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
              />
            </Box>
            
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 4' } }}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 1.5, 
                    borderRadius: 2, 
                    bgcolor: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    textAlign: 'center'
                  }}
                >
                  <Typography variant="h4" fontWeight="bold">
                    {tasks.filter(t => !t.completed).length}
                  </Typography>
                  <Typography variant="body2">Active Tasks</Typography>
                </Paper>
              </Grid>
              <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 4' } }}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 1.5, 
                    borderRadius: 2, 
                    bgcolor: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    textAlign: 'center'
                  }}
                >
                  <Typography variant="h4" fontWeight="bold">
                    {tasks.filter(t => t.completed).length}
                  </Typography>
                  <Typography variant="body2">Completed Tasks</Typography>
                </Paper>
              </Grid>
              <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 4' } }}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 1.5, 
                    borderRadius: 2, 
                    bgcolor: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    textAlign: 'center'
                  }}
                >
                  <Typography variant="h4" fontWeight="bold">
                    {tasks.filter(t => t.priority === 'high' && !t.completed).length}
                  </Typography>
                  <Typography variant="body2">High Priority</Typography>
                </Paper>
              </Grid>
            </Grid>
            
            <Button
              variant="contained"
              startIcon={<OptimizeIcon />}
              onClick={onOptimize}
              size="large"
              fullWidth
              sx={{
                mt: 2,
                py: 1.5,
                bgcolor: 'white',
                color: '#1976d2',
                fontWeight: 'bold',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.9)',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                },
                transition: 'all 0.2s ease-in-out',
                borderRadius: 2,
              }}
            >
              Optimize Tasks with Lion Algorithm
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        {tasks.length > 0 ? 'Your Tasks' : ''}
      </Typography>

      <AnimatePresence>
        {tasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Paper
              elevation={2}
              sx={{
                textAlign: 'center',
                py: 5,
                px: 3,
                borderRadius: 3,
                bgcolor: '#f5f5f5',
                border: '2px dashed #e0e0e0',
              }}
            >
              <Box sx={{ mb: 2 }}>
                <img 
                  src="/logo192.png" 
                  alt="TaskLion Logo" 
                  style={{ 
                    width: 80, 
                    height: 80, 
                    opacity: 0.6 
                  }} 
                />
              </Box>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No tasks yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add some tasks to get started with TaskLion's intelligent task management
              </Typography>
            </Paper>
          </motion.div>
        ) : (
          <List sx={{ p: 0 }}>
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card 
                  elevation={1} 
                  sx={{ 
                    mb: 2, 
                    borderRadius: 3,
                    position: 'relative',
                    overflow: 'visible',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
                    },
                    border: task.completed ? '1px solid #e0e0e0' : '1px solid transparent',
                    bgcolor: task.completed ? '#f9f9f9' : 'background.paper',
                  }}
                >
                  {task.priority === 'high' && !task.completed && (
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        top: -8, 
                        right: 16, 
                        bgcolor: getPriorityColor('high'),
                        color: 'white',
                        borderRadius: 4,
                        px: 1.5,
                        py: 0.5,
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 8px rgba(239,83,80,0.5)',
                      }}
                    >
                      Priority
                    </Box>
                  )}

                  <ListItem sx={{ px: 3, py: 2 }}>
                    <Stack spacing={2} sx={{ width: '100%' }}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Checkbox
                          checked={task.completed}
                          onChange={() => handleToggleComplete(task)}
                          color="primary"
                          sx={{
                            '& .MuiSvgIcon-root': { fontSize: 28 },
                          }}
                        />
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              textDecoration: task.completed ? 'line-through' : 'none',
                              color: task.completed ? 'text.secondary' : 'text.primary',
                              fontWeight: task.completed ? 'normal' : 'bold',
                            }}
                          >
                            {task.title}
                          </Typography>
                          {task.description && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                textDecoration: task.completed ? 'line-through' : 'none',
                                mt: 0.5,
                              }}
                            >
                              {task.description}
                            </Typography>
                          )}
                        </Box>
                        <IconButton
                          onClick={() => onDeleteTask(task.id)}
                          size="small"
                          color="error"
                          sx={{ 
                            bgcolor: 'rgba(244,67,54,0.1)',
                            '&:hover': {
                              bgcolor: 'rgba(244,67,54,0.2)',
                            }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>

                      {/* Tags and Metadata */}
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Chip
                          icon={<FlagIcon />}
                          label={task.priority.toUpperCase()}
                          size="small"
                          sx={{
                            bgcolor: `${getPriorityColor(task.priority)}15`,
                            color: getPriorityColor(task.priority),
                            fontWeight: 'bold',
                            '& .MuiChip-icon': {
                              color: getPriorityColor(task.priority),
                            },
                          }}
                        />
                        {task.deadline && (
                          <Chip
                            icon={<ScheduleIcon />}
                            label={formatDate(task.deadline)}
                            size="small"
                            sx={{
                              bgcolor: 'rgba(25,118,210,0.1)',
                              color: 'primary.main',
                              '& .MuiChip-icon': {
                                color: 'primary.main',
                              },
                            }}
                          />
                        )}
                        <Chip
                          icon={<AccessTimeIcon sx={{ fontSize: '0.8rem' }} />}
                          label={`Created ${getTimeAgo(task.created_at)}`}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            fontSize: '0.75rem', 
                            height: '24px',
                            '& .MuiChip-label': { px: 1 }
                          }}
                        />
                        {task.importance_score !== null && (
                          <Chip
                            icon={<AIIcon sx={{ fontSize: '0.8rem' }} />}
                            label={`${Math.round(task.importance_score * 100)}% Important`}
                            size="small"
                            sx={{
                              bgcolor: `${getImportanceColor(task.importance_score)}15`,
                              color: getImportanceColor(task.importance_score),
                              fontWeight: 'medium',
                              height: '24px',
                              '& .MuiChip-icon': {
                                color: getImportanceColor(task.importance_score),
                              },
                              '& .MuiChip-label': { px: 1 }
                            }}
                          />
                        )}
                      </Stack>

                      {/* AI Analysis Section */}
                      {task.importance_score !== null && (
                        <>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <AIIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                              <Typography variant="body2" fontWeight="medium">
                                Analysis {task.analysis_time ? `(${getTimeAgo(task.analysis_time)})` : ''}
                              </Typography>
                            </Box>
                            <Button
                              size="small"
                              endIcon={expandedTask === task.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                              onClick={() => toggleExpandTask(task.id)}
                              sx={{ textTransform: 'none', fontSize: '0.8rem' }}
                            >
                              {expandedTask === task.id ? 'Hide Details' : 'View Details'}
                            </Button>
                          </Box>
                          
                          <Box sx={{ width: '100%' }}>
                            <LinearProgress
                              variant="determinate"
                              value={task.importance_score * 100}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                bgcolor: '#e0e0e0',
                                mb: 1,
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: getImportanceColor(task.importance_score),
                                }
                              }}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="caption" sx={{ fontWeight: 'medium' }}>
                                {getImportanceLabel(task.importance_score)}
                              </Typography>
                              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                                {Math.round(task.importance_score * 100)}%
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Collapse in={expandedTask === task.id}>
                            <Paper
                              elevation={0}
                              sx={{
                                p: 2,
                                mt: 1,
                                bgcolor: 'rgba(25,118,210,0.05)',
                                borderRadius: 2,
                                border: '1px solid rgba(25,118,210,0.1)',
                              }}
                            >
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                {task.importance_explanation}
                              </Typography>
                              
                              {task.insights && task.insights.length > 0 && (
                                <>
                                  <Divider sx={{ my: 1.5 }} />
                                  <Typography variant="body2" fontWeight="medium" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                                    <LightbulbIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                                    Insights:
                                  </Typography>
                                  
                                  <Stack spacing={0.5}>
                                    {task.insights.map((insight, idx) => (
                                      <Typography 
                                        key={idx} 
                                        variant="body2" 
                                        sx={{ 
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: 1,
                                          color: 'text.secondary',
                                          '&:before': {
                                            content: '"•"',
                                            color: 'primary.main',
                                            fontWeight: 'bold'
                                          }
                                        }}
                                      >
                                        {insight}
                                      </Typography>
                                    ))}
                                  </Stack>
                                </>
                              )}
                            </Paper>
                          </Collapse>
                        </>
                      )}
                    </Stack>
                  </ListItem>
                </Card>
              </motion.div>
            ))}
          </List>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default TaskList;