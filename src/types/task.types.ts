export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TaskStatus = 'To Do' | 'In Progress' | 'Done';



export interface Comment {
    id: string;
    taskId: string;
    authorId: string;
    text: string;
    createdAt: Date;
}
export interface Task {
    id: string;
    title: string;
    description: string;
    priority: Priority;
    status: TaskStatus;
    dueDate: Date;
    comments: Comment[];
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateTaskDTO {
    title: string;
    description?: string;
    priority?: Priority;
    dueDate: string | Date;
}

export interface UpdateStatusDTO {
    status: TaskStatus;
}

export interface BulkUpdateDTO {
    taskIds: string[];
    status: TaskStatus;
}

export interface TaskStats {
    total: number;
    completed: number;
    percentage: number;
}