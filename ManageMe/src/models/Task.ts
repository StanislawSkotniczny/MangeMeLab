export type TaskPriority = 'niski' | 'średni' | 'wysoki';
export type TaskState = 'todo' | 'doing' | 'done';

export interface Task {
  id: number;
  name: string;
  description: string;
  priority: TaskPriority;
  storyId: number;
  estimatedTime: number; // w godzinach
  state: TaskState;
  createdAt: string; // ISO string
  startDate?: string; // ISO string
  endDate?: string; // ISO string
  assigneeId?: number; // id użytkownika
} 