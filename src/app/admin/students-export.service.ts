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
  endingDateEducation?: string;
  hasTransportationMean?: string;
  searchCdi?: boolean;
  mainSector?: string; // mainSector education
  mobility?: string;
  trainingFinancingProposal?: string;
  isMilitary?: string;
  isStudent?: string;
  isPoleEmploi?: string;
  compteCPF?: string;
  droitsCPF?: string;
  permisB?: string;
  cdiRequiredDuration?: string;
  historyFiveLastYears?: string;
  cddDuration?: string;
  cddEndDate?: string;
  tempWorker?: string;
  handicap?: string;
  otherDrivingLicense?: string;
  sentCompanyEmployee?: string;
  franceCompetencesCodes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StudentsExportService {

  constructor(private firestore: Firestore) { }

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
    const [tradeRefMap, socialFormsMap, tradeDenominationsMap, franceCompetencesMap] = await Promise.all([
      this.loadTradeRefs(),   // sigles → erpRef
      this.loadSocialForms(),  // socialForm (jointure par id)
      this.loadTradeDenominations(), // sigles > denominations
      this.loadFranceCompetencesCodes() // ← AJOUT
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
      'subscriptionsDenominations',
      'franceCompetencesCodes',
      'localTraining',
      'address',
      'postalCode',
      'city',
      'phone',
      'dateOfBirth',
      'frenchNationality',
      'idPoleEmploi',
      'priorTrade',
      'initialIntentErpRef',
      'isPoleEmploi',
      'isStudent',
      'isMilitary',
      'isEmployee',
      'cddDuration',
      'cddEndDate',
      'cdiRequiredDuration',
      'historyFiveLastYears',
      'sentCompanyEmployee',
      'tempWorker',
      'handicap',
      'hasTransportationMean',
      'mobility',
      'compteCPF',
      'droitsCPF',
      'permisB',
      'otherDrivingLicense'
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

      const denominations = subscriptions
        .map(sigle => tradeDenominationsMap[sigle])
        .filter(Boolean);

      const erpRefs = subscriptions
        .map(sigle => tradeRefMap[sigle])
        .filter(Boolean);

      const franceCompetencesCodes = subscriptions
        .map(sigle => franceCompetencesMap[sigle])
        .filter(Boolean);


      // initialIntentErpRef: ERP ref correspondant à l'intention initiale du candidat
      // ⚠️ Donnée informative, non contractuelle, désactivée volontairement pour l’instant

      const initialIntentErpRef =
        socialForm?.priorTrade
          ? tradeRefMap[socialForm.priorTrade] ?? ''
          : '';

      const hasEmployeeSignal =
        Boolean(socialForm?.sentCompanyEmployee) ||
        Boolean(socialForm?.cddDuration) ||
        Boolean(socialForm?.cdiRequiredDuration);

      const isEmployee = hasEmployeeSignal ? 'true' : 'false';


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
        // 🔹 Données issues de requêtes croisées vers la collection 'sigles'
        erpRef: erpRefs.join(','),
        subscriptionsDenominations: denominations.join(','),
        franceCompetencesCodes: franceCompetencesCodes.join(','),

        // 🔽 Données issues de `socialForm`
        address: socialForm?.address ?? '',
        postalCode: socialForm?.postalCode ?? '',
        city: socialForm?.city ?? '',
        phone: socialForm?.phone ?? '',
        dateOfBirth: socialForm?.dateOfBirth ?? '',
        // dateOfBirth: this.toISODate(socialForm?.dateOfBirth),
        priorTrade: socialForm?.priorTrade ?? '',
        initialIntentErpRef: initialIntentErpRef,
        frenchNationality: socialForm?.frenchNationality ?? '',
        isPoleEmploi: socialForm?.isPoleEmploi ?? '',
        idPoleEmploi: socialForm?.idPoleEmploi ?? '',
        isStudent: socialForm?.isStudent ?? '',
        isMilitary: socialForm?.isMilitary ?? '',
        hasTransportationMean: socialForm?.hasTransportationMean ?? '',
        mobility: socialForm?.mobility ?? '',
        compteCPF: socialForm?.compteCPF ?? '',
        droitsCPF: socialForm?.droitsCPF ?? '',
        permisB: socialForm?.permisB ?? '',
        isEmployee: isEmployee,
        sentCompanyEmployee: socialForm?.sentCompanyEmployee ?? '',
        cddDuration: socialForm?.cddDuration ?? '',
        cddEndDate: socialForm?.cddEndDate ?? '',
        cdiRequiredDuration: socialForm?.cdiRequiredDuration ?? '',
        historyFiveLastYears: socialForm?.historyFiveLastYears ?? '',
        tempWorker: socialForm?.tempWorker ?? '',
        handicap: socialForm?.handicap ?? '',
        otherDrivingLicense: socialForm?.otherDrivingLicense ?? '',
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
 * 🔹 SIGLES → DENOMINATIONS (libellés)
 * =====================================
 */
  private async loadTradeDenominations(): Promise<Record<string, string>> {

    const siglesRef = collection(this.firestore, 'sigles');

    const trades = await firstValueFrom(
      collectionData(siglesRef, { idField: 'id' }).pipe(take(1))
    );

    const map: Record<string, string> = {};

    if (!Array.isArray(trades)) {
      return map;
    }

    trades.forEach((trade: any) => {
      if (trade.id && trade.denomination) {
        map[trade.id] = trade.denomination;
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


  /**
   * =====================================
   * 🔹 NORMALISATION DATE (FR → ISO 8601)
   * =====================================
   *
   * Contexte d’architecture :
   * Les dates issues du socialForm sont stockées
   * au format texte français (DD/MM/YYYY).
   *
   * L’export CSV constitue un contrat d’échange
   * avec des ERP externes. Afin de garantir :
   * - une interopérabilité maximale,
   * - un format stable et non ambigu,
   * - une compatibilité avec les imports standards ERP,
   *
   * toutes les dates sont normalisées au format ISO 8601.
   *
   * Cette transformation est purement technique
   * (formatage) et ne constitue pas une interprétation métier.
   */

  // private toISODate(dateStr?: string): string {

  //   // 🔹 Sécurité : champ non renseigné
  //   if (!dateStr) return '';

  //   // 🔹 Format attendu : DD/MM/YYYY
  //   const parts = dateStr.split('/');

  //   // 🔹 Format incorrect → on n’interprète pas
  //   if (parts.length !== 3) return '';

  //   const [day, month, year] = parts;

  //   // 🔹 Construction d’un objet Date JS
  //   // ⚠️ Les mois commencent à 0 en JavaScript
  //   const isoDate = new Date(
  //     Number(year),
  //     Number(month) - 1,
  //     Number(day)
  //   );

  //   // 🔹 Vérification date valide
  //   if (isNaN(isoDate.getTime())) return '';

  //   // 🔹 Retour au format ISO 8601 (UTC)
  //   // return isoDate.toISOString();
  //   return isoDate.toISOString().split('T')[0];

  // }

  private toISODate(dateStr?: string): string {

    if (!dateStr) return '';

    // 🔹 Si déjà au format ISO YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }

    const parts = dateStr.split('/');

    if (parts.length !== 3) return '';

    const [day, month, year] = parts;

    const isoDate = new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    );

    if (isNaN(isoDate.getTime())) return '';

    return isoDate.toISOString().split('T')[0];
  }

  /**
 * =====================================
 * 🔹 EXTRACTION CODE FRANCE COMPÉTENCES
 * =====================================
 *
 * Contexte :
 * Chaque métier dans Firestore possède une URL vers sa fiche officielle
 * sur le site France Compétences, par exemple :
 *
 * https://www.francecompetences.fr/recherche/rs/6938/
 * https://www.francecompetences.fr/recherche/rncp/12345/
 *
 * Objectif :
 * Extraire un identifiant métier standardisé :
 *
 * RS6938
 * RNCP12345
 *
 * Cet identifiant constitue une référence nationale officielle,
 * indépendante de tout ERP spécifique, et garantit l’interopérabilité
 * avec la majorité des ERP (NEVEA, GesCOF, etc.).
 *
 * Cette transformation :
 * - est purement technique
 * - ne modifie pas la donnée source
 * - ne constitue pas une interprétation métier
 * - permet uniquement une normalisation pour l’export
 *
 * Fonctionnement :
 * - recherche le motif "recherche/rs/XXXX" ou "recherche/rncp/XXXX"
 * - extrait le type (RS ou RNCP)
 * - extrait le numéro
 * - retourne la concaténation normalisée (ex : RS6938)
 *
 * Sécurité :
 * retourne null si :
 * - url absente
 * - format inattendu
 * - extraction impossible
 */
  private extractFranceCompetencesCode(url?: string): string | null {

    // 🔹 Sécurité : champ absent ou vide
    if (!url) {
      return null;
    }

    /**
     * 🔹 Expression régulière
     *
     * recherche/
     *   (rs|rncp)  → capture le type de certification
     *   /
     *   (\d+)      → capture le numéro
     *
     * options :
     * i → insensible à la casse
     */
    const match = url.match(/recherche\/(rs|rncp)\/(\d+)/i);

    // 🔹 Aucun match → format inconnu ou non compatible
    if (!match) {
      return null;
    }

    /**
     * match[0] = "recherche/rs/6938"
     * match[1] = "rs"
     * match[2] = "6938"
     */

    // 🔹 Normalisation du type en majuscules
    const type = match[1].toUpperCase();

    // 🔹 Numéro France Compétences
    const number = match[2];

    /**
     * 🔹 Construction du code standardisé
     *
     * Exemples :
     * RS + 6938   → RS6938
     * RNCP + 12345 → RNCP12345
     */
    return `${type}${number}`;
  }


  private async loadFranceCompetencesCodes(): Promise<Record<string, string>> {

    const siglesRef = collection(this.firestore, 'sigles');

    const trades = await firstValueFrom(
      collectionData(siglesRef, { idField: 'id' }).pipe(take(1))
    );

    const map: Record<string, string> = {};

    trades.forEach((trade: any) => {

      const code = this.extractFranceCompetencesCode(
        trade.rncp
      );

      if (trade.id && code) {
        map[trade.id] = code;
      }

    });

    return map;
  }



}
