import express, { Express } from 'express';
import { TaskRepository } from './models/task.repository.js';
import { TaskService } from './services/task.service.js';
import { TaskController } from './controllers/task.controller.js';

export function createApp(): { app: Express; repo: TaskRepository } {
    const app = express();
    app.use(express.json());

    const repo = new TaskRepository();
    const service = new TaskService(repo);
    const controller = new TaskController(service);

    // here i routed the endpoints
    app.post('/tasks', controller.createTask);
    app.get('/tasks', controller.getTasks);
    app.get('/tasks/stats', controller.getStats);
    app.patch('/tasks/:id/status', controller.updateStatus);
    app.delete('/tasks/:id', controller.deleteTask);
    app.post('/tasks/:id/comments', controller.addComment);

    return {app, repo};
}