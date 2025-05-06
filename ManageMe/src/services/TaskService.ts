import type { Task } from '../models/Task';

export class TaskService {
  private static storageKey = 'tasks';

  static getAll(): Task[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  static getByStory(storyId: number): Task[] {
    return this.getAll().filter(task => task.storyId === storyId);
  }

  static saveAll(tasks: Task[]) {
    localStorage.setItem(this.storageKey, JSON.stringify(tasks));
  }

  static add(task: Task) {
    const tasks = this.getAll();
    tasks.push(task);
    this.saveAll(tasks);
  }

  static update(updated: Task) {
    const tasks = this.getAll().map(t => t.id === updated.id ? updated : t);
    this.saveAll(tasks);
  }

  static delete(id: number) {
    const tasks = this.getAll().filter(t => t.id !== id);
    this.saveAll(tasks);
  }
} 