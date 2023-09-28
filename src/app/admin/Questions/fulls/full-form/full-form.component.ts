import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { EvaluatorsService } from 'src/app/admin/evaluators.service';
import { QuestionsService } from 'src/app/admin/questions.service';
// à externaliser dans la mesure du possible à l'avenir :
// import { Auth, onAuthStateChanged } from '@angular/fire/auth';
// import { query, Firestore, where, collection, getDocs } from '@angular/fire/firestore';
import { SettingsService } from 'src/app/admin/settings.service';
import { AuthGuardService } from 'src/app/auth-guard.service';

@Component({
  selector: 'app-full-form',
  templateUrl: './full-form.component.html',
  styleUrls: ['./full-form.component.css']
})

export class FullFormComponent implements OnInit {

  //  pour les données liées à l'évaluateur authentifié
  authId?: any;
  // attention : userData?:any cause erreur en console lorsque le composant est initialisé puisqu'il n'a pas encore eu le temps de récupérer userData
  userData: any = {};
  // obligée de récupérer l'uid de l'évaluateur pour connaitre ses affectations métier
  ui: any = ''
  user?: any;
  // essai pour connecter le tableau des sigles aux documents de la collection sigles destinée aux paramétrages métier
  sigleIds: string[] = []

  question: string | undefined = "";
  number: number = 0;
  mediaQuestion: any;
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

  numbers: number[] = []
  registryNumbers: any[] = []
  // isRegistered:boolean = false
  // competences_ite: any = {
  //   CP1: "Monter et démonter des échafaudages, fixes de pieds et roulants, et savoir les utiliser",
  //   CP2: "Réaliser des travaux de peinture film mince de classe D2 sur des ouvrages neufs ou à rénover, en qualité definition C",
  //   CP3: "Mettre en œuvre des revêtements de peinture épais et semi-épais de classe D3 sur des ouvrages neufs ou à rénover, en qualité de finition C",
  //   CP4: "Réaliser des travaux extérieurs de peinture sur des supports bois, thermoplastiques et métalliques, neufs ou à rénover, en qualité de finition B",
  //   CP5: "Mettre en œuvre des systèmes d'imperméabilité de classes I1 à I4",
  //   CP6: "Réaliser l'étanchéité de supports horizontaux de type balcon ou similaire",
  //   CP7: "Réaliser une isolation thermique extérieure par collage de panneaux isolants avec une finition enduit mince organique",
  //   CP8: "Réaliser une isolation thermique extérieure par calage/chevillage de panneaux isolants avec une finition enduit mince minéral",
  //   CP9: "Réaliser une isolation thermique extérieure par calage/chevillage de panneaux isolants avec en finition un enduit hydraulique projeté",
  //   CP10: "Entretenir et rénover d'anciens systèmes d'isolation thermique extérieure avec une finition enduit mince"
  // }

  // competences_cdes: any = {
  //   CP1: "Conduire en sécurité les chariots de manutention à conducteur porté de la catégorie 1A",
  //   CP2: "Préparer et emballer les commandes",
  //   CP3: "Charger, décharger les véhicules routiers à partir d'un quai et expédier les marchandises",
  //   CP4: "Identifier, signaler et corriger les anomalies dans l'entrepôt",
  // }

  // competences_vrd: any = {
  //   CP1: "Installer les dispositifs de sécurité pour chantier de voirie et réseaux",
  //   CP2: "Réaliser les implantations secondaires des ouvrages de voirie et de réseaux",
  //   CP3: "Construire des petits ouvrages d'aménagement urbain",
  //   CP4: "Poser des pavés et des dalles manufacturées",
  //   CP5: "Réaliser un dallage béton pour un ouvrage de voirie en aménagement urbain",
  //   CP6: "Travailler à proximité des réseaux",
  //   CP7: "Mettre en oeuvre des produits manufacturés de type bordures et caniveaux",
  //   CP8: "Poser les gaines, fourreaux et les chambres de tirage pour les réseaux courant faible.",
  //   CP9: "Poser les gaines et les chambres de tirage pour les réseaux courant fort.",
  //   CP10: "Réaliser les branchements particuliers eaux pluviales et leurs raccordements"
  // }

  // competences_vul: any = {
  //   CP1: "Veiller au maintien du bon fonctionnement du véhicule de livraison et à son état général",
  //   CP2: "Identifier l'envoi ou les envois et adapter l'organisation de la course et de la tournée en fonction des impératifs",
  //   CP3: "Manutentionner la marchandise, charger, décharger le véhicule",
  //   CP4: "Conduire et manœuvrer un véhicule utilitaire léger dans le respect des règles de sécurité routière de façon écologique et économique",
  //   CP5: "Prendre en compte les spécificités de la course ou de la tournée dans un contexte urbain",
  //   CP6: "Assurer la livraison, le dépôt ou l'enlèvement de marchandises dans un contexte commercial",
  //   CP7: "Identifier, contrôler et renseigner les supports numériques ou les documents relatifs à l'exercice de l'emploi de conducteur livreur",
  //   CP8: "Prévenir les risques liés à l'activité professionnelle et appliquer les procédures."
  // }

  selectedSigle: string = ""

  arrayFilesToUpload: any = []

  notations: number[] = [1, 2, 3]

  relatedCompetences: any = []

  // pour ajouter un cas bloquant
  forbidden: boolean = false

  // pour savoir si au minimum une image a été rattachée à une réponse
  isOneMediaOption: boolean = false

  // import de auth pour tester les spécificités de l'évaluateur connecté si il est reconnu
  // import du service EvaluatorsService pour tester la récupération des affectations métiers spécifiques à l'évaluateur
  // l'import du service: SettingsService est nécessaire si on veut connecter ce composant aux settings métiers de firestore
  constructor(private service: QuestionsService, private router: Router, private authService: AuthGuardService, private evaluatorService: EvaluatorsService, private settingsService: SettingsService) {
  }

  ngOnInit(): void {

    // pour commencer à connecter le composant aux métiers tels qu'ils figurent en base (test initial)
    // this.settingsService.getTrades().subscribe(data => {
    //   for (const iterator of data) {
    //     console.log(iterator.competences)
    //   }
    //   console.log("data de getTrades()", data)
    // })



    if (this.authService.user) {
      this.authId = this.authService.user
      // alert(this.authId)
      this.evaluatorService.getEvaluator(this.authId).subscribe(data => {
        this.userData = data
        console.log(data)
        this.getRelatedCompetences()
      })
      console.log('new this.userData.sigle', this.userData);
    }

    else {
      alert('user is signed out !!!')
    }

    this.fetchSigleIds()
  }

  async submitForm(form: NgForm) {
    if (form.value.optScoring3 === null) {
      form.value.optScoring1 === form.value.optScoring2 ? this.forbidden = true : this.forbidden = false
      delete form.value.optScoring3;
    }

    if (form.value.optScoring4 === null) {
      form.value.optScoring1 === form.value.optScoring2 ? this.forbidden = true : this.forbidden = false
      delete form.value.optScoring4;
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
    if (event.target.files[0].size <= 4000000) {
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
      alert("Le fichier est trop volumineux (limite : 4 Mo) !");
    }
  }

  resetFileInput(fieldName: string, form: NgForm) {
    // Réinitialise la valeur du champ de fichier dans le formulaire
    form.controls[fieldName].reset()
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
    for (let i = 20; i < 201; i++) { this.numbers.push(i) }
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

  getKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }



}
