import type { Project } from '../models/Project';

export class ProjectService {
  private static storageKey = 'projects';

  static getAll(): Project[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  static saveAll(projects: Project[]) {
    localStorage.setItem(this.storageKey, JSON.stringify(projects));
  }

  static add(project: Project) {
    const projects = this.getAll();
    projects.push(project);
    this.saveAll(projects);
  }

  static update(updated: Project) {
    const projects = this.getAll().map(p => p.id === updated.id ? updated : p);
    this.saveAll(projects);
  }

  static delete(id: number) {
    const projects = this.getAll().filter(p => p.id !== id);
    this.saveAll(projects);
  }
} 