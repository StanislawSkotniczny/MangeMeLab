export type TaskPriority = 'niski' | 'średni' | 'wysoki';
export type TaskState = 'todo' | 'doing' | 'done';

export interface Task {
  id: number;
  name: string;
  description: string;
  priority: TaskPriority;
  storyId: number;
  estimatedTime: number; 
  state: TaskState;
  createdAt: string; 
  startDate?: string; 
  endDate?: string; 
  assigneeId?: number; 
} 