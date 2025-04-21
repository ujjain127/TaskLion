import React from 'react';
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
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  Flag as FlagIcon,
  AutoFixHigh as OptimizeIcon,
  Psychology as AIIcon,
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

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onUpdateTask,
  onDeleteTask,
  onOptimize,
}) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleToggleComplete = (task: Task) => {
    onUpdateTask(task.id, { completed: !task.completed });
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h6">Your Tasks</Typography>
        <Button
          variant="contained"
          startIcon={<OptimizeIcon />}
          onClick={onOptimize}
          sx={{
            background: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)',
            boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'scale(1.02)',
            },
          }}
        >
          Optimize Tasks
        </Button>
      </Stack>

      <AnimatePresence>
        {tasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Box
              sx={{
                textAlign: 'center',
                py: 4,
                color: 'text.secondary',
              }}
            >
              <Typography variant="body1">
                No tasks yet. Add some tasks to get started!
              </Typography>
            </Box>
          </motion.div>
        ) : (
          <List>
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <ListItem
                  sx={{
                    mb: 2,
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <Stack spacing={2} sx={{ width: '100%' }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Checkbox
                        checked={task.completed}
                        onChange={() => handleToggleComplete(task)}
                        color="primary"
                      />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            textDecoration: task.completed ? 'line-through' : 'none',
                            color: task.completed ? 'text.secondary' : 'text.primary',
                          }}
                        >
                          {task.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            textDecoration: task.completed ? 'line-through' : 'none',
                          }}
                        >
                          {task.description}
                        </Typography>
                      </Box>
                      <IconButton
                        onClick={() => onDeleteTask(task.id)}
                        size="small"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>

                    {/* AI Analysis Section */}
                    {task.importance_score !== null && (
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.5,
                          bgcolor: 'rgba(25, 118, 210, 0.08)',
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        <AIIcon color="primary" sx={{ fontSize: 20 }} />
                        <Box>
                          <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
                            AI Analysis: {Math.round(task.importance_score * 100)}% Important
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {task.importance_explanation}
                          </Typography>
                        </Box>
                      </Paper>
                    )}

                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Priority">
                        <Chip
                          icon={<FlagIcon />}
                          label={task.priority}
                          size="small"
                          sx={{
                            bgcolor: `${getPriorityColor(task.priority)}15`,
                            color: getPriorityColor(task.priority),
                            '& .MuiChip-icon': {
                              color: getPriorityColor(task.priority),
                            },
                          }}
                        />
                      </Tooltip>
                      {task.deadline && (
                        <Tooltip title="Deadline">
                          <Chip
                            icon={<ScheduleIcon />}
                            label={formatDate(task.deadline)}
                            size="small"
                            sx={{
                              bgcolor: 'primary.light',
                              color: 'primary.main',
                              '& .MuiChip-icon': {
                                color: 'primary.main',
                              },
                            }}
                          />
                        </Tooltip>
                      )}
                    </Stack>
                  </Stack>
                </ListItem>
              </motion.div>
            ))}
          </List>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default TaskList; 