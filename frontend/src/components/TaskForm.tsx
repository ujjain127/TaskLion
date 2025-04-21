import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Task } from '../types';

export interface TaskFormProps {
  onTaskAdded: (task: Omit<Task, 'id'>) => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onTaskAdded }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [deadline, setDeadline] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onTaskAdded({
      title,
      description,
      priority: priority as 'low' | 'medium' | 'high',
      deadline: deadline ? new Date(deadline).toISOString() : null,
      completed: false,
      created_at: new Date().toISOString(),
      importance_score: null,
      importance_explanation: null,
    });
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDeadline('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Add New Task
        </Typography>
        <Stack spacing={2}>
          <TextField
            label="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={2}
          />
          <Stack direction="row" spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={priority}
                label="Priority"
                onChange={(e) => setPriority(e.target.value)}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Deadline"
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Stack>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            sx={{
              background: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)',
              boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
            }}
          >
            Add Task
          </Button>
        </Stack>
      </Box>
    </motion.div>
  );
};

export default TaskForm; 