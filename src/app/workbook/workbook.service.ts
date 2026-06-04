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


  

}
