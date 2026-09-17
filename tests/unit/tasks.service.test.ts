import { describe, it, expect, beforeEach } from 'vitest';
import { TaskRepository } from '../../src/models/task.repository.js';
import { TaskService } from '../../src/services/task.service.js';

describe('taskservice - Unit tests', () => {
    let repo: TaskRepository;
    let service: TaskService;

    beforeEach(() => {
        repo = new TaskRepository();
        service = new TaskService(repo);
    });

    //Title and Due Date Validation, related to user stories 1 and 7
    describe('createTask Boundary and Equivalence Tests', () => {
        it('creates a task with valid values', async () => {
            const task = await service.createTask({
                title: 'Implement Authentication',
                description: 'Setup JWT auth middleware',
                priority: 'High',
                dueDate: '2026-12-31',
            });

            expect(task.id).toBeDefined();
            expect(task.title).toBe('Implement Authentication');
            expect(task.status).toBe('To Do');
        });

        it('accepts title in length of exactly 100 characters', async () => {
            const title100 = 'A'.repeat(100);
            const task = await service.createTask({ title: title100, dueDate: '2026-12-31' });
            expect(task.title.length).toBe(100);
        });

        it('rejects title in length of 101 characters', async () => {
            const title101 = 'A'.repeat(101);
            await expect(
                service.createTask({title: title101, dueDate: '2026-12-31' })
            ).rejects.toThrow('Title must be 100 characters or fewer');
        });

        it('rejects empty or only space containing title', async () => {
            await expect(
                service.createTask({ title: '   ', dueDate: '2026-12-31' })
            ).rejects.toThrow('Task title is required');
        });

        it('rejects due date that was in the past ', async () => {
            await expect(
                service.createTask({ title: 'Past Bug', dueDate: '2020-01-01' })
            ).rejects.toThrow('Due date cannot be in the past');
        });

        it('rejects unsupported due date that isnt in the right format', async () => {
            await expect(
                service.createTask({ title: 'Bad Date Task', dueDate: 'invalid-date' })
            ).rejects.toThrow('Invalid date format');
        });
    });

    //User Story8 Statistics Calculation (BVA Case)

    describe('getStats Calculation', () => {
        it('returns zeroed stats when no tasks exist', async () => {
            const stats = await service.getStats();
            expect(stats).toEqual({total: 0, completed: 0, percentage: 0.0});
        });

        it('calculates completed percentage accurately', async () => {
            const t1 = await service.createTask({title: 'Task 1', dueDate: '2026-12-31'});
            const t2 = await service.createTask({title: 'Task 2', dueDate: '2026-12-31'});
            await service.createTask({title: 'Task 3', dueDate: '2026-12-31'});

            await service.updateStatus(t1.id, 'Done');
            await service.updateStatus(t2.id, 'Done');

            const stats = await service.getStats();
            expect(stats.total).toBe(3);
            expect(stats.completed).toBe(2);
            expect(stats.percentage).toBe(66.7);
        });
    });

    //10th UserStory Comments (BVA)
    describe('addComment Boundary Tests', () => {
        it('accepts comments in lengths of exactly 500 characters', async () => {
            const task = await service.createTask({ title: 'Task with comment', dueDate: '2026-12-31' });
            const commentText = 'C'.repeat(500);

            const comment = await service.addComment(task.id, 'user-1', commentText);
            expect(comment.text.length).toBe(500);
        });

        it('rejects comments in lengths of 501 characters', async () => {
            const task = await service.createTask({ title: 'Task with comment', dueDate: '2026-12-31' });
            const commentText = 'C'.repeat(501);

            await expect(
                service.addComment(task.id, 'user-1', commentText)
            ).rejects.toThrow('Comment exceeds max length of 500 characters');
        });
    });
});