export type StoryPriority = 'niski' | 'średni' | 'wysoki';
export type StoryState = 'todo' | 'doing' | 'done';

export interface Story {
  id: number;
  name: string;
  description: string;
  priority: StoryPriority;
  projectId: number;
  createdAt: string; // ISO string
  state: StoryState;
  ownerId: number;
} 