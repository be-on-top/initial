import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { QuestionsService } from 'src/app/admin/questions.service';


@Component({
  selector: 'app-prior-form',
  templateUrl: './prior-form.component.html',
  styleUrls: ['./prior-form.component.css']
})

export class PriorFormComponent implements OnInit {
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
  // Create a root reference

  numbers: number[] = []
  registryNumbers: any[] = []
  // isRegistered:boolean = false
  competences_ite: any = {
    CP1: "Monter et démonter des échafaudages, fixes de pieds et roulants, et savoir les utiliser",
    CP2: "Réaliser des travaux de peinture film mince de classe D2 sur des ouvrages neufs ou à rénover, en qualité definition C",
    CP3: "Mettre en œuvre des revêtements de peinture épais et semi-épais de classe D3 sur des ouvrages neufs ou à rénover, en qualité de finition C",
    CP4: "Réaliser des travaux extérieurs de peinture sur des supports bois, thermoplastiques et métalliques, neufs ou à rénover, en qualité de finition B",
    CP5: "Mettre en œuvre des systèmes d'imperméabilité de classes I1 à I4",
    CP6: "Réaliser l'étanchéité de supports horizontaux de type balcon ou similaire",
    CP7: "Réaliser une isolation thermique extérieure par collage de panneaux isolants avec une finition enduit mince organique",
    CP8: "Réaliser une isolation thermique extérieure par calage/chevillage de panneaux isolants avec une finition enduit mince minéral",
    CP9: "Réaliser une isolation thermique extérieure par calage/chevillage de panneaux isolants avec en finition un enduit hydraulique projeté",
    CP10: "Entretenir et rénover d'anciens systèmes d'isolation thermique extérieure avec une finition enduit mince"
  }

  competences_cdes: any = {
    CP1: "Conduire en sécurité les chariots de manutention à conducteur porté de la catégorie 1A",
    CP2: "Préparer et emballer les commandes",
    CP3: "Charger, décharger les véhicules routiers à partir d'un quai et expédier les marchandises",
    CP4: "Identifier, signaler et corriger les anomalies dans l'entrepôt",
  }

  competences_vrd: any = {
    CP1: "Installer les dispositifs de sécurité pour chantier de voirie et réseaux",
    CP2: "Réaliser les implantations secondaires des ouvrages de voirie et de réseaux",
    CP3: "Construire des petits ouvrages d'aménagement urbain",
    CP4: "Poser des pavés et des dalles manufacturées",
    CP5: "Réaliser un dallage béton pour un ouvrage de voirie en aménagement urbain",
    CP6: "Travailler à proximité des réseaux",
    CP7: "Mettre en oeuvre des produits manufacturés de type bordures et caniveaux",
    CP8: "Poser les gaines, fourreaux et les chambres de tirage pour les réseaux courant faible.",
    CP9: "Poser les gaines et les chambres de tirage pour les réseaux courant fort.",
    CP10: "Réaliser les branchements particuliers eaux pluviales et leurs raccordements"
  }

  competences_vul: any = {
    CP1: "Veiller au maintien du bon fonctionnement du véhicule de livraison et à son état général",
    CP2: "Identifier l'envoi ou les envois et adapter l'organisation de la course et de la tournée en fonction des impératifs",
    CP3: "Manutentionner la marchandise, charger, décharger le véhicule",
    CP4: "Conduire et manœuvrer un véhicule utilitaire léger dans le respect des règles de sécurité routière de façon écologique et économique",
    CP5: "Prendre en compte les spécificités de la course ou de la tournée dans un contexte urbain",
    CP6: "Assurer la livraison, le dépôt ou l'enlèvement de marchandises dans un contexte commercial",
    CP7: "Identifier, contrôler et renseigner les supports numériques ou les documents relatifs à l'exercice de l'emploi de conducteur livreur",
    CP8: "Prévenir les risques liés à l'activité professionnelle et appliquer les procédures."
  }


  selectedSigle: string = ""

  constructor(private service: QuestionsService, private router: Router) { }

  fileIsUploading = false;
  fileUrl!: string;
  fileUploaded = false;

  // totalMediasFiles: number = 0
  arrayFilesToUpload: any = []

  notations: number[] = [1, 2, 3]

  ngOnInit(): void {

    // le getQuestion ne doit a priori pas se faire AVANT qu'un SELECT ne soit sélectionné !!!!
    // ou alors, on le récupère PUIS on filtre ultérieurement

    // this.service.getQuestions().subscribe(data => {
    //   // console.log(data);
    //   for (let n of data) {
    //     this.registryNumbers = [...this.registryNumbers, Number(n.number)]
    //     // console.log(this.registryNumbers);
    //     this.numbers = this.numbers.filter(element => {
    //       return element != n.number
    //     });
    //     // console.log("result", this.numbers);
    //   }
    //   // return this.registryNumbers
    // })

  }

  async submitForm(form: NgForm) {
    console.log(form.value);
    this.service.createQuestion(form.value, this.arrayFilesToUpload);
    // form.reset();
    this.router.navigate(['/questions'])
    // window.location.reload();
  }

  detectFiles(event: any, fieldName: any) {
    console.log(event.target.files[0].size);
    // this.totalMediasFiles++;
    this.arrayFilesToUpload.push([event.target.files[0], fieldName.name, event.target.files[0].type])
    console.log("this.arrayFilesToUpload", this.arrayFilesToUpload);
    if (event.target.files[0].size > 13000000) {
      alert("File is too big!")
    }
    // this.onUploadFile(event.target.files[0], fieldName.name);
  }

  // ne servira plus si on parvient à mettre à jour this.registryNumbers à chaque nouvel enregistrement. *
  checkIfRegistered(n: any) {
    console.log(n)
    // this.registryNumbers.includes(n)?this.isRegistered==true:this.isRegistered==false)
  }

  checkIfSelected(sigle: any) {
    console.log(sigle);
    this.selectedSigle = sigle
    this.numbers=[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]

    // c'est l'endroit pour transvaser le getQuestion() avec comme filtre  préalable et additionnel : sigle.value

    this.service.getQuestions().subscribe(data => {

      const dataFiltered = data.filter(redutedData => {
        return redutedData.sigle == this.selectedSigle
      });

      console.log("datafiltered", dataFiltered);

      for (let n of dataFiltered) {
        console.log("n", n.number);
        this.numbers=this.numbers.filter(element => element != n.number)

      }


    })
  }


}








