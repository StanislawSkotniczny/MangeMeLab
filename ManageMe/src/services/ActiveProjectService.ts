import { db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export class ActiveProjectService {
  private static docId = 'activeProjectId';

  static async setActiveProject(projectId: string) {
    await setDoc(doc(db, 'activeProject', this.docId), { projectId });
  }

  static async getActiveProject(): Promise<string | null> {
    const ref = doc(db, 'activeProject', this.docId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data().projectId;
    }
    return null;
  }
} 