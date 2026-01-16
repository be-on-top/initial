import { Injectable } from '@angular/core';
import { Firestore, collectionData, collection } from '@angular/fire/firestore';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

/**
 * Interface représentant les données utiles
 * pour l'export CSV des étudiants.
 * Les champs sont optionnels car Firestore
 * ne garantit pas leur présence sur tous les documents.
 */
interface Student {
  email?: string;
  firstName?: string;
  lastName?: string;
    created?: number; // timestamp en ms
  subscriptions?: string[]; // Codes métiers des inscriptions
}

@Injectable({
  providedIn: 'root'
})
export class StudentsExportService {

  constructor(private firestore: Firestore) {}

  /**
   * Exporte la collection "students" au format CSV.
   *
   * - Utilise RxJS pour rester cohérent avec Angular
   * - Prend un snapshot unique (take(1))
   * - Génère un CSV standard (RFC 4180)
   * - Déclenche le téléchargement côté navigateur
   */
  exportStudentsToCSV(): Observable<void> {

    // Référence vers la collection Firestore
    const studentsRef = collection(this.firestore, 'students');

    return collectionData(studentsRef).pipe(

      // On prend un seul snapshot pour éviter
      // toute réexécution en cas de modification Firestore
      take(1),

      map((students: Student[]) => {

        // Ordre et noms des colonnes du CSV
        // Ces en-têtes servent aussi au mapping ERP
        const headers = [
          'email',
          'firstName',
          'lastName',
          'created',
          'subscriptions'
        ];

        // Transformation des documents Firestore
        // en lignes CSV "plates" (ERP-friendly)

        
        const rows = students.map(student => ({
          email: student.email ?? '',
          firstName: student.firstName ?? '',
          lastName: student.lastName ?? '',

          // Conversion du Timestamp Firestore
          // vers un format ISO 8601 standard
          // createdAt: student.createdAt
          //   ? student.createdAt.toDate().toISOString()
          //   : '',
            created: typeof student.created === 'number'
    ? new Date(student.created).toISOString()
    : '',

          // Tableau de codes métiers converti
          // en chaîne simple séparée par des virgules
          subscriptions: Array.isArray(student.subscriptions)
            ? student.subscriptions.join(',')
            : ''
        }));

        // Construction du contenu CSV
        const csv = this.buildCSV(headers, rows);

        // Téléchargement du fichier
        this.download(csv, 'students.csv');
      })
    );
  }

  /**
   * Construit un CSV standard :
   * - séparateur virgule
   * - valeurs entourées de guillemets
   * - échappement des guillemets internes
   *
   * Compatible Excel, ERP, ETL, Google Sheets.
   */
  private buildCSV(headers: string[], rows: any[]): string {

    // Fonction d'échappement CSV
    const escape = (value: string) =>
      `"${value.replace(/"/g, '""')}"`;

    // Ligne d'en-tête
    const headerLine = headers.join(',');

    // Lignes de données
    const lines = rows.map(row =>
      headers
        .map(h => escape((row[h] ?? '').toString()))
        .join(',')
    );

    return [headerLine, ...lines].join('\n');
  }

  /**
   * Déclenche le téléchargement du fichier CSV
   * dans le navigateur.
   */
  private download(content: string, filename: string): void {

    // Création du fichier CSV en mémoire
    const blob = new Blob([content], {
      type: 'text/csv;charset=utf-8;'
    });

    // Génération d'une URL temporaire
    const url = URL.createObjectURL(blob);

    // Création d'un lien de téléchargement
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    // Libération de la ressource mémoire
    URL.revokeObjectURL(url);
  }
}
