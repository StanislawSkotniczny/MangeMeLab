export type TaskPriority = 'niski' | 'średni' | 'wysoki';
export type TaskState = 'todo' | 'doing' | 'done';

export interface Task {
  id: string;
  name: string;
  description: string;
  priority: TaskPriority;
  storyId: string;
  estimatedTime: number; 
  state: TaskState;
  createdAt: string; 
  startDate?: string; 
  endDate?: string; 
  assigneeId?: string; 
} 