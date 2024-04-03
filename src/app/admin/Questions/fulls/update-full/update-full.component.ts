import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionsService } from 'src/app/admin/questions.service';
import { EvaluatorsService } from 'src/app/admin/evaluators.service';
import { SettingsService } from 'src/app/admin/settings.service';


@Component({
  selector: 'app-update-full',
  // templateUrl: './update-full.component.html',
  templateUrl: './../../update-form.component.html',
  // styleUrls: ['./update-full.component.css']
  styleUrls: ['./../../update-form.component.css']
})

export class UpdateFullComponent {

  // pour les données liées à la collection questions
  questionId: any;
  result: any = {}

  isVideo?: any

  allMediasQuestions: any = []
  allMediasResponses: any = []
  // allPathsResponses: any[] = []
  mediasResponsesById: any = []
  mediaQuestionById: any = []

  arrayFilesToUpdate: any = []
  notations: number[] = [1, 2, 3]

  // pour faire le décompte des questions enregistrées puisqu'il faut pouvoir permutter
  numbers: number[] = []
  registryNumbers: any[] = []

  optScoring3: boolean | null = null
  optScoring4: boolean | null = null

  // pour forcer le display none de l'aperçu si l'image vient d'être définitivement supprimée
  isActive: boolean = true
  isActive1: boolean = true
  isActive2: boolean = true
  isActive3: boolean = true
  isActive4: boolean = true

  isRequiredOption3: boolean = false
  isRequiredOption4: boolean = false

  relatedCompetences: any = []

  registryCompetences: any = []

  competence:string=""

  constructor(private service: QuestionsService, private ac: ActivatedRoute, private router: Router, private evaluatorService: EvaluatorsService, private tradeService:SettingsService
  ) {
  }

  ngOnInit(): void {

    this.questionId = this.ac.snapshot.params["id"];
    // récupération des seuls média Responses correspondant à la question en cours d'update
    this.service.getMediasResponsesById(this.questionId)
    // récupération du seul média Question correspondant à la question en cours d'update
    this.allMediasResponses = this.service.getMediasResponsesById(this.questionId)
    this.allMediasQuestions = this.service.getMediaQuestionById(this.questionId)
    // console.log("mediaQuestionById",this.mediaQuestionById);

    // on fait appel à getQuestion pour récupérer les entrées de l'existant. méthode qui pour memo renvoie un observable
    this.service.getQuestion(this.questionId).subscribe((data) => {
      console.log("data depuis update-full component !!!!!!!!!!!!!", data);
      this.result = data
      this.isVideo = data.isVideo
      // this.relatedCompetences = data
      this.checkIfSelected(data.sigle)
      // data.optScoring3 ? this.optScoring3 = data.optScoring3 : 'null'
      // data.optScoring4 ? this.optScoring4 = data.optScoring4 : 'null'
    })

    this.service.getQuestions().subscribe(data => {
      // console.log(data);
      // attention : c'est la différence avec prior-form, on ne veut pas afficher les 20 premières questions dans le dénombre
      for (let n of data) {
        n.number > 20 ? this.registryNumbers = [...this.registryNumbers, Number(n.number)] : ""
        // console.log(this.registryNumbers);
        this.numbers = this.numbers.filter(element => {
          return element != n.number
        });
        // console.log("result", this.numbers);
      }
      // return this.registryNumbers
    })

    for (let i = 21; i < 201; i++) {
      this.numbers.push(i)
      console.log(this.numbers);
    }
  }


  updateForm(form: NgForm) {
    // on vérifie la validité du formulaire
    if (!form.valid) {
      console.log('form valid')
      return
    }

    // Vérifier si optScoring3 ou 4 est défini
    if (form.value.optScoring4 === undefined) {
      // Si non défini, définir la valeur à null
      form.value.optScoring4 = null;
    }
    if (form.value.optScoring3 === undefined) {
      // Si non défini, définir la valeur à null
      form.value.optScoring3 = null;
    }

    // Vérifier si option3 ou 4 n'a pas été vidé
    if (form.value.option4 === undefined || form.value.option4 === '') {
      form.value.optScoring4 = null;
    }
    if (form.value.optScoring3 === undefined || form.value.option3 === '') {
      form.value.optScoring3 = null;
    }

    // console.log("form update values", form.value);
    // pour update de la nouvelle image si nouvelle : 
    console.log("video avant passage à service", this.isVideo);
    let updatedQuestion = { isVideo: this.isVideo, ...form.value }
    this.service.updateQuestion(this.questionId, updatedQuestion, this.arrayFilesToUpdate)

    this.router.navigate(['/admin/fullList'])
  }

  //  fonction en cas de modification d'un média existant
  detectFiles(event: any, fieldName: any, item: any = "") {
    // console.log("fieldName.name", fieldName.name);
    alert(`êtes-vous certain de vouloir remplacer le fichier ${item} ?`)
    this.service.deleteMedia(item)

    console.log("Type de fichier!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!", event.target.files[0].type);

    event.target.files[0].type === "video/mp4" ? this.isVideo = true : this.isVideo = false;

    // https://www.cnetfrance.fr/produits/calculer-le-poids-de-ses-photos-1003101.htm
    // if (event.target.files[0].size > 18000000) {
    if (event.target.files[0].size > 1000000000) {
      alert("File is too big!")
    }

    this.arrayFilesToUpdate.push([event.target.files[0], fieldName.name])
    // alert(fieldName.name)
    // Vérifiez le nom du champ et mettez à jour le bon champ de résultat en conséquence
    if (fieldName.name === 'mediaQuestion') {
      this.result.mediaQuestion = event.target.files[0].name;
    } else if (fieldName.name === 'mediaOption1') {
      this.result.mediaOption1 = event.target.files[0].name;
    } else if (fieldName.name === 'mediaOption2') {
      this.result.mediaOption2 = event.target.files[0].name;
    } else if (fieldName.name === 'mediaOption3') {
      this.result.mediaOption3 = event.target.files[0].name;
    } else if (fieldName.name === 'mediaOption4') {
      this.result.mediaOption4 = event.target.files[0].name;
    }

    // this.arrayFilesToUpdate.push([event.target.files[0], fieldName.name, event.target.files[0].type])
    // console.log("this.arrayFilesToUpdate !!!!!!!!!", this.arrayFilesToUpdate);
    // console.log(event.target.files[0].size);

  }

  // fonction en cas d'ajout d'un média sur une réponse initialement sans média
  detectNewFiles(event: any, fieldName: any, item: any = "") {
    // console.log("fieldName.name", fieldName.name);
    // console.log("Type de fichier", event.target.files[0].type);
    // ce n'était pas prévu pour ça mais pour rendre option 2 ou 3 obligatoire si les inputs file associés sont remplis
    if (item === 'mediaOption3') {
      this.result.mediaOption3 = event.target.files[0];
      this.isRequiredOption3 = true;
    } else if (item === 'mediaOption4') {
      this.result.mediaOption4 = event.target.files[0];
      this.isRequiredOption4 = true;
    }

    alert("new file")

    event.target.files[0].type === "video/mp4" ? this.isVideo = true : this.isVideo = false;

    // si le code de fullForm* est opérationnel dans ce contexte, plus besoin de ce qui suit :
    // if (event.target.files[0].size > 18000000) {
    //   alert("File is too big!")
    // }
    // this.arrayFilesToUpdate.push([event.target.files[0], fieldName.name])

    // code de fullForm en ajout simple **************************************************
    console.log(event.target.files[0].size);
    console.log('fieldName.name', fieldName.name);

    // Vérifie la taille du fichier et le type avant de l'ajouter
    // if (event.target.files[0].size <= 5000000) {
    if (event.target.files[0].size <= 1000000000) {
      // Vérifie si le fichier avec le même nom existe déjà dans arrayFilesToUpload
      const existingFileIndex = this.arrayFilesToUpdate.findIndex((item: any) => item[1] === fieldName.name);


      if (existingFileIndex !== -1) {
        // Si le fichier existe déjà, le supprime
        this.arrayFilesToUpdate.splice(existingFileIndex, 1);
        alert('Changement d\'image détecté. Ancien fichier supprimé.');
      }

      // Ajoute le nouveau fichier à arrayFilesToUpload
      this.arrayFilesToUpdate.push([event.target.files[0], fieldName.name, event.target.files[0].type]);
      console.log("this.arrayFilesToUpload !!!!", this.arrayFilesToUpdate);

      // // Si déjà un fichier mediaOption???????????????
      // const existingMediaOption = this.arrayFilesToUpdate.findIndex((item: any) => item[1].includes("mediaOption"))
      // existingMediaOption !== -1 ? this.isOneMediaOption = true : this.isOneMediaOption = false;
      // alert(this.isOneMediaOption)

    } else {
      // Fichier trop volumineux, affiche une alerte
      alert("Le fichier est trop volumineux (limite : 5 Mo) !");
    }

  }


  // readFile(fieldName: any) {
  //   alert("dddddd")
  //   console.log("ce que je récupère", fieldName);
  // }

  resetFileInput(fieldName: string, form: NgForm, item: string) {
    form.controls[fieldName].setValue('');
    // Réinitialise la variable isRequiredOptionX correspondante
    if (fieldName === 'mediaOption3') {
      this.isRequiredOption3 = false;
    } else if (fieldName === 'mediaOption4') {
      this.isRequiredOption4 = false;
    }
    // form.controls[fieldName].reset();
    // Supprime le fichier de arrayFilesToUpload (si nécessaire)
    const fileIndex = this.arrayFilesToUpdate.findIndex((item: any) => item[1] === fieldName);
    if (fileIndex !== -1) {
      this.arrayFilesToUpdate.splice(fileIndex, 1);
    }
    // détection du cas de modification
    if (item !== '') {
      this.service.deleteMedia(item)
      if (fieldName == 'mediaQuestion') {
        this.isActive = false
      }

      if (fieldName == 'mediaOption1') {
        this.isActive1 = false

      }

      if (fieldName == 'mediaOption2') {
        this.isActive2 = false

      }
      if (fieldName == 'mediaOption3') {
        this.isActive3 = false
      }
      else {
        this.isActive4 = false

      }

    }

  }

  lookForKeyContent(array: any, string: string) {
    return array.filter((item: any) => item.includes(string))
  }

  onMediaOption1Change(newMediaOption1Value: string) {
    this.result.mediaOption1 = newMediaOption1Value;
  }

  checkIfSelected(sigle: any) {
    console.log(sigle);
    this.tradeService.getCompetences(sigle).subscribe(data => {
      this.relatedCompetences= data
      })
  }



}