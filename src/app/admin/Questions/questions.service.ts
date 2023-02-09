import { Injectable } from '@angular/core';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';




@Injectable({
  providedIn: 'root'
})
export class QuestionsService {
  public file: any = {};

  constructor(private storage: Storage) { }

  uploadFiles(file: any) {
    let mediaQuestion = ref(this.storage, file);
    uploadBytes(mediaQuestion, file).then((snapshot) => {
      console.log('Uploaded file!');
    });

  }


}
