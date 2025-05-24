import { db } from '../firebase';
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import type { Project } from '../models/Project';

export class ProjectService {
  private static collectionName = 'projects';

  static async getAll(): Promise<Project[]> {
    const querySnapshot = await getDocs(collection(db, this.collectionName));
    return querySnapshot.docs.map(doc => {
      const data = doc.data() as Project;
      return { ...data, id: doc.id };
    });
  }

  static async add(project: Project) {
    const { id, ...data } = project;
    
    Object.keys(data).forEach(key => {
      if ((data as Record<string, any>)[key] === undefined) delete (data as Record<string, any>)[key];
    });
    console.log('Dodawany projekt do Firestore:', data);
    await addDoc(collection(db, this.collectionName), data);
  }

  static async update(updated: Project) {
    if (!updated.id) throw new Error('Project must have an id');
    const ref = doc(db, this.collectionName, updated.id);
    const { id, ...data } = updated;
    await updateDoc(ref, data);
  }

  static async delete(id: string) {
    const ref = doc(db, this.collectionName, id);
    await deleteDoc(ref);
  }
} 