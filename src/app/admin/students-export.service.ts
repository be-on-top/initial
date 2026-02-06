import { Injectable } from '@angular/core';
import { Firestore, collectionData, collection } from '@angular/fire/firestore';
import { take, switchMap } from 'rxjs/operators';
import { firstValueFrom, Observable, from } from 'rxjs';

interface Student {
  email?: string;
  firstName?: string;
  lastName?: string;
  created?: number;
  subscriptions?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class StudentsExportService {

  constructor(private firestore: Firestore) {}

  /**
   * Point d’entrée UNIQUE de l’export CSV
   */
  exportStudentsToCSV(students?: Student[]): Observable<void> {

    // 🔹 Cas 1 : on fournit déjà les étudiants
    if (students) {     
      return from(this.exportArray(students));
    }

    // 🔹 Cas 2 : export global depuis Firestore
    const studentsRef = collection(this.firestore, 'students');

    return collectionData(studentsRef).pipe(
      take(1),
      switchMap((students: Student[]) =>
        from(this.exportArray(students))
      )
    );
  }

  /**
   * Génère réellement le CSV (async)
   */
  private async exportArray(students: Student[]): Promise<void> {

    // Chargement des correspondances métier -> ERP
    const tradeRefMap = await this.loadTradeRefs();

    const headers = [
      'email',
      'firstName',
      'lastName',
      'createdAt',
      'subscriptions',
      'erpRef'
    ];

    const rows = students.map(student => {

      const subscriptions = Array.isArray(student.subscriptions)
        ? student.subscriptions
        : [];

      const erpRefs = subscriptions
        .map(sigle => tradeRefMap[sigle])
        .filter(Boolean);

      return {
        email: student.email ?? '',
        firstName: student.firstName ?? '',
        lastName: student.lastName ?? '',
        createdAt: typeof student.created === 'number'
          ? new Date(student.created).toISOString()
          : '',
        subscriptions: subscriptions.join(','),
        erpRef: erpRefs.join(',')
      };
    });

    const csv = this.buildCSV(headers, rows);
    this.download(csv, 'students.csv');
  }

  /**
   * Chargement des références ERP depuis la collection `sigles`
   */
  private async loadTradeRefs(): Promise<Record<string, string>> {

    const siglesRef = collection(this.firestore, 'sigles');

    const trades = await firstValueFrom(
      collectionData(siglesRef, { idField: 'id' }).pipe(take(1))
    );

    const mapRef: Record<string, string> = {};

    if (!Array.isArray(trades)) {
      return mapRef;
    }

    trades.forEach((trade: any) => {
      if (trade.id && trade.erpRef) {
        mapRef[trade.id] = trade.erpRef;
      }
    });

    return mapRef;
  }

  /**
   * Génération CSV compatible Excel / ERP
   */
  private buildCSV(headers: string[], rows: any[]): string {

    const containsSpecialChars = (v: string) => /[",;\n\r]/.test(v);

    const allValues = [
      ...headers,
      ...rows.flatMap(r => headers.map(h => (r[h] ?? '').toString()))
    ];

    const separator = allValues.some(containsSpecialChars) ? ';' : ',';
    const sepLine = `sep=${separator}`;
    // const separator = ';';
    // const sepLine = 'sep=;';

    

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

    return '\uFEFF' + [sepLine, headerLine, ...lines].join('\n');
  }

  

  /**
   * Téléchargement navigateur
   */
  private download(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
  }

  


}
