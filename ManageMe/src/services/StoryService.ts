import type { Story } from '../models/Story';

export class StoryService {
  private static storageKey = 'stories';

  static getAll(): Story[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  static getByProject(projectId: number): Story[] {
    return this.getAll().filter(story => story.projectId === projectId);
  }

  static saveAll(stories: Story[]) {
    localStorage.setItem(this.storageKey, JSON.stringify(stories));
  }

  static add(story: Story) {
    const stories = this.getAll();
    stories.push(story);
    this.saveAll(stories);
  }

  static update(updated: Story) {
    const stories = this.getAll().map(s => s.id === updated.id ? updated : s);
    this.saveAll(stories);
  }

  static delete(id: number) {
    const stories = this.getAll().filter(s => s.id !== id);
    this.saveAll(stories);
  }
} 