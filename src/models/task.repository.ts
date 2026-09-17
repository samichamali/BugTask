import { Task, Comment } from '../types/task.types.js';

export class TaskRepository {
    private tasks: Map<string, Task> = new Map();

    public async findAll(): Promise<Task[]> {
        return Array.from(this.tasks.values());
    }

    public async findById(id: string): Promise<Task | null> {
        return this.tasks.get(id) || null;
    }

    public async save(task: Task): Promise<Task> {
        this.tasks.set(task.id, task);
        return task;
    }

    public async delete(id: string): Promise<boolean> {
        return this.tasks.delete(id);
    }

    public async clear(): Promise<void> {
        this.tasks.clear();
    }
}