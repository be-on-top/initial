import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { SocialsService } from 'src/app/admin/socials.service';

@Component({
  selector: 'app-social-form',
  templateUrl: './social-form.component.html',
  styleUrls: ['./social-form.component.css']
})
export class SocialFormComponent {

  question: string = "";
  number: number = 0;
  mediaQuestion: any;
  // videoDuration:any = 0;
  mediaOption1: any;
  option1: string = "";
  optScoring1: boolean = false;
  comment1: string = "";
  mediaOption2: any;
  option2: string = "";
  optScoring2: boolean = false;
  comment2: string = "";
  mediaOption3: any;
  optScoring3: boolean = false;
  option3: string = "";
  comment3: string = "";
  mediaOption4: any;
  optScoring4: boolean = false;
  option4: string = "";
  comment4: string = "";
  mediaOption5: any;
  option5: string = "";
  comment5: string = "";
  // Essai décompte réponses
  maxNumberResponses:any[]=[1,2,3,4]

  numbers: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  // inactif pour le moment
  // registryNumbers: any[] = []
  
  selectedSigle:string=""

  constructor(private service: SocialsService, private router : Router) { }

  arrayFilesToUpload: any = []

  notations: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]

  
  detectFiles(event: any, fieldName: any) {
    console.log(event.target.files[0].size);
    this.arrayFilesToUpload.push([event.target.files[0], fieldName.name, event.target.files[0].type])
    console.log("this.arrayFilesToUpload", this.arrayFilesToUpload);
    if (event.target.files[0].size > 13000000) {
      alert("File is too big!")
    }
    // this.onUploadFile(event.target.files[0], fieldName.name);
  }

  async submitForm(form: NgForm) {
    console.log(form.value);
    this.service.createSocialQuestion(form.value, this.arrayFilesToUpload);
    form.reset();
    alert(`question enregistrée`)
  }


  checkIfRegistered(n: any) {
    console.log(n)
    // this.registryNumbers.includes(n)?this.isRegistered==true:this.isRegistered==false) 
  }

  checkIfSelected(sigle:any){
    console.log(sigle);
    this.selectedSigle=sigle
  }


}
