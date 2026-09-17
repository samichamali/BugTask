import { TaskRepository } from '../models/task.repository.js';
import { Task, CreateTaskDTO, Priority, TaskStatus, TaskStats, Comment } from '../types/task.types.js';

export class TaskService {
    constructor(private repo: TaskRepository) {}

    public async createTask(dto: CreateTaskDTO): Promise<Task> {
        //empty Title check
        if (!dto.title || dto.title.trim().length === 0) {
            throw new Error('Task title is required');
        }

        //BVA Title Length Limit (Maximum of 100)
        if (dto.title.length > 100) {
            throw new Error('Title must be 100 characters or fewer');
        }

        //Due Date validation and BVA
        const dueDate = new Date(dto.dueDate);
        if (isNaN(dueDate.getTime())) {
            throw new Error('Invalid date format');
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (dueDate < today) {
            throw new Error('Due date cannot be in the past');
        }

        //default priority, medium if empty
        const priority: Priority = dto.priority || 'Medium';
        const validPriorities: Priority[] = ['Low', 'Medium', 'High', 'Critical'];
        if (!validPriorities.includes(priority)) {
            throw new Error('Invalid priority specified');
        }

        const newTask: Task = {
            id: `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            title: dto.title.trim(),
            description: dto.description || '',
            priority,
            status: 'To Do',
            dueDate,
            comments: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        return await this.repo.save(newTask);
    }

    public async updateStatus(id: string, newStatus: TaskStatus): Promise<Task> {
        const task = await this.repo.findById(id);
        if (!task) throw new Error('TASK NOT FOUND!!');

        const validStatuses: TaskStatus[] = ['To Do', 'In Progress', 'Done'];
        if (!validStatuses.includes(newStatus)) {
            throw new Error('Invalid status specified');
        }

        task.status = newStatus;
        task.updatedAt = new Date();
        return await this.repo.save(task);
    }

    public async filterByPriority(priorities: Priority[]): Promise<Task[]> {
        const all = await this.repo.findAll();
        return all.filter((t) => priorities.includes(t.priority));
    }

    public async search(query: string): Promise<Task[]> {
        const all = await this.repo.findAll();
        if (!query || query.trim() === '') return all;

        const sanitized = query.toLowerCase().trim();
        return all.filter(
            (t) =>
                t.title.toLowerCase().includes(sanitized) ||
                t.description.toLowerCase().includes(sanitized)
        );
    }

    public async deleteTask(id: string): Promise<void> {
        const exists = await this.repo.findById(id);
        if (!exists) throw new Error('TASK NOT FOUND!!');
        await this.repo.delete(id);
    }

    public async getStats(): Promise<TaskStats> {
        const all = await this.repo.findAll();
        const total = all.length;

        //This is how we avoid division by zero!!!
        if (total === 0)
        {
            return {total: 0, completed: 0, percentage: 0.0};
        }

        const completed = all.filter((t) => t.status === 'Done').length;
        const percentage = Number(((completed / total) * 100).toFixed(1));

        return {total, completed, percentage };
    }

    public async addComment(taskId: string, authorId: string, text: string): Promise<Comment> {
        const task = await this.repo.findById(taskId);
        if (!task) throw new Error('Task not found');

        if (!text || text.trim().length === 0) {
            throw new Error('Comment text is required');
        }

        //BVA Comment Length (Max 500)
        if (text.length > 500) {
            throw new Error('Comment exceeds max length of 500 characters');
        }

        const comment: Comment = {
            id: `comment-${Date.now()}`,
            taskId,
            authorId,
            text: text.trim(),
            createdAt: new Date(),
        };

        task.comments.push(comment);
        await this.repo.save(task);
        return comment;
    }
}