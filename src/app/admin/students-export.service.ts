import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  getDocs
} from '@angular/fire/firestore';
import { take, switchMap } from 'rxjs/operators';
import { Observable, from, firstValueFrom } from 'rxjs';

/**
 * ============================
 * 🔹 MODELES FIRESTORE REELS
 * ============================
 */

/**
 * Représente STRICTEMENT
 * un document de la collection `students`
 */
interface StudentDoc {
  email?: string;
  firstName?: string;
  lastName?: string;
  created?: number;               // timestamp (ms)
  subscriptions?: string[];       // codes métiers
  localTraining?: string;
}

/**
 * Document `students` + id Firestore
 */
interface Student extends StudentDoc {
  id: string;
}

/**
 * Représente STRICTEMENT
 * un document de la collection `socialForm`
 */
interface SocialFormDoc {
  address?: string;
  postalCode?: string;
  city?: string;
  phone?: string;
  dateOfBirth?: string;
  frenchNationality?: string;
  priorTrade?: string;
  idPoleEmploi?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StudentsExportService {

  constructor(private firestore: Firestore) {}

  /**
   * =====================================
   * 🔹 POINT D’ENTRÉE UNIQUE DE L’EXPORT
   * =====================================
   *
   * - Soit on reçoit déjà un tableau d’étudiants (rôle référent)
   * - Soit on charge toute la collection (rôle admin)
   */
  exportStudentsToCSV(students?: Student[]): Observable<void> {

    // 🔹 Cas 1 : export à partir d’un tableau déjà filtré
    if (students) {
      return from(this.exportArray(students));
    }

    // 🔹 Cas 2 : export global depuis Firestore
    const studentsRef = collection(this.firestore, 'students');

    return collectionData<StudentDoc>(studentsRef, { idField: 'id' }).pipe(
      take(1), // snapshot unique
      switchMap(docs =>
        from(
          this.exportArray(docs as Student[]) // id garanti par idField
        )
      )
    );
  }

  /**
   * =====================================
   * 🔹 GÉNÉRATION RÉELLE DU CSV
   * =====================================
   *
   * - Précharge toutes les dépendances
   * - Agrège les données
   * - Génère et télécharge le CSV
   */
  private async exportArray(students: Student[]): Promise<void> {

    // Préchargement des dépendances
    const [tradeRefMap, socialFormsMap] = await Promise.all([
      this.loadTradeRefs(),   // sigles → erpRef
      this.loadSocialForms()  // socialForm (jointure par id)
    ]);

    /**
     * En-têtes du CSV
     * 👉 contrat d’échange avec l’ERP
     */
    const headers = [
      'id',
      'email',
      'firstName',
      'lastName',
      'createdAt',
      'subscriptions',
      'erpRef',
      'localTraining',
      'address',
      'postalCode',
      'city',
      'phone',
      'dateOfBirth',
      'frenchNationality',
      'idPoleEmploi',
      'priorTrade'
    ];

    /**
     * Construction des lignes CSV
     * 👉 agrégation contrôlée de plusieurs collections
     */
    const rows = students.map(student => {

      // 🔗 Jointure 1–1 : student.id === socialForm.doc.id
      const socialForm: SocialFormDoc | undefined =
        student.id ? socialFormsMap[student.id] : undefined;

      const subscriptions = Array.isArray(student.subscriptions)
        ? student.subscriptions
        : [];

      const erpRefs = subscriptions
        .map(sigle => tradeRefMap[sigle])
        .filter(Boolean);

      return {
        // 🔹 Données issues de `students`
        id: student.id,
        email: student.email ?? '',
        firstName: student.firstName ?? '',
        lastName: student.lastName ?? '',
        createdAt: typeof student.created === 'number'
          ? new Date(student.created).toISOString()
          : '',
        subscriptions: subscriptions.join(','),
        localTraining: student.localTraining ?? '',
        erpRef: erpRefs.join(','),

        // 🔽 Données issues de `socialForm`
        address: socialForm?.address ?? '',
        postalCode: socialForm?.postalCode ?? '',
        city: socialForm?.city ?? '',
        phone: socialForm?.phone ?? '',
        dateOfBirth: socialForm?.dateOfBirth ?? '',
        priorTrade: socialForm?.priorTrade ?? '',
        frenchNationality: socialForm?.frenchNationality ?? '',
        idPoleEmploi: socialForm?.idPoleEmploi ?? ''
      };
    });

    const csv = this.buildCSV(headers, rows);
    this.download(csv, 'students.csv');
  }

  /**
   * =====================================
   * 🔹 SIGLES → ERP REF
   * =====================================
   */
  private async loadTradeRefs(): Promise<Record<string, string>> {

    const siglesRef = collection(this.firestore, 'sigles');

    const trades = await firstValueFrom(
      collectionData(siglesRef, { idField: 'id' }).pipe(take(1))
    );

    const map: Record<string, string> = {};

    if (!Array.isArray(trades)) {
      return map;
    }

    trades.forEach((trade: any) => {
      if (trade.id && trade.erpRef) {
        map[trade.id] = trade.erpRef;
      }
    });

    return map;
  }

  /**
   * =====================================
   * 🔹 SOCIAL FORM (jointure par id)
   * =====================================
   */
  private async loadSocialForms(): Promise<Record<string, SocialFormDoc>> {

    const snapshot = await getDocs(
      collection(this.firestore, 'SocialForm')
    );

    const map: Record<string, SocialFormDoc> = {};

    snapshot.forEach(doc => {
      map[doc.id] = doc.data() as SocialFormDoc;
    });

    return map;
  }

  /**
   * =====================================
   * 🔹 CONSTRUCTION CSV
   * =====================================
   */
  private buildCSV(headers: string[], rows: any[]): string {

    const containsSpecialChars = (v: string) => /[",;\n\r]/.test(v);

    const allValues = [
      ...headers,
      ...rows.flatMap(r => headers.map(h => (r[h] ?? '').toString()))
    ];

    const separator = allValues.some(containsSpecialChars) ? ';' : ',';
    const sepLine = `sep=${separator}`;

    const escape = (v: string) => {
      if (/[\"\n\r;]/.test(v) || v.includes(separator)) {
        return `"${v.replace(/"/g, '""')}"`;
      }
      return v;
    };

    const headerLine = headers.map(escape).join(separator);
    const lines = rows.map(r =>
      headers.map(h => escape((r[h] ?? '').toString())).join(separator)
    );

    // BOM UTF-8 pour Excel
    return '\uFEFF' + [sepLine, headerLine, ...lines].join('\n');
  }

  /**
   * =====================================
   * 🔹 TÉLÉCHARGEMENT NAVIGATEUR
   * =====================================
   */
  private download(content: string, filename: string): void {

    const blob = new Blob([content], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
  }
}
