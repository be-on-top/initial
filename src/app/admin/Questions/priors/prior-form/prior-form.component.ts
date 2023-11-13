import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { EvaluatorsService } from 'src/app/admin/evaluators.service';
import { QuestionsService } from 'src/app/admin/questions.service';
import { SettingsService } from 'src/app/admin/settings.service';
import { AuthGuardService } from 'src/app/auth-guard.service';

@Component({
  selector: 'app-prior-form',
  // templateUrl: './prior-form.component.html',
  templateUrl: './../../add-form.component.html',
  // styleUrls: ['./prior-form.component.css']
  styleUrls: ['./../../add-form.component.css']
})

export class PriorFormComponent implements OnInit {
  title: string = "questions d'accroche"

  //  pour les données liées à l'évaluateur authentifié
  authId?: any;
  userData: any = {};
  question: string = "";
  number: number = 0;
  mediaQuestion: any;
  // videoDuration:any = 0;
  // pour savoir si au minimum une image a été rattachée à une réponse
  isOneMediaOption: boolean = false
  mediaOption1: any;
  option1: string = "";
  optScoring1: boolean = false;
  comment1: string = "";
  mediaOption2: any;
  option2: string = "";
  optScoring2: boolean = false;
  comment2: string = "";
  mediaOption3: any;
  // optScoring3: boolean = false;
  // pour que rien ne soit enregistré si pas cochée
  optScoring3: boolean | null = null;
  option3: string = "";
  comment3: string = "";
  mediaOption4: any;
  // optScoring4: boolean = false;
  // pour que rien ne soit enregistré si pas cochée
  optScoring4: boolean | null = null;
  option4: string = "";
  comment4: string = "";
  mediaOption5: any;
  option5: string = "";
  comment5: string = "";
  // Create a root reference

  numbers: number[] = []
  registryNumbers: any[] = []
  // isRegistered:boolean = false
  selectedSigle: string = ""

  // essai pour connecter le tableau des sigles aux documents de la collection sigles destinée aux paramétrages métier
  sigleIds: string[] = []
  relatedCompetences: any = []
  // pour ajouter un cas bloquant
  forbidden: boolean = false

  constructor(private service: QuestionsService, private router: Router, private settingsService: SettingsService, private evaluatorService: EvaluatorsService, private authService: AuthGuardService) { }

  fileIsUploading = false;
  fileUrl!: string;
  fileUploaded = false;

  // totalMediasFiles: number = 0
  arrayFilesToUpload: any = []

  notations: number[] = [1, 2, 3]

  ngOnInit(): void {

    // if (this.authService.user) {
      this.authId = this.authService.user
      // alert(this.authId)
      this.evaluatorService.getEvaluator(this.authService.user).subscribe(data => {
        this.userData = data
        console.log(data)
        this.getRelatedCompetences()
      })
      console.log('new this.userData.sigle', this.userData);
    // }

    // else {
    //   alert('user is signed out !!!')
    // }

  }

  // async submitForm(form: NgForm) {
  //   if (form.value.optScoring3 === null) {
  //     form.value.optScoring1 === form.value.optScoring2 ? this.forbidden = true : this.forbidden = false
  //     delete form.value.optScoring3;
  //   }

  //   if (form.value.optScoring4 === null) {
  //     form.value.optScoring1 === form.value.optScoring2 ? this.forbidden = true : this.forbidden = false
  //     delete form.value.optScoring4;
  //   }

  //   if (this.forbidden !== true) {

  //     console.log(form.value);
  //     this.service.createQuestion(form.value, this.arrayFilesToUpload);
  //     form.reset();
  //     // this.router.navigate(['/admin/questions'])

  //   } else {
  //     alert('les 2 options ne peuvent être vraies, il faut choisir')
  //   }
  // }

  // detectFiles(event: any, fieldName: any) {
  //   console.log(event.target.files[0].size);
  //   console.log('fieldName.name', fieldName.name);

  //   // Vérifie la taille du fichier et le type avant de l'ajouter
  //   if (event.target.files[0].size <= 4000000) {
  //     // Vérifiez si le fichier avec le même nom existe déjà dans arrayFilesToUpload
  //     const existingFileIndex = this.arrayFilesToUpload.findIndex((item: any) => item[1] === fieldName.name);

  //     if (existingFileIndex !== -1) {
  //       // Si le fichier existe déjà, le supprime
  //       this.arrayFilesToUpload.splice(existingFileIndex, 1);
  //       alert('Changement d\'image détecté. Ancien fichier supprimé.');
  //     }

  //     // Ajoute le nouveau fichier à arrayFilesToUpload
  //     this.arrayFilesToUpload.push([event.target.files[0], fieldName.name, event.target.files[0].type]);
  //     console.log("this.arrayFilesToUpload !!!!", this.arrayFilesToUpload);
  //   } else {
  //     // Fichier trop volumineux, affiche une alerte
  //     alert("Le fichier est trop volumineux (limite : 4 Mo) !");
  //   }
  // }

  // // ne servira plus si on parvient à mettre à jour this.registryNumbers à chaque nouvel enregistrement. *
  // checkIfRegistered(n: any) {
  //   console.log(n)
  //   // this.registryNumbers.includes(n)?this.isRegistered==true:this.isRegistered==false)
  // }

  // checkIfSelected(sigle: any) {
  //   console.log(sigle);
  //   this.selectedSigle = sigle
  //   this.numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]

  //   // c'est l'endroit pour transvaser le getQuestion() avec comme filtre préalable et additionnel : sigle.value

  //   this.service.getQuestions().subscribe(data => {

  //     const dataFiltered = data.filter(redutedData => {
  //       return redutedData.sigle == this.selectedSigle
  //     });

  //     console.log("datafiltered", dataFiltered);

  //     for (let n of dataFiltered) {
  //       console.log("n", n.number);
  //       this.numbers = this.numbers.filter(element => element != n.number)
  //     }

  //   })
  // }

  // resetFileInput(fieldName: string, form: NgForm) {
  //   // Réinitialise la valeur du champ de fichier dans le formulaire
  //   form.controls[fieldName].setValue('');
  //   // Supprime le fichier de arrayFilesToUpload (si nécessaire)
  //   const fileIndex = this.arrayFilesToUpload.findIndex((item: any) => item[1] === fieldName)
  //   if (fileIndex !== -1) {
  //     this.arrayFilesToUpload.splice(fileIndex, 1)
  //   }
  // }

  // async getRelatedCompetences() {
  //   // on peut boucler sur le tableau userData.sigles, récupérer chaque sigle et retourner les CP concernées dans la collection sigles
  //   for (const iterator of this.userData.sigle) {
  //     // let additionalCompetences:any
  //     this.settingsService.getSigle(iterator).subscribe((data): any => {
  //       // console.log('data.competences', data.competences)
  //       for (const key in data.competences) {
  //         // console.log('data.competences[key]', data.competences[key]);
  //         let additionalKeySigle: string = 'competences_' + iterator
  //         let additionalKey: string = key
  //         let additionalCP: any = data.competences[key]

  //         this.relatedCompetences[additionalKeySigle] = { ...this.relatedCompetences['competences_' + iterator], ['CP' + additionalKey]: additionalCP }
  //         console.log('relatedCompetences !!!!!!', this.relatedCompetences)
  //       }
  //     })

  //   }
  //   console.log('relatedCompetences en dehors de la boucle', this.relatedCompetences)
  //   // return this.relatedCompetences
  // }


  // copie depuis fullForm

  async submitForm(form: NgForm) {
    if (form.value.optScoring3 === null) {
      form.value.optScoring1 === form.value.optScoring2 ? this.forbidden = true : this.forbidden = false
      delete form.value.optScoring3;
    }

    if (form.value.optScoring4 === null) {
      form.value.optScoring1 === form.value.optScoring2 ? this.forbidden = true : this.forbidden = false
      delete form.value.optScoring4;
    }

    if (form.value.option4 && !form.value.option3) {
      this.forbidden = true;
      alert('Vous ne pouvez pas enregistrer une réponse 4 sans avoir renseigné correctement la réponse 3');
    }

    if (this.forbidden !== true) {
      // console.log(form.value);
      this.service.createQuestion(form.value, this.arrayFilesToUpload);
      // form.reset ne sert que si on continue la saisie, c'est ce qu'on va finalement faire.
      form.reset();
      // this.router.navigate(['/admin/fullList'])
    } else {
      alert('les 2 options ne peuvent être vraies, il faut choisir')
    }
  }

  // marche bien, mais l'ordre des conditions n'est pas cohérent pour bloquer les images dont le poids est excessif
  // detectFiles(event: any, fieldName: any) {
  //   console.log(event.target.files[0].size);
  //   console.log('fieldName.name', fieldName.name);

  //   // Vérifie d'abord si un fichier avec le même fieldName.name existe déjà
  //   const existingFileIndex = this.arrayFilesToUpload.findIndex((fileData: any) => fileData[1] === fieldName.name);

  //   if (existingFileIndex !== -1) {
  //     alert('Changement d\'image détecté');
  //     // Remplace le fichier existant par le nouveau fichier
  //     this.arrayFilesToUpload[existingFileIndex] = [event.target.files[0], fieldName.name, event.target.files[0].type];
  //   } else {
  //     // Ajoute le nouveau fichier s'il n'existe pas déjà
  //     this.arrayFilesToUpload.push([event.target.files[0], fieldName.name, event.target.files[0].type]);
  //     console.log("this.arrayFilesToUpload !!!!", this.arrayFilesToUpload);

  //     if (event.target.files[0].size > 13000000) {
  //       alert("File is too big!")
  //     }
  //   }

  //   // Reste du code pour ajouter ou mettre à jour d'autres fichiers
  // }

  detectFiles(event: any, fieldName: any) {
    console.log(event.target.files[0].size);
    console.log('fieldName.name', fieldName.name);

    // Vérifie la taille du fichier et le type avant de l'ajouter
    if (event.target.files[0].size <= 5000000) {
      // Vérifie si le fichier avec le même nom existe déjà dans arrayFilesToUpload
      const existingFileIndex = this.arrayFilesToUpload.findIndex((item: any) => item[1] === fieldName.name);


      if (existingFileIndex !== -1) {
        // Si le fichier existe déjà, le supprime
        this.arrayFilesToUpload.splice(existingFileIndex, 1);
        alert('Changement d\'image détecté. Ancien fichier supprimé.');
      }

      // Ajoute le nouveau fichier à arrayFilesToUpload
      this.arrayFilesToUpload.push([event.target.files[0], fieldName.name, event.target.files[0].type]);
      console.log("this.arrayFilesToUpload !!!!", this.arrayFilesToUpload);

      // Si déjà un fichier mediaOption...
      const existingMediaOption = this.arrayFilesToUpload.findIndex((item: any) => item[1].includes("mediaOption"))
      existingMediaOption !== -1 ? this.isOneMediaOption = true : this.isOneMediaOption = false;
      alert(this.isOneMediaOption)

    } else {
      // Fichier trop volumineux, affiche une alerte
      alert("Le fichier est trop volumineux (limite : 5 Mo) !");
    }
  }

  resetFileInput(fieldName: string, form: NgForm) {
    // Réinitialise la valeur du champ de fichier dans le formulaire
    form.controls[fieldName].setValue('');
    // Supprime le fichier de arrayFilesToUpload (si nécessaire)
    const fileIndex = this.arrayFilesToUpload.findIndex((item: any) => item[1] === fieldName)
    if (fileIndex !== -1) {
      this.arrayFilesToUpload.splice(fileIndex, 1)
    }
  }


  checkIfSelected(sigle: any) {
    console.log(sigle);
    this.selectedSigle = sigle

    // Attention : à chaque changement de selected, on doit tout réinitialiser : 
    for (let i = 0; i < 21; i++) { this.numbers.push(i) }
    this.registryNumbers = []
    // fin réinitialisation !!!!! 


    // c'est l'endroit pour transvaser le getQuestion() avec comme filtre  préalable et additionnel : sigle.value
    this.service.getQuestions().subscribe(data => {
      const dataFiltered = data.filter(reducedData => {
        return reducedData.sigle == this.selectedSigle
      });

      console.log("datafiltered!!!!!!!!", dataFiltered);
      // attention : c'est la différence avec prior-form, on ne veut pas afficher les 20 premières questions dans le dénombre
      for (let n of dataFiltered) {
        // console.log("n.number", n.number);
        this.registryNumbers.push(n.number)
        // console.log("registryNumber", this.registryNumbers);
        this.numbers = this.numbers.filter(element => element != n.number)
        // console.log("result", this.numbers);
      }

    })
  }


  // top !!!
  // async getDocsByParam(uid: string) {
  //   const myData = query(collection(this.firestore, 'evaluators'), where('id', '==', uid));
  //   const querySnapshot = await getDocs(myData);
  //   querySnapshot.forEach((doc) => {
  //     console.log(doc.id, ' => ', doc.data());
  //     this.userData = doc.data()
  //     console.log("this.userData.sigle !!!!!", this.userData.sigle)

  //     this.getRelatedCompetences()


  //   })

  // }

  async getRelatedCompetences() {
    // on peut boucler sur le tableau userData.sigles, récupérer chaque sigle et retourner les CP concernées dans la collection sigles
    for (const iterator of this.userData.sigle) {
      // let additionalCompetences:any
      this.settingsService.getSigle(iterator).subscribe((data): any => {
        // console.log('data.competences', data.competences)
        for (const key in data.competences) {
          // console.log('data.competences[key]', data.competences[key]);
          let additionalKeySigle: string = 'competences_' + iterator
          let additionalKey: string = key
          let additionalCP: any = data.competences[key]

          this.relatedCompetences[additionalKeySigle] = { ...this.relatedCompetences['competences_' + iterator], ['CP' + additionalKey]: additionalCP }
          console.log('relatedCompetences !!!!!!', this.relatedCompetences)
        }
      })

    }
    console.log('relatedCompetences en dehors de la boucle', this.relatedCompetences)
    // return this.relatedCompetences
  }



  // Utilisation de la fonction du service lorsque nécessaire
  fetchSigleIds() {
    this.settingsService.getSigleIds()
      .then((sigleIds) => {
        this.sigleIds = sigleIds
        console.log(sigleIds);
      })
      .catch((error) => {
        console.error('Erreur lors de la récupération des IDs de documents :', error);
      });
  }

  // convertRelatedCompetencesToArray() {
  //   return Object.keys(this.relatedCompetences).map(key => this.relatedCompetences[key]);
  // }


  filterRelatedCompetences(sigle: string) {
    return this.relatedCompetences.filter((comp: any) => comp['competences_' + sigle]);
  }

  convertRelatedCompetencesToArray(): any[] {
    const sigles = this.userData.sigle;
    const result: any[] = [];

    // Parcourez les sigles et ajoutez les compétences correspondantes au tableau résultat
    for (const sigle of sigles) {
      const competencesKey = 'competences_' + sigle;
      if (this.relatedCompetences.hasOwnProperty(competencesKey)) {
        const competences = this.relatedCompetences[competencesKey];
        for (const key in competences) {
          if (competences.hasOwnProperty(key)) {
            result.push({ sigle: sigle, competence: key, value: competences[key] });
          }
        }
      }
    }

    return result;
  }


  // fin copie depuis fullForm

  getKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }


  // Fonction pour naviguer vers la vue spécifiée avec les paramètres de requête
  navigateToVue() {
    // Récupére la valeur de userData.sigle ou utilise la valeur directement si elle est accessible  
    const sigle = this.userData.sigle

    // Naviguer vers la vue '/admin/questions' avec le paramètre de requête sigleIds  
    this.router.navigate(['/admin/questions'], { queryParams: { sigleIds: sigle } })
  }

}








