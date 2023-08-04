import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { SettingsService } from '../../settings.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Trade } from '../../trade';

// import { Denominator } from 'src/app/quizz/denominator';
import { CPData } from '../CPData';

@Component({
  selector: 'app-update-trades',
  templateUrl: './update-trades.component.html',
  styleUrls: ['./update-trades.component.css']
})
export class UpdateTradesComponent {

  cpDataList: CPData[] = []

  sigleId: string = ""
  trade: any

  sigles: Trade = { sigle: "", denomination: "", competences: [], totalCP: 0, durations: {}, costs: {} }
  form: any
  total: any = []
  minValue: number = 0; // Valeur minimale pour toute nouvelle compétence
  newTotal: any = []

  cursors: any = {}
  CPNumber: any
  CPDuration: any

  durations: {} = {}
  newCPDurations: number[] = []

  competencesCostByHours: any = []

  // variables à passer à feedbackMessages component pour retours de firebase sur la soumission
  feedbackMessages?: any = ""
  isSuccessMessage: boolean = true
  // essai pour personnaliser les messages
  // https://firebase.google.com/docs/auth/admin/errors?hl=fr
  firebaseErrors: any = {
    // chercher !!!!!!!F
  }; // list of firebase error codes to alternate error messages


  constructor(private service: SettingsService, private ac: ActivatedRoute, private router: Router) {

  }


  ngOnInit(): void {
    // this.form = document.getElementById("settingsForm")

    this.sigleId = this.ac.snapshot.params["id"];
    // on fait appel à getSigle pour récupérer les entrées de l'existant. méthode qui pour memo renvoie un observable
    this.service.getSigle(this.sigleId).subscribe((data) => {
      console.log("data depuis update-evaluator component", data);
      this.trade = data
      this.total = data.competences
      // this.minValue=data.competences.length
      console.log(this.total.length);
      console.log('data.durations depuis le contructeur', data.durations)

    })

  }


  updateSigles(form: NgForm) {
    this.durations = []; // Réinitialise le tableau avant d'ajouter les durées
    this.sigles = { sigle: form.value.sigle, denomination: form.value.denomination, totalCP: form.value.totalCP, competences: [], durations: {}, costs: {} }
    // si on souhaite un objet, comme ceux écrits initialement en dur exemple : competences:{CP1:"", CP2:""}
    // this.sigles = { sigle: form.value.sigle, denomination: form.value.denomination, totalCP: form.value.totalCP, competences: {} }

    // si compétences additionnelles

    for (let i = 1; i <= form.value.totalCP; i++) {
      this.CPNumber = `CP${i}`
      console.log(this.CPNumber);
      this.sigles.competences.push(form.value[this.CPNumber])
      console.log('this.sigles.competences', this.sigles.competences);

      // il ne faut aucune  référence à this ici, pour que les 3 niveaux de durée propres à une compétence ne se cumulent pas

      let competenceDurations: number[] = []
      // compétences additionnelles
      let newCompetenceDurations: number[] = []

      console.log(form.value[`level1_CP${i}`]);
      console.log(form.value[`level2_CP${i}`]);
      console.log(form.value[`level3_CP${i}`]);


      competenceDurations.push(form.value[`level1_CP${i}`], form.value[`level2_CP${i}`], form.value[`level3_CP${i}`])
      // compétences additionnelles 
      newCompetenceDurations.push(form.value[`level1_CP${i}`], form.value[`level2_CP${i}`], form.value[`level3_CP${i}`])
      // impeccable !!!! mais on va changer la dénomination...
      this.sigles.durations[`${this.sigles.sigle}_duration_CP${i}`] = competenceDurations;
      console.log('this.sigles.durations', this.durations);

      this.sigles.costs[`cost_CP${i}`] = form.value[`cost_CP${i}`]
      console.log('this.sigles.costs', this.sigles.costs);

    }

    for (let i = 0; i < form.value.totalNewCP; i++) {
      this.CPNumber = `CP${i + this.minValue}`
      console.log(this.CPNumber);
      this.sigles.competences.push(form.value[this.CPNumber])
      console.log('this.sigles.competences avec les nouvelles', this.sigles.competences);

      console.log(form.value[`level1_CP${i + this.minValue}`]);
      console.log(form.value[`level2_CP${i + this.minValue}`]);
      console.log(form.value[`level3_CP${i + this.minValue}`]);


      // compétences additionnelles 
      // newCompetenceDurations.push(form.value[`level1_CP${i+this.minValue}`], form.value[`level2_CP${i+this.minValue}`], form.value[`level3_CP${i+this.minValue}`])
      this.newCPDurations.push(form.value[`level1_CP${i + this.minValue}`], form.value[`level2_CP${i + this.minValue}`], form.value[`level3_CP${i + this.minValue}`])
      // impeccable !!!! mais on va changer la dénomination...
      this.sigles.durations[`${this.sigles.sigle}_duration_CP${i + this.minValue}`] = this.newCPDurations
      console.log('this.sigles.durations avec les nouvelles', this.sigles.durations);

      this.sigles.costs[`cost_CP${i + this.minValue}`] = form.value[`cost_CP${i + this.minValue}`]
      console.log('this.sigles.costs pour les nouvelles', this.sigles.costs);

    }


    console.log("form récupéré", form.value)

    // et parce que pour l'update, faut ajouter à totalCP totalNewCP
    let totalToRegister: number = this.sigles.totalCP + form.value.totalNewCP
    console.log('totalCP augmenté des nouvelles', totalToRegister)
    console.log("form optimisé", this.sigles)
    this.service.updateTrade(this.sigles, totalToRegister)
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
  }

  getNewTotal(e: any) {
    this.newTotal.push(e.value) //3
    alert(`this.newTotal ${this.newTotal}`)
    // this.total.push(e.value)//5
    alert(`this.total.length ${this.total.length}`)
    this.minValue = this.total.length + 1
    alert(`this.minValue ${this.minValue}`)
    const troisiemeTableau = [...this.total, ...this.newTotal]
    console.log('troisiemeTableau', troisiemeTableau);

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
