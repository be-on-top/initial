import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { SettingsService } from '../../settings.service';
import { Router } from '@angular/router';

// import { Denominator } from 'src/app/quizz/denominator';
import { CPData } from '../CPData';

@Component({
  selector: 'app-update-settings',
  templateUrl: './update-settings.component.html',
  styleUrls: ['./update-settings.component.css']
})
export class UpdateSettingsComponent {


  form: any
  total: any = []

  cursors: any = []
  firstCursor: number = 0
  secondCursor: number = 0

  // variables à passer à feedbackMessages component pour retours de firebase sur la soumission
  feedbackMessages?: any = ""
  isSuccessMessage: boolean = true
  // essai pour personnaliser les messages
  // https://firebase.google.com/docs/auth/admin/errors?hl=fr
  firebaseErrors: any = {
    // chercher !!!!!!!F
  }; // list of firebase error codes to alternate error messages


  constructor(private service: SettingsService, private router: Router) {


  }


  ngOnInit(): void {

    this.service.getLevelsCursors().subscribe(data => {
      console.log("data de getLevelsCursors()", data)
      this.cursors = data
      console.log(this.cursors.firstCursor)
      console.log(this.cursors.secondCursor)
    })

  }


  updateLevelCursors(form: NgForm) {

    this.cursors = { firstCursor: form.value.firstCursor, secondCursor: form.value.secondCursor }
    this.service.addLevelCursors(this.cursors)
      .then(() => {
        // Signed in 
        this.feedbackMessages = `Enregistrement des curseurs OK`;
        this.isSuccessMessage = true
        setTimeout(() => {
          form.reset()
          // this.router.navigate([''])
        }, 1000)
      })
      .catch((error) => {
        this.feedbackMessages = error.message;
        // this.feedbackMessages = this.firebaseErrors[error.code];
        this.isSuccessMessage = false;
        console.log(this.feedbackMessages);

        // ..};
      })

  }

}
