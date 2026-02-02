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
  // exportStudentsToCSV(): Observable<void> {

  //   // Référence vers la collection Firestore
  //   const studentsRef = collection(this.firestore, 'students');

  //   return collectionData(studentsRef).pipe(

  //     // On prend un seul snapshot pour éviter
  //     // toute réexécution en cas de modification Firestore
  //     take(1),

  //     map((students: Student[]) => {

  //       // Ordre et noms des colonnes du CSV
  //       // Ces en-têtes servent aussi au mapping ERP
  //       const headers = [
  //         'email',
  //         'firstName',
  //         'lastName',
  //         'created',
  //         'subscriptions'
  //       ];

  //       // Transformation des documents Firestore
  //       // en lignes CSV "plates" (ERP-friendly)

        
  //       const rows = students.map(student => ({
  //         email: student.email ?? '',
  //         firstName: student.firstName ?? '',
  //         lastName: student.lastName ?? '',

  //         // Conversion du Timestamp Firestore
  //         // vers un format ISO 8601 standard
  //         // createdAt: student.createdAt
  //         //   ? student.createdAt.toDate().toISOString()
  //         //   : '',
  //           created: typeof student.created === 'number'
  //   ? new Date(student.created).toISOString()
  //   : '',

  //         // Tableau de codes métiers converti
  //         // en chaîne simple séparée par des virgules
  //         subscriptions: Array.isArray(student.subscriptions)
  //           ? student.subscriptions.join(',')
  //           : ''
  //       }));

  //       // Construction du contenu CSV
  //       const csv = this.buildCSV(headers, rows);

  //       // Téléchargement du fichier
  //       this.download(csv, 'students.csv');
  //     })
  //   );
  // }

  exportStudentsToCSV(students?: Student[]): Observable<void> {

  // Cas 1 : on nous fournit déjà les étudiants (référent)
  if (students) {
    return this.exportFromArray(students);
  }

  // Cas 2 : on exporte toute la collection (admin)
  const studentsRef = collection(this.firestore, 'students');

  return collectionData(studentsRef).pipe(
    take(1),
    map((students: Student[]) => {
      this.exportArray(students);
    })
  );
}

private exportFromArray(students: Student[]): Observable<void> {
  return new Observable<void>(observer => {
    this.exportArray(students);
    observer.next();
    observer.complete();
  });
}

/**
 * Génère et télécharge un export CSV à partir
 * d'une liste d'étudiants fournie.
 *
 * Ce traitement est volontairement générique :
 * - il ne dépend pas du rôle (admin / référent)
 * - il ne dépend pas de la source des données (Firestore ou liste filtrée)
 * - il expose un format ERP-friendly, stable et documenté
 */
private exportArray(students: Student[]): void {

  /**
   * En-têtes du CSV.
   * Ces noms constituent le contrat d’échange
   * avec le système cible (ERP / outil tiers).
   */
  const headers = [
    'email',
    'firstName',
    'lastName',
    'createdAt',
    'subscriptions'
  ];

  /**
   * Transformation des objets Student internes
   * en lignes CSV "plates" et normalisées.
   *
   * ⚠️ Important :
   * - Le champ interne Firestore est `created` (timestamp en ms)
   * - La colonne exposée dans le CSV est `createdAt`,
   *   nom standard attendu par la majorité des ERP
   */
  const rows = students.map(student => ({
    email: student.email ?? '',
    firstName: student.firstName ?? '',
    lastName: student.lastName ?? '',

    /**
     * Date de création du candidat
     * convertie au format ISO 8601.
     *
     * Ce format est :
     * - lisible par les humains
     * - exploitable par Excel / ERP / ETL
     * - indépendant de Firebase
     */
    createdAt: typeof student.created === 'number'
      ? new Date(student.created).toISOString()
      : '',

    /**
     * Codes métiers des inscriptions.
     * Les tableaux sont volontairement aplatis
     * en une chaîne simple, séparée par des virgules,
     * afin de faciliter le mapping côté ERP.
     */
    subscriptions: Array.isArray(student.subscriptions)
      ? student.subscriptions.join(',')
      : ''
  }));

  // Construction du contenu CSV final
  const csv = this.buildCSV(headers, rows);

  // Déclenchement du téléchargement côté navigateur
  this.download(csv, 'students.csv');
}



  /**
   * Construit un CSV standard :
   * - séparateur virgule
   * - valeurs entourées de guillemets
   * - échappement des guillemets internes
   *
   * Compatible Excel, ERP, ETL, Google Sheets.
   */
  // private buildCSV(headers: string[], rows: any[]): string {

  //   // Fonction d'échappement CSV
  //   const escape = (value: string) =>
  //     `"${value.replace(/"/g, '""')}"`;

  //   // Ligne d'en-tête
  //   const headerLine = headers.join(',');

  //   // Lignes de données
  //   const lines = rows.map(row =>
  //     headers
  //       .map(h => escape((row[h] ?? '').toString()))
  //       .join(',')
  //   );

  //   return [headerLine, ...lines].join('\n');
  // }
//   private buildCSV(headers: string[], rows: any[]): string {

//   // Fonction pour détecter si une valeur contient des virgules, des points-virgules ou un saut de ligne
//   const containsSpecialChars = (value: string) =>
//     /[",;\n\r]/.test(value);

//   // Fonction pour convertir toutes les valeurs en string et détecter le meilleur séparateur
//   const allValues = [
//     ...headers.map(h => h.toString()),
//     ...rows.flatMap(row => headers.map(h => (row[h] ?? '').toString()))
//   ];

//   // Si au moins une valeur contient une virgule, préférer ; comme séparateur
//   // Sinon, utiliser ,
//   const separator = allValues.some(containsSpecialChars) ? ';' : ',';

//   // Ligne spéciale pour Excel
//   const sepLine = `sep=${separator}`;

//   // Fonction d'échappement CSV
//   const escape = (value: string) => {
//     const str = value ?? '';
//     // Si la valeur contient des guillemets, des sauts de ligne ou le séparateur, on met entre guillemets
//     if (/[\"\n\r;]/.test(str) || str.includes(separator)) {
//       return `"${str.replace(/"/g, '""')}"`;
//     }
//     return str;
//   };

//   // Ligne d'en-tête
//   const headerLine = headers.map(escape).join(separator);

//   // Lignes de données
//   const lines = rows.map(row =>
//     headers.map(h => escape((row[h] ?? '').toString())).join(separator)
//   );

//   return [sepLine, headerLine, ...lines].join('\n');
// }

private buildCSV(headers: string[], rows: any[]): string {
  const containsSpecialChars = (value: string) =>
    /[",;\n\r]/.test(value);

  const allValues = [
    ...headers.map(h => h.toString()),
    ...rows.flatMap(row => headers.map(h => (row[h] ?? '').toString()))
  ];

  const separator = allValues.some(containsSpecialChars) ? ';' : ',';
  const sepLine = `sep=${separator}`;

  const escape = (value: string) => {
    const str = value ?? '';
    if (/[\"\n\r;]/.test(str) || str.includes(separator)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerLine = headers.map(escape).join(separator);
  const lines = rows.map(row =>
    headers.map(h => escape((row[h] ?? '').toString())).join(separator)
  );

  // Ajout du BOM UTF-8
  return '\uFEFF' + [sepLine, headerLine, ...lines].join('\n');
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
