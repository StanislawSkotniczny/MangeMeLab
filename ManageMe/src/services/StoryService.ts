import { db } from '../firebase';
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import type { Story } from '../models/Story';

export class StoryService {
  private static collectionName = 'stories';

  static async getAll(): Promise<Story[]> {
    const querySnapshot = await getDocs(collection(db, this.collectionName));
    return querySnapshot.docs.map(doc => {
      const data = doc.data() as Story;
      return { ...data, id: doc.id };
    });
  }

  static async getByProject(projectId: string): Promise<Story[]> {
    const q = query(collection(db, this.collectionName), where('projectId', '==', projectId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data() as Story;
      return { ...data, id: doc.id };
    });
  }

  static async add(story: Story) {
    const { id, ...data } = story;
    await addDoc(collection(db, this.collectionName), data);
  }

  static async update(updated: Story) {
    if (!updated.id) throw new Error('Story must have an id');
    const ref = doc(db, this.collectionName, updated.id);
    const { id, ...data } = updated;
    await updateDoc(ref, data);
  }

  static async delete(id: string) {
    const ref = doc(db, this.collectionName, id);
    await deleteDoc(ref);
  }
} 