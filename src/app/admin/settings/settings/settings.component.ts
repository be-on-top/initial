import { Component, Input, OnInit } from '@angular/core';
import { Trade } from '../../trade';
import { NgForm, NgModel } from '@angular/forms';
import { SettingsService } from '../../settings.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  sigles: Trade = { sigle: "", denomination: "", competences: [], totalCP: 0 }
  form: any
  total: any = []

  CPNumber: any

  // variables à passer à feedbackMessages component pour retours de firebase sur la soumission
  feedbackMessages?: any = ""
  isSuccessMessage: boolean = true
  // essai pour personnaliser les messages
  // https://firebase.google.com/docs/auth/admin/errors?hl=fr
  firebaseErrors: any = {
    // chercher !!!!!!!F
  }; // list of firebase error codes to alternate error messages


  //  dans un premier temps, on peut ne leur donner qu'un nom. l'important étant de savoir à combien les catégories métiers s'élèveront pour pouvoir  prévoir
  // 1 - autant de zones éditables sur la  page d'accueil
  // 2 - rattacher le décompte des questions à une catégorie et non un tronc commun

  constructor(private service: SettingsService, private router:Router) {

  }


  ngOnInit(): void {
    this.form = document.getElementById("settingsForm")
  }


  addSettings(form: NgForm) {
    this.sigles = { sigle: form.value.sigle, denomination: form.value.denomination, totalCP: form.value.totalCP, competences: [] }
    for (let i = 1; i <= form.value.totalCP; i++) {
      this.CPNumber = `CP${i}`
      console.log(this.CPNumber);
      this.sigles.competences.push(form.value[this.CPNumber])
    }

    console.log("form récupéré", form.value);
    console.log("form optimisé", this.sigles);
    this.service.addTrade(this.sigles)
    .then(() => {
      // Signed in 
      this.feedbackMessages = `Enregistrement OK`;
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


  addField(ref: string) {
    let fiedl = document.createElement("input")
    fiedl.setAttribute("type", "text")
    fiedl.setAttribute("class", "form-control")
    fiedl.setAttribute("name", ref)
    let form: any = window.document.getElementById("settingsForm")
    form.appendChild(fiedl)
  }


  getTotal(e: any) {
    console.log(e.value)
    this.total.push(e.value)
    // ce qui suit fonctionne si on fait abstraction du fait que ngForm transforme HTMLElement en object.
    // donc même si les champs s'affichent, ils ne sont pas reconnus pour autant comme les propriétés/valeurs de l'objet settingsForm
    //  let cpField=`<input id="dfsdf" type="text" name="CP${e.value}" placeholder="CP${e.value} à renseigner" ngModel class="form-control my-1" required minlength="3">`
    //  let fiedl= document.createElement("div")
    //  let formButton:any = document.querySelector("#settingsForm")
    //  fiedl.innerHTML+=cpField
    // formButton.insertAdjacentElement('beforebegin',fiedl)
  }


}
