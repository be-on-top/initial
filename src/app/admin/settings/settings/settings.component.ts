import { Component, Input, OnInit } from '@angular/core';
import { Trade } from '../../trade';
import { NgForm, NgModel } from '@angular/forms';
import { SettingsService } from '../../settings.service';
import { Router } from '@angular/router';
import { Denominator } from 'src/app/quizz/denominator';



@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  sigles: Trade = { sigle: "", denomination: "", status: true, isQualifying:false, competences: [], totalCP: 0, durations: {}, costs: {} }
  form: any
  total: any = []

  cursors: any
  CPNumber: any
  CPDuration: any

  durations: {} = {}

  competencesCostByHours: any = []

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

  constructor(private service: SettingsService, private router: Router) {

  }


  ngOnInit(): void {
    this.form = document.getElementById("settingsForm")
  }


  addSigles(form: NgForm) {
    this.durations = []; // Réinitialise le tableau avant d'ajouter les durées
    this.sigles = { sigle: form.value.sigle, denomination: form.value.denomination, rncp:form.value.rncp, isQualifying:form.value.isQualifying, requirements:form.value.requirements, status:form.value.status, totalCP: form.value.totalCP, competences: [], durations: {}, costs: {}}
    // si on souhaite un objet, comme ceux écrits initialement en dur exemple : competences:{CP1:"", CP2:""}
    // this.sigles = { sigle: form.value.sigle, denomination: form.value.denomination, totalCP: form.value.totalCP, competences: {} }
    for (let i = 1; i <= form.value.totalCP; i++) {
      this.CPNumber = `CP${i}`
      console.log(this.CPNumber);
      this.sigles.competences.push(form.value[this.CPNumber])
      console.log('this.sigles.competences', this.sigles.competences);

      // il ne faut aucune  référence à this ici, pour que les 3 niveaux de durée propres à une compétence ne se cumulent pas

      let competenceDurations: number[] = []

      console.log(form.value[`level1_CP${i}`]);
      console.log(form.value[`level2_CP${i}`]);
      console.log(form.value[`level3_CP${i}`]);


      competenceDurations.push(form.value[`level1_CP${i}`], form.value[`level2_CP${i}`], form.value[`level3_CP${i}`])
      // impeccable !!!! mais on va changer la dénomination...
      // this.sigles.durations[`duration${i}`] = competenceDurations;
      this.sigles.durations[`${this.sigles.sigle}_duration_CP${i}`] = competenceDurations;
      console.log('this.sigles.durations', this.durations);

      // pour les taux horaires, à savoir ici qu'on aura 1 taux par compétence, indifféremment des durées
      // this.competencesCostByHours[`cost_CP${i}`]= form.value[`cost_CP${i}`]
      this.sigles.costs[`cost_CP${i}`]= form.value[`cost_CP${i}`]
      console.log('this.sigles.costs', this.sigles.costs);

    }

    console.log("form récupéré", form.value);
    console.log("form optimisé", this.sigles);
    this.service.addTrade(this.sigles)
      .then(() => {
        // Signed in 
        this.feedbackMessages = `Enregistrement du métier et ses compétences OK`;
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


  // addField(ref: string) {
  //   let fiedl = document.createElement("input")
  //   fiedl.setAttribute("type", "text")
  //   fiedl.setAttribute("class", "form-control")
  //   fiedl.setAttribute("name", ref)
  //   let form: any = window.document.getElementById("settingsForm")
  //   form.appendChild(fiedl)
  // }


  getTotal(e: any) {
    console.log(e.value)
    this.total.push(e.value)
    // ce qui suit fonctionne si on fait abstraction du fait que ngForm transforme HTMLElement en object.
    // donc même si les champs s'affichent, ils ne sont pas reconnus pour autant comme les propriétés/valeurs de l'objet settingsForm
    // let cpField=`<input id="dfsdf" type="text" name="CP${e.value}" placeholder="CP${e.value} à renseigner" ngModel class="form-control my-1" required minlength="3">`
    // let fiedl= document.createElement("div")
    // let formButton:any = document.querySelector("#settingsForm")
    // fiedl.innerHTML+=cpField
    // formButton.insertAdjacentElement('beforebegin',fiedl)
  }

  addLevelCursors(form: NgForm) {

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


  addMaxIndexQuestion(form: NgForm){
    
    this.service.addMaximums({maxIndexQuestion:form.value.maxIndexQuestion})
    .then(() => {
      // Signed in 
      this.feedbackMessages = `Enregistrement des maximums OK`;
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
