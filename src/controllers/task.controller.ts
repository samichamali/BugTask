import { Request, Response } from 'express';
import { TaskService } from '../services/task.service.js';
import { Priority } from '../types/task.types.js';

export class TaskController {
    constructor(private service: TaskService) {}

    public createTask = async (req: Request, res: Response): Promise<void> => {
        try {
            const task = await this.service.createTask(req.body);
            res.status(201).json(task);
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    };

    public getTasks = async (req: Request, res: Response): Promise<void> => {
        try {
            const { priority, search } = req.query;

            if (priority) {
                const priorities = (priority as string).split(',') as Priority[];
                const tasks = await this.service.filterByPriority(priorities);
                res.status(200).json(tasks);
                return;
            }

            if (search !== undefined) {
                const tasks = await this.service.search(search as string);
                res.status(200).json(tasks);
                return;
            }

            const tasks = await this.service.search('');
            res.status(200).json(tasks);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    };

    public updateStatus = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const updated = await this.service.updateStatus(id, status);
            res.status(200).json(updated);
        } catch (err: any) {
            const statusCode = err.message === 'TASK NOT FOUND!!' ? 404 : 400;
            res.status(statusCode).json({ error: err.message });
        }
    };

    public deleteTask = async (req: Request, res: Response): Promise<void> => {
        try {
            await this.service.deleteTask(req.params.id);
            res.status(204).send();
        } catch (err: any) {
            res.status(404).json({ error: err.message });
        }
    };

    public getStats = async (_req: Request, res: Response): Promise<void> => {
        const stats = await this.service.getStats();
        res.status(200).json(stats);
    };

    public addComment = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const { authorId, text } = req.body;
            const comment = await this.service.addComment(id, authorId || 'anonymous', text);
            res.status(201).json(comment);
        } catch (err: any) {
            const statusCode = err.message === 'TASK NOT FOUND!!' ? 404 : 400;
            res.status(statusCode).json({ error: err.message });
        }
    };
}