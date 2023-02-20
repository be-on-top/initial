import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { QuestionsService } from '../../questions.service';


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
  optScoring1:boolean = false;
  comment1: string = "";
  mediaOption2: any;
  option2: string = "";
  optScoring2:boolean = false;
  comment2: string = "";
  mediaOption3: any;
  optScoring3:boolean = false;
  option3: string = "";
  comment3: string = "";
  mediaOption4: any;
  optScoring4:boolean = false;
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

  totalMediasFiles: number = 0
  arrayFilesToUpload: any = []

  ngOnInit(): void {
  }


  async submitForm(form: NgForm) {
    console.log(form.value);
    this.service.createQuestion(form.value, this.arrayFilesToUpload);

  }

  detectFiles(event: any, fieldName: any) {
    this.totalMediasFiles++;
    this.arrayFilesToUpload.push([event.target.files[0], fieldName.name])
    console.log("this.arrayFilesToUpload", this.arrayFilesToUpload);

    // this.onUploadFile(event.target.files[0], fieldName.name);
  }


}








