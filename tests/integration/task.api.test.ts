import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';

describe('Task API Endpoints - Tests', () => {
    let app: any;
    let repo: any;

    beforeEach(() => {
        const created = createApp();
        app = created.app;
        repo = created.repo;
    });

    // UserStory 1: POST /tasks
    it('POST /tasks -> 201 Created on valid payload', async () => {
        const response = await request(app)
            .post('/tasks')
            .send({ title: 'API Test', priority: 'High', dueDate: '2026-12-31' });

        expect(response.status).toBe(201);
        expect(response.body.title).toBe('API Test');
        expect(response.body.priority).toBe('High');
    });

    it('POST /tasks -> 400 Bad Request on past due date', async () => {
        const response = await request(app)
            .post('/tasks')
            .send({ title: 'Past Task', dueDate: '2020-01-01' });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Due date cannot be in the past');
    });

    // UserStory 2: /tasks/:id/status we used patch to insert a value into the url and send a post request.
    it('send /tasks/:id/status -> 200 OK for a valid status transition', async () => {
        const createRes = await request(app)
            .post('/tasks')
            .send({ title: 'Status Task', dueDate: '2026-12-31' });

        const taskId = createRes.body.id;

        const response = await request(app)
            .patch(`/tasks/${taskId}/status`)
            .send({ status: 'In Progress' });

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('In Progress');
    });

    it('PATCH /tasks/:id/status -> 404 Not Found for an ID that doesnt exist', async () => {
        const response = await request(app)
            .patch('/tasks/non-existent-id/status')
            .send({ status: 'Done' });

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('TASK NOT FOUND!!');
    });

    // UserStory 4 andd 5: get /tasks Query Parameters
    it('GET /tasks?priority=High -> 200 OK filters correctly', async () => {
        await request(app).post('/tasks').send({ title: 'High Priority', priority: 'High', dueDate: '2026-12-31' });
        await request(app).post('/tasks').send({ title: 'Low Priority', priority: 'Low', dueDate: '2026-12-31' });

        const response = await request(app).get('/tasks?priority=High');

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0].priority).toBe('High');
    });

    it('GET /tasks?search=auth -> 200 OK handles search and sanitisation', async () => {
        await request(app).post('/tasks').send({ title: 'Fix Auth bug', dueDate: '2026-12-31' });
        await request(app).post('/tasks').send({ title: 'UI Layout update', dueDate: '2026-12-31' });

        const response = await request(app).get('/tasks?search=AUTH');

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0].title).toBe('Fix Auth bug');
    });

    // User Stoy 6: delete /tasks/:id
    it('DELETE /tasks/:id -> 204 No Content on deletion', async () => {
        const createRes = await request(app)
            .post('/tasks')
            .send({ title: 'Delete Me', dueDate: '2026-12-31' });

        const response = await request(app).delete(`/tasks/${createRes.body.id}`);
        expect(response.status).toBe(204);
    });

    it('DELETE /tasks/:id ->404 Not Fond on invalid ID', async () => {
        const response = await request(app).delete('/tasks/missing-id');
        expect(response.status).toBe(404);
    });
});