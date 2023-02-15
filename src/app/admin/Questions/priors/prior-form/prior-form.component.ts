import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { QuestionsService } from '../../questions.service';
// import { getStorage, ref } from "firebase/storage";
// import { expand } from 'rxjs';



@Component({
  selector: 'app-prior-form',
  templateUrl: './prior-form.component.html',
  styleUrls: ['./prior-form.component.css']
})

export class PriorFormComponent implements OnInit {
  question: string = "";
  number: number = 0;
  mediaQuestion: any;
  mediaOption1: any;
  option1: string = "";
  comment1: string = "";
  mediaOption2: any;
  option2: string = "";
  comment2: string = "";
  mediaOption3: any;
  option3: string = "";
  comment3: string = "";
  mediaOption4: any;
  option4: string = "";
  comment4: string = "";
  mediaOption5: any;
  option5: string = "";
  comment5: string = "";
  // Create a root reference

  constructor(private service: QuestionsService) { }

  fileIsUploading = false;
  fileUrl!: string;
  fileUploaded = false;

  ngOnInit(): void {
  }


  submitForm(form: NgForm) {
    console.log(form.value);
    // let varPath='${form.value.mediaQuestion.name}'
    // this.service.uploadFiles(form.value.mediaQuestion)

    if (form.value.mediaQuestion) {
      let idMediaQuestion = `mediaQuestion${form.value.number}_${form.value.sigle}` 
      console.log("ddddddddddddddd", idMediaQuestion);    
    }
    if (form.value.mediaOption1) {
      let idMediaOption1 = `mediaOption1${form.value.number}_${form.value.sigle}` 
      console.log("ddddddddddddddd", idMediaOption1);    
    }
    if (form.value.mediaOption2) {
      let idMediaOption2 = `mediaOption2${form.value.number}_${form.value.sigle}` 
      console.log("ddddddddddddddd", idMediaOption2);    
    }
    if (form.value.mediaOption3) {
      let idMediaOption3 = `mediaOption3${form.value.number}_${form.value.sigle}` 
      console.log("ddddddddddddddd", idMediaOption3);    
    }
    if (form.value.mediaOption4) {
      let idMediaOption4 = `mediaOption4${form.value.number}_${form.value.sigle}` 
      console.log("ddddddddddddddd", idMediaOption4);    
    }

  }



  // méthode qui permettra de lier le  <input type="file">  (que vous créerez par la suite) à la méthode  onUploadFile()  :

  detectFiles(event: any, fieldName: any) {
    this.onUploadFile(event.target.files[0], fieldName.name);
  }

  // méthode qui déclenchera  uploadFile()  et qui en récupérera l'URL retourné :
  onUploadFile(file: File, fieldName: string) {
    // pour différencier le traitement des images selon qu'elles sont rattachées à une question ou une image on pourrait avoir :
    // fieldName!=="mediaQuestion"?  this.isMediaQuestion = false : this.isMediaQuestion=true;
    // ou se contenter de vérifier une fois le fichier image récupéré si oui ou non il comporte la string mediaQuestion
    this.fileIsUploading = true;

    this.service.uploadFiles(file, fieldName);

  }


}








