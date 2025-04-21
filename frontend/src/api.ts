import axios from 'axios';
import { Task, TaskFormData } from './types';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchTasks = async (): Promise<Task[]> => {
  const response = await api.get('/tasks');
  return response.data;
};

export const createTask = async (taskData: TaskFormData): Promise<Task> => {
  const response = await api.post('/tasks', taskData);
  return response.data;
};

export const updateTask = async (taskId: number, taskData: Partial<Task>): Promise<Task> => {
  const response = await api.put(`/tasks/${taskId}`, taskData);
  return response.data;
};

export const deleteTask = async (taskId: number): Promise<void> => {
  await api.delete(`/tasks/${taskId}`);
};

export const optimizeTasks = async (): Promise<Task[]> => {
  const response = await api.post('/tasks/optimize');
  return response.data;
}; 