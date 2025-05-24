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
import type { Task } from '../models/Task';

export class TaskService {
  private static collectionName = 'tasks';

  static async getAll(): Promise<Task[]> {
    const querySnapshot = await getDocs(collection(db, this.collectionName));
    return querySnapshot.docs.map(doc => {
      const data = doc.data() as Task;
      return { ...data, id: doc.id };
    });
  }

  static async getByStory(storyId: string): Promise<Task[]> {
    console.log('Pobieram zadania dla storyId:', storyId);
    const q = query(collection(db, this.collectionName), where('storyId', '==', storyId));
    const querySnapshot = await getDocs(q);
    const tasks = querySnapshot.docs.map(doc => {
      const data = doc.data() as Task;
      return { ...data, id: doc.id };
    });
    console.log('Znalezione zadania:', tasks);
    return tasks;
  }

  static async add(task: Task) {
    const { id, ...data } = task;
    Object.keys(data).forEach(key => {
      if ((data as Record<string, any>)[key] === undefined) delete (data as Record<string, any>)[key];
    });
    await addDoc(collection(db, this.collectionName), data);
  }

  static async update(updated: Task) {
    if (!updated.id) throw new Error('Task must have an id');
    const ref = doc(db, this.collectionName, updated.id);
    const { id, ...data } = updated;
    Object.keys(data).forEach(key => {
      if ((data as Record<string, any>)[key] === undefined) delete (data as Record<string, any>)[key];
    });
    await updateDoc(ref, data);
  }

  static async delete(id: string) {
    const ref = doc(db, this.collectionName, id);
    await deleteDoc(ref);
  }
} 