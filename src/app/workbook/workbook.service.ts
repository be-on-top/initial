import { Injectable } from '@angular/core';
import { doc, docData, Firestore, setDoc } from '@angular/fire/firestore';
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
      answer: form.value,
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
      answer: form.value,
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


}
