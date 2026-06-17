import { Injectable } from '@angular/core';
import { doc, docData, Firestore, setDoc, updateDoc } from '@angular/fire/firestore';
import { FormGroup, NgForm } from '@angular/forms';
import { logEvent } from 'firebase/analytics';

@Injectable({
  providedIn: 'root'
})
export class WorkbookService {

  constructor(private firestore: Firestore) { }

  saveUnit(
    uid: string,
    unitId: string,
    exId: string,
    form: FormGroup,
    score: number,
    category: string
  ) {

    const data = {
      answers: form.value,
      score,
      category,
      createdAt: new Date()
    };

    const ref = doc(
      this.firestore,
      `workbook/${uid}/units/${unitId}/exercises/${exId}`
    );

    console.log("UID:", uid);
    console.log("unitId:", unitId);
    console.log("exId:", exId);

    console.log("data", data);


    return setDoc(ref, data);
  }



  saveUnitFlat(
    uid: string,
    unitId: string,
    exId: string,
    form: FormGroup,
    score: number | null,
    category: string
  ) {

    const data = {
      answers: form.value,
      score,
      category,
      createdAt: new Date(),
      submitted: true
    };

    const ref = doc(this.firestore, `workbook/${uid}`);

    return setDoc(
      ref,
      {
        [`units.${unitId}.${exId}`]: data
      },
      { merge: true }
    );
  }

  getUnit(uid: string) {
    const ref = doc(this.firestore, `workbook/${uid}`);
    return docData(ref);
  }

  updateUnitComment(uid: string, unitId: string, texte: string) {
    const ref = doc(this.firestore, `workbook/${uid}`);

    // Écriture chirurgicale dans le document flat du workbook
    return setDoc(
      ref,
      {
        [`units.${unitId}.commentReferent`]: texte
      },
      { merge: true }
    );
  }


  // saveUnitResult(
  //   uid: string,
  //   unitId: string,
  //   aggregateState: Record<string, number> = {}
  // ) {

  //   // 📍 Référence du document utilisateur (racine du workbook)
  //   const ref = doc(this.firestore, `workbook/${uid}`);

  //   return setDoc(
  //     ref,
  //     {
  //       // 🧠 Écriture ciblée dans :
  //       // units → unitId → result
  //       // 👉 n’écrase PAS les exercices existants grâce au chemin précis
  //       [`units.${unitId}.result`]: aggregateState
  //     },
  //     {
  //       // 🔀 Merge = fusion avec les données existantes
  //       // 👉 évite de remplacer tout le document
  //       merge: true
  //     }
  //   );
  // }


  // fonctionnement impeccable OK
  async saveUnitResult(
    uid: string,
    unitId: string,
    aggregateState: Record<string, number> = {}
  ) {

    // 1️⃣ Enregistrement classique dans la collection workbook
    const workbookRef = doc(this.firestore, `workbook/${uid}`);
    const saveWorkbookPromise = setDoc(
      workbookRef,
      { [`units.${unitId}.result`]: aggregateState },
      { merge: true }
    );

    // 2️⃣ Dénormalisation : Enregistrement du flag dans le document de l'étudiant
    const studentRef = doc(this.firestore, `students/${uid}`);

    // 👉 CHOIX DE LA STRATÉGIE (Décommenter selon ce que je préfère pour la semaine prochaine) :

    // 💡 OPTION A : Flags dynamiques par unité (hasWorkbookUnit1, hasWorkbookUnit2...)
    const studentData = {
      [`hasWorkbook${unitId}`]: true
    };

    /* 💡 OPTION B : Flag global unique (hasWorkbookUnit)
    const studentData = {
      hasWorkbookUnit: true
    };
    */

    // On utilise updateDoc pour ne SURTOUT PAS écraser la fiche de l'étudiant, 
    // juste y ajouter/mettre à jour notre variable.
    const saveStudentPromise = updateDoc(studentRef, studentData);

    // On attend que les deux écritures en base soient terminées
    return Promise.all([saveWorkbookPromise, saveStudentPromise]);
  }

  // pour enregistrer uniquement dans workbook les ajustements demandés par le référent/correcteur
  saveUnitResultUpdate(
    uid: string,
    unitId: string,
    aggregateState: Record<string, number | null> = {}
  ) {
    const ref = doc(this.firestore, `workbook/${uid}`);

    // Écriture chirurgicale dans le tiroir .result avec fusion
    return setDoc(
      ref,
      { [`units.${unitId}.result`]: aggregateState },
      { merge: true }
    );
  }



  // async finalizeUnit(
  //   uid: string,
  //   unitId: string,
  //   aggregateState: Record<string, number | null>,
  //   finalScore: number
  // ) {
  //   // 1. Écriture dans le workbook avec le flag de clôture
  //   const workbookRef = doc(this.firestore, `workbook/${uid}`);
  //   const saveWorkbook = setDoc(
  //     workbookRef,
  //     { [`units.${unitId}.result`]: { ...aggregateState, isFinal: true } },
  //     { merge: true }
  //   );

  //   // 2. Dénormalisation dans le dossier étudiant (note finale)
  //   const studentRef = doc(this.firestore, `students/${uid}`);
  //   const saveStudent = updateDoc(studentRef, {
  //     [`units.${unitId}.finalScore`]: finalScore
  //   });

  //   return Promise.all([saveWorkbook, saveStudent]);
  // }

//   async finalizeUnit(
//   uid: string,
//   unitId: string,
//   aggregateState: Record<string, number | null>,
//   noteSur20: number // On reçoit directement la valeur prête à l'emploi
// ) {
//   // 1. Écriture dans le workbook avec le flag
//   const workbookRef = doc(this.firestore, `workbook/${uid}`);
//   const saveWorkbook = setDoc(
//     workbookRef,
//     { [`units.${unitId}.result`]: { ...aggregateState, isFinal: true } },
//     { merge: true }
//   );

//   // 2. Dénormalisation de la valeur finale (la note sur 20) dans le dossier étudiant
//   // C'est cette valeur qui sera affichée partout, sans calcul supplémentaire
//   const studentRef = doc(this.firestore, `students/${uid}`);
//   const saveStudent = updateDoc(studentRef, {
//     [`units.${unitId}.finalGrade`]: noteSur20 // On utilise un nom explicite
//   });

//   return Promise.all([saveWorkbook, saveStudent]);
// }

// fontionnement impeccable ok !!!!
// async finalizeUnit(
//   uid: string,
//   unitId: string,
//   aggregateState: Record<string, number | null>,
//   noteSur20: number,
//   label: string // <-- On ajoute le label ici
// ) {
//   // 1. Écriture dans le workbook
//   const workbookRef = doc(this.firestore, `workbook/${uid}`);
//   const saveWorkbook = setDoc(
//     workbookRef,
//     { [`units.${unitId}.result`]: { ...aggregateState, isFinal: true } },
//     { merge: true }
//   );

//   // 2. Dénormalisation avec le label inclus
//   const studentRef = doc(this.firestore, `students/${uid}`);
//   const saveStudent = updateDoc(studentRef, {
//     [`units.${unitId}.finalGrade`]: noteSur20,
//     [`units.${unitId}.label`]: label // <-- On stocke le label pour l'affichage futur
//   });

//   return Promise.all([saveWorkbook, saveStudent]);
// }

async finalizeUnit(
    uid: string,
    unitId: string,
    aggregateState: Record<string, number | null>,
    noteSur20: number,
    label: string,
    texteFinal: string // <-- On ajoute le texte du commentaire ici
  ) {
    // 1. Écriture dans le workbook avec le flag final ET le commentaire
    const workbookRef = doc(this.firestore, `workbook/${uid}`);
    const saveWorkbook = setDoc(
      workbookRef,
      { 
        [`units.${unitId}.result`]: { ...aggregateState, isFinal: true },
        [`units.${unitId}.commentReferent`]: texteFinal // Sauvegarde finale dans workbook
      },
      { merge: true }
    );

    // 2. Dénormalisation complète dans la fiche de l'étudiant (pour tes futurs tableaux de bord)
    const studentRef = doc(this.firestore, `students/${uid}`);
    const saveStudent = updateDoc(studentRef, {
      [`units.${unitId}.finalGrade`]: noteSur20,
      [`units.${unitId}.label`]: label,
      [`units.${unitId}.commentReferent`]: texteFinal // Dé-normalisation pour lecture rapide
    });

    return Promise.all([saveWorkbook, saveStudent]);
  }


}
