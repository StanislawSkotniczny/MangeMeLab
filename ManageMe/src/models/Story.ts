export type StoryPriority = 'niski' | 'średni' | 'wysoki';
export type StoryState = 'todo' | 'doing' | 'done';

export interface Story {
  id: string;
  name: string;
  description: string;
  priority: StoryPriority;
  projectId: string;
  createdAt: string; 
  state: StoryState;
  ownerId: string;
} 