import { Injectable } from '@angular/core';
import { MarketDoc } from './market-doc';

import {
  Firestore,
  collection,
  addDoc,
  updateDoc,
  doc,
  collectionData,
  deleteDoc,
  Timestamp
} from '@angular/fire/firestore';

import {
  Storage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from '@angular/fire/storage';

import { Observable } from 'rxjs';

/**
 * =========================
 * Payload du formulaire
 * =========================
 * → utilisé pour l'upload (contient le fichier)
 */
export interface MarketingDocPayload {
  title: string;
  comment: string;
  file: File | null;
}

@Injectable({
  providedIn: 'root'
})
export class MarketingDocService {

  /**
   * Nom de la collection Firestore
   */
  private collectionPath = 'marketing';

  /**
   * Dossier dans Firebase Storage
   */
  private storagePath = 'marketing-docs';

  constructor(
    private firestore: Firestore,
    private storage: Storage
  ) {}

  /**
   * =========================
   * CREATE / UPDATE
   * =========================
   * → Gère :
   * - création
   * - édition
   * - upload fichier optionnel
   */
  async saveMarketingDoc(
    data: MarketingDocPayload,
    existingId?: string
  ): Promise<void> {

    let fileUrl: string | null = null;

    // =========================
    // 1. Upload fichier (si présent)
    // =========================
    if (data.file) {
      const filePath = this.buildFilePath(data.file.name);
      const fileRef = ref(this.storage, filePath);

      const uploadResult = await uploadBytes(fileRef, data.file);
      fileUrl = await getDownloadURL(uploadResult.ref);
    }

    // =========================
    // 2. Construction objet Firestore
    // =========================
    const docData: Partial<MarketDoc> = {
      title: data.title,
      comment: data.comment,
      updatedAt: Timestamp.now()
    };

    // On met à jour l’URL uniquement si un fichier a été uploadé
    if (fileUrl) {
      docData.fileUrl = fileUrl;
    }

    // =========================
    // 3. CREATE ou UPDATE
    // =========================
    if (existingId) {
      await this.updateDoc(existingId, docData);
    } else {
      await this.createDoc(docData);
    }
  }

  /**
   * =========================
   * READ (LISTE)
   * =========================
   * → utilisé dans market-docs-list
   */
  getMarketingDocs(): Observable<MarketDoc[]> {
    const colRef = collection(this.firestore, this.collectionPath);

    return collectionData(colRef, {
      idField: 'id'
    }) as Observable<MarketDoc[]>;
  }

  /**
   * =========================
   * READ (1 document)
   * =========================
   * → utile pour le mode EDIT du formulaire
   */
  getMarketingDocById(id: string) {
    const docRef = doc(this.firestore, `${this.collectionPath}/${id}`);
    return docRef;
    // (si besoin on pourra faire un docData() plus tard)
  }

  /**
   * =========================
   * DELETE
   * =========================
   * → supprime :
   * - document Firestore
   * - fichier Storage
   */
async deleteMarketingDoc(id: string, fileUrl?: string): Promise<void> {

  // 1. Suppression Firestore
  const docRef = doc(this.firestore, `${this.collectionPath}/${id}`);
  await deleteDoc(docRef);

  // 2. Suppression Storage
  if (fileUrl) {
    try {
      const path = this.extractPathFromUrl(fileUrl);

      if (path) {
        const fileRef = ref(this.storage, path);
        await deleteObject(fileRef);
      } else {
        console.warn('Impossible de récupérer le path du fichier');
      }

    } catch (error) {
      console.warn('Erreur suppression fichier Storage :', error);
    }
  }
}

  /**
   * =========================
   * CREATE interne
   * =========================
   */
  private async createDoc(
    data: Partial<MarketDoc>
  ): Promise<void> {

    const colRef = collection(this.firestore, this.collectionPath);

    await addDoc(colRef, {
      ...data,
      createdAt: Timestamp.now()
    });
  }

  /**
   * =========================
   * UPDATE interne
   * =========================
   */
  private async updateDoc(
    id: string,
    data: Partial<MarketDoc>
  ): Promise<void> {

    const docRef = doc(this.firestore, `${this.collectionPath}/${id}`);
    await updateDoc(docRef, data);
  }

  /**
   * =========================
   * Génération chemin fichier
   * =========================
   * → évite les collisions de noms
   */
  private buildFilePath(fileName: string): string {
    const timestamp = Date.now();
    return `${this.storagePath}/${timestamp}_${fileName}`;
  }

  private extractPathFromUrl(fileUrl: string): string | null {
  try {
    const decodedUrl = decodeURIComponent(fileUrl);
    const match = decodedUrl.match(/\/o\/(.*?)\?/);

    return match ? match[1] : null;
  } catch (error) {
    console.error('Erreur extraction path:', error);
    return null;
  }
}
}