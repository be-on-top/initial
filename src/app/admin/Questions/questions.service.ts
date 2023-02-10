import { Injectable } from '@angular/core';
import { Storage, ref, uploadBytes, getDownloadURL, getStorage, uploadBytesResumable, getMetadata, listAll } from '@angular/fire/storage';
import { Observable } from 'rxjs';




@Injectable({
  providedIn: 'root'
})
export class QuestionsService {
  // public file: any = {};


  // Create the file metadata
  /** @type {any} */
  metadata = {
    contentType: 'image/jpeg'
  };


  image: any;

  constructor(private storage: Storage) {



  }



  // uploadFiles(file: any) {
  //   // nouvelle syntaxe ok 
  //   let storageRef = ref(this.storage, file );
  //   uploadBytes(storageRef, file).then((snapshot) => {
  //     console.log('Uploaded file!');
  //   });
  // }


  uploadFiles(file: any) {

    // Upload file and metadata to the object 'images/mountains.jpg'
    let storageRef = ref(this.storage, 'images/' + file.name);
    let uploadTask = uploadBytesResumable(storageRef, file, this.metadata);

    // Listen for state changes, errors, and completion of the upload.
    uploadTask.on('state_changed',
      (snapshot) => {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        switch (snapshot.state) {
          case 'paused':
            console.log('Upload is paused');
            break;
          case 'running':
            console.log('Upload is running');
            break;
        }
      },
      (error) => {
        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        switch (error.code) {
          case 'storage/unauthorized':
            // User doesn't have permission to access the object
            break;
          case 'storage/canceled':
            // User canceled the upload
            break;

          // ...

          case 'storage/unknown':
            // Unknown error occurred, inspect error.serverResponse
            break;
        }
      },
      () => {
        // Upload completed successfully, now we can get the download URL
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          console.log('File available at', downloadURL);
        });
      }
    );


  }



  getImages() {
    // Create a reference under which you want to list 
    // Créée une référencce pour le dossier qu'on soubaite scanner

    let listRef = ref(this.storage, 'images');
    // let questions: any = []

    // Find all the prefixes and items.
    let questions=listAll(listRef)
      .then((res) => {
        res.prefixes.forEach((folderRef) => {
          // All the prefixes under listRef.
          // You may call listAll() recursively on them.
          console.log(folderRef);

        });
        res.items.forEach((itemRef) => {
          // All the items under listRef.
          console.log("image", itemRef);
          // questions.push(itemRef.fullPath)
          // console.log(questions);


        });

      }).catch((error) => {
        // Uh-oh, an error occurred!
      });

      return questions




  }





}






