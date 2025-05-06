export class ActiveProjectService {
  private static storageKey = 'activeProjectId';

  static setActiveProject(projectId: number) {
    localStorage.setItem(this.storageKey, projectId.toString());
  }

  static getActiveProject(): number | null {
    const id = localStorage.getItem(this.storageKey);
    return id ? Number(id) : null;
  }
} 