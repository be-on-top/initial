import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, addDoc, updateDoc, deleteDoc, query, orderBy, where } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { News } from './news';

@Injectable({ providedIn: 'root' })
export class NewsService {

  constructor(
    private firestore: Firestore,
    private storage: Storage
  ) {}

  // 🔹 GET ALL (admin)
  getAll(): Observable<News[]> {
    const refCollection = collection(this.firestore, 'news');
    const q = query(refCollection, orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<News[]>;
  }

  // 🔹 GET PUBLISHED (front)
  // getPublished(): Observable<News[]> {
  //   const refCollection = collection(this.firestore, 'news');
  //   const q = query(
  //     refCollection,
  //     where('status', '==', 'published'),
  //     orderBy('createdAt', 'desc')
  //   );
  //   return collectionData(q, { idField: 'id' }) as Observable<News[]>;
  // }

  getPublished(): Observable<News[]> {
  const refCollection = collection(this.firestore, 'news');
  return collectionData(refCollection, { idField: 'id' }) as Observable<News[]>;
}

  // 🔹 GET ONE
  getOne(id: string): Observable<News> {
    const refDoc = doc(this.firestore, `news/${id}`);
    return docData(refDoc, { idField: 'id' }) as Observable<News>;
  }

  // 🔹 CREATE
  async create(news: News) {
    const refCollection = collection(this.firestore, 'news');
    return await addDoc(refCollection, {
      ...news,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  // 🔹 UPDATE
  async update(id: string, news: Partial<News>) {
    const refDoc = doc(this.firestore, `news/${id}`);
    return await updateDoc(refDoc, {
      ...news,
      updatedAt: new Date()
    });
  }

  // 🔹 DELETE
  async delete(id: string) {
    const refDoc = doc(this.firestore, `news/${id}`);
    return await deleteDoc(refDoc);
  }

  // 🔹 UPLOAD IMAGE
  async uploadImage(file: File): Promise<string> {
    const path = `news/${Date.now()}`;
    const storageRef = ref(this.storage, path);

    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  }
}