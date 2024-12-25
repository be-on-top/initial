import { Component, Input, OnInit } from '@angular/core';
import { StudentsService } from '../../students.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Evaluation } from '../../evaluation';
import { SettingsService } from '../../settings.service';
import { formatDate } from '@angular/common';
import { TrainersService } from '../../trainers.service';
import { AuthService } from '../../auth.service';
import { Trainer } from '../../trainer';
import { CentersService } from '../../centers.service';
// import { AnimationKeyframesSequenceMetadata } from '@angular/animations';

@Component({
  selector: 'app-update-student',
  templateUrl: './update-student.component.html',
  styleUrls: ['./update-student.component.css']
})
export class UpdateStudentComponent implements OnInit {

  studentId: any
  student: any = {}
  // selectedSigles: string[] = []
  // et dans l'hypothèse où le formateur utilise ce même composant pour mettre à jour son évaluation
  evaluationToUpdate: Evaluation = { sigle: '', competence: '', level: '', details: '', subject: '', date: '' }
  evaluationKey: string = ""
  userRouterLinks: any

  // je rajoute (tout en maintenant là aussi le typage qui est rigoureusement le même)
  tutorialToUpdate: Evaluation = { sigle: '', competence: '', level: '', details: '', subject: '', date: '' }
  tutorialKey: string = ""

  // essai pour connecter le tableau des sigles aux documents de la collection sigles destinée aux paramétrages métier
  sigleIds: string[] = []

  levels: string[] = ['beginner', 'intermediate', 'advance', 'pro']
  // pour traduire en bon français
  levelTranslations: { [key: string]: string } = {
    'beginner': 'débutant',
    'intermediate': 'intermédiaire',
    'advance': 'avancé',
    'pro': 'acquise'
  }

  // pour récupérer côté composant l'uid dont on va avoir besoin pour le changement de paradigme...
  userUid: string | null = '';

  constructor(
    private service: StudentsService,
    private ac: ActivatedRoute,
    private router: Router,
    private settingsService: SettingsService,
    private trainerService: TrainersService,
    private authService: AuthService,
    private centersService: CentersService
  ) {
    this.userRouterLinks = this.ac.snapshot.data;
  }

  ngOnInit(): void {
    this.studentId = this.ac.snapshot.params["id"]
    this.ac.snapshot.params["evaluationKey"] ? this.evaluationKey = this.ac.snapshot.params["evaluationKey"] : this.evaluationKey = this.ac.snapshot.params["editKey"]
    this.ac.snapshot.params["tutorialKey"] ? this.tutorialKey = this.ac.snapshot.params["tutorialKey"] : this.tutorialKey = this.ac.snapshot.params["editKey"]

    console.log("voici l'ID", this.studentId)
    // on fait appel à getstudent pour récupérer les entrées de l'existant. méthode qui pour memo renvoie un observable
    this.service.getStudentById(this.studentId).subscribe((data) => {
      this.student = data

      if (this.student.evaluations || this.student.tutorials) {
        for (const key in this.student.evaluations) {
          key === this.evaluationKey ? this.evaluationToUpdate = this.student.evaluations[key] : ''
        }
        console.log("evaluationToUpdate", this.evaluationToUpdate)

        for (const key in this.student.tutorials) {
          key === this.tutorialKey ? this.tutorialToUpdate = this.student.tutorials[key] : ''
        } console.log("tutorialToUpdate", this.tutorialToUpdate)
      }


    })

    this.getUsers()
    this.fetchSigleIds()

    // implémenter la méthode conçue pour les "conseillers projets" qui n'en sont pas puisqu'ils se font concurrence (référents admin)
    // Récupérer l'UID de manière synchrone
    this.userUid = this.authService.getCurrentUserUid();
    console.log('UID de l\'utilisateur authentifié dans le composant :', this.userUid);


    // On peut maintenant utiliser cet UID pour d'autres opérations
    if (this.userUid) {
      // Une méthode qui s'en inspière mais va me retourner
      // la liste des formateurs et ceux qui ont le même tableau de cp
      // ou ceux dont un des cp du tableau est contenu dans le tableau des cp du compte authentifié


      // this.getCenterPostalCode(id:string){


      // }

      // this.getTrainersWithSameCp(this.userUid)
      // this.getDedicatedTrainer()

      // SI JE VEUX FAIRE un DEUX EN UN
      this.getTrainersWithSameCpAndSigle(this.userUid)


    }


  }


  updateStudent(form: NgForm) {
    // on vérifie la validité du formulaire
    if (!form.valid) {
      /* console.log('form valid'); */
      return
    }
    /* console.log("form update values", form.value); */
    this.service.updateStudent(this.studentId, form.value)
    // il faudra prévoir une redirection... 
    this.router.navigate(['/admin/student', this.studentId])
  }

  updateStudentEvaluation(form: NgForm) {
    if (!form.valid) {
      /* console.log('form valid'); */
      return
    }
    /* console.log("form update values", form.value); */
    const updatedEvaluations: any = { evaluations: { ...this.student.evaluations } }
    // pour actualiser la date à l'update
    const currentDate: string = formatDate(new Date(), 'yyyy-MM-dd', 'en');
    // updatedEvaluations.evaluations[this.evaluationKey]=form.value
    updatedEvaluations.evaluations[this.evaluationKey] = { "sigle": this.evaluationToUpdate.sigle, "competence": this.evaluationToUpdate.competence, "level": form.value.level, "date": currentDate, "details": form.value.details, "subject": form.value.subject }
    console.log("this.student.evaluations après lecture du formulaire d'update", updatedEvaluations)

    this.service.updateStudentEvaluation(this.studentId, updatedEvaluations)
    // il faudra prévoir une redirection... 
    this.router.navigate(['/admin/myStudentDetails', this.studentId])
  }

  updateStudentTutorial(form: NgForm) {
    if (!form.valid) {
      /* console.log('form valid'); */
      return
    }
    /* console.log("form update values", form.value); */
    const updatedTutorials: any = { tutorials: { ...this.student.tutorials } }
    // pour actualiser la date à l'update
    const currentDate: string = formatDate(new Date(), 'yyyy-MM-dd', 'en');
    // updatedEvaluations.evaluations[this.evaluationKey]=form.value
    updatedTutorials.tutorials[this.tutorialKey] = { "sigle": this.tutorialToUpdate.sigle, "competence": this.tutorialToUpdate.competence, "level": form.value.level, "date": currentDate, "details": form.value.details, "subject": form.value.subject }
    console.log("this.student.tutorial après lecture du formulaire d'update", updatedTutorials)
    this.service.updateStudentTutorial(this.studentId, updatedTutorials)
    // il faudra prévoir une redirection... 
    this.router.navigate(['/admin/tutor/myStudentDetails', this.studentId])
  }

  getUsers() {
    if (this.userRouterLinks.user == "trainer") {
      alert("C'est un formateur !!!")
    }
    else if (this.userRouterLinks.user == "tutor") {
      alert("C'est un tuteur !!!")
    }
    else if (this.userRouterLinks.user == "admin") {
      alert("C'est un super administrateur !!!")
    }

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

  subscribeStudent(subscribeStudent: NgForm) {
    // console.log('subscribeStudent.value.sigle', subscribeStudent.value.sigle);
    let array = []
    for (const key of subscribeStudent.value.sigle) {
      array.push(key)

    }
    // alert(array)

    this.service.activateSubscription(this.studentId, array)

  }

  sendElearningInfo(info: NgForm) {
    this.service.sendElearningInfo(this.studentId, info.value.elearning)

  }

  addEndingDate(endSubscription: NgForm) {
    this.service.endSubscription(this.studentId, endSubscription.value.sigle)
  }

  selectedFile: File | null = null;

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onUploadFile(form: NgForm,) {
    if (!this.selectedFile) {
      return;
    }


    const filePath = `student-docs/${this.studentId}/${Date.now()}_${this.selectedFile.name}`;
    this.service.uploadPDF(filePath, this.selectedFile, this.studentId)

    form.resetForm();
    this.selectedFile = null;
  }

  myCp: string[] = []
  filteredTrainers: Trainer[] = []


  getTrainersWithSameCp(userId: string) {
    this.trainerService.getReferentData(userId).subscribe(referentData => {
      this.myCp = referentData.cp || []; // Garantir que `this.myCp` est un tableau

      console.log("Mes codes postaux :", this.myCp);

      // Étape 2 : Récupérer les formateurs et les filtrer
      this.trainerService.getTrainers().subscribe(trainers => {
        // Appliquer le filtre et assigner le résultat à `filteredTrainers`
        this.filteredTrainers = trainers.filter((trainer: any) => {
          // Vérifier si le formateur a au moins un code postal correspondant
          return trainer.cp?.some((cp: string) => this.myCp.includes(cp));
        });

        console.log("Trainers correspondants :", this.filteredTrainers);
        this.getDedicatedTrainer()
      });
    });

  }



  // filteredTrainer?: Trainer; // Si vous utilisez `find`
  filteredTrainer: Trainer | undefined;
  getDedicatedTrainer() {
    // Trouver un seul formateur correspondant
    this.filteredTrainer = this.filteredTrainers.find((trainer: Trainer) => {
      return trainer.sigle?.some((sigle: string) => this.student.subscriptions.includes(sigle));
    });
    console.log("Trainer correspondant :", this.filteredTrainer);
  }

  // méthode deux en un pour test !!!!!!!
  getTrainersWithSameCpAndSigle(userId: string) {
    this.trainerService.getReferentData(userId).subscribe(referentData => {
      this.myCp = referentData.cp || []; // Garantir que `this.myCp` est un tableau

      console.log("Mes codes postaux :", this.myCp);

      // Étape 2 : Récupérer les formateurs et les filtrer
      this.trainerService.getTrainers().subscribe(trainers => {
        // Appliquer le filtre et assigner le résultat à `filteredTrainers`
        this.filteredTrainers = trainers.filter((trainer: any) => {
          // Vérifier si le formateur a au moins un code postal correspondant
          return trainer.cp?.some((cp: string) => this.myCp.includes(cp));
        });

        // ATTENTION VIRER TEST pour cumule des filtres en un
        this.filteredTrainers = trainers.filter((trainer: any) => {
          // Vérifier si le formateur a au moins un code postal correspondant
          return trainer.sigle?.some((sigle: string) => this.student.subscriptions.includes(sigle));
      
        });

        console.log("Trainers correspondants :", this.filteredTrainers);
        this.getDedicatedTrainer()
      });
    });


  }




  priorCenterPostalCode: string = ''

  // si on avait besoin de faire remonter des informations, ici l'id du centre choisi, depuis le composant enfant
  center: string | undefined; // Stocker uniquement le `center`
  onCenterChanged(updatedCenter: string) {
    this.center = updatedCenter; // Met à jour la variable avec `center`
    console.log('Center reçu :', this.center); // Vérifiez qu'il contient `doc-center-id`

    // je doute de l'emplacement pour appeler la méthode
    this.getCenterPostalCode(this.center)
  }

  getCenterPostalCode(id: any) {
    this.centersService.getCenter(id).subscribe(data => {
      // alert(data.cp)
      this.priorCenterPostalCode = data.cp
      console.log('this.priorCenterPostalCode !!!!!!!!!!!', this.priorCenterPostalCode);

    })


  }

  trainingClass: string = ""

  // essai initial
  // setClassId(startingDate:NgForm){
  //   console.log('startingDate',startingDate.value)
  //   this.trainingClass=`${this.student.subscriptions[0]}_${this.priorCenterPostalCode}_${startingDate.value.startingDate.toString()}`
  //   console.log('Une classe normée générée', this.trainingClass);   
  //   console.log('Student à mettre à jour', this.student);
  //   this.service.updateStudentClass(this.student.id,this.trainingClass)
  //   console.log('Trainer à mettre à jour', this.filteredTrainer);
  //   this.trainerService.updateTrainerClass(this.student.id,this.trainingClass)
  // }



  // FONCTIONNE bien pour class:string côté students et gestion des seules  propriétés class pour trainer et student
  // setClassId(startingDate: NgForm) {
  //   console.log('startingDate', startingDate.value);
  
  //   // Formater la date au format DDMMYYYY
  //   const formattedDate = this.formatDate(startingDate.value.startingDate);
  
  //   // Créer la classe normée
  //   this.trainingClass = `${this.student.subscriptions[0]}_${this.priorCenterPostalCode}_${formattedDate}`;
  //   console.log('Une classe normée générée', this.trainingClass);
  
  //   console.log('Student à mettre à jour', this.student);
  //   console.log('Trainer à mettre à jour', this.filteredTrainer);
  
  //   // Appeler les méthodes de mise à jour comme avant
  //   this.service.updateStudentClass(this.student.id, this.trainingClass);
  //   alert(this.filteredTrainer)
  //   this.filteredTrainer? this.trainerService.updateTrainerClass(this.filteredTrainer.id, this.trainingClass):''
  // }
  



  // méthode augmentée pour class[] partout et mettre à jour students[] OK
  // setClassId(startingDate: NgForm) {
  //   console.log('startingDate', startingDate.value);
  //   // const lastSubscription = this.student.subscriptions[this.student.subscriptions.length - 1];

  
  //   // Formater la date au format DDMMYYYY
  //   const formattedDate = this.formatDate(startingDate.value.startingDate);
  
  //   // Créer la classe normée
  //   this.trainingClass = `${this.student.subscriptions[0]}_${this.priorCenterPostalCode}_${formattedDate}`;
  //   console.log('Une classe normée générée', this.trainingClass);
  
  //   console.log('Student à mettre à jour', this.student);
  //   console.log('Trainer à mettre à jour', this.filteredTrainer);
  
  //   // Mettre à jour le student
  //   this.service.updateStudentClass(this.student.id, this.trainingClass);
  
  //   // Mettre à jour le trainer (classes et étudiants)
  //   if (this.filteredTrainer) {
  //     this.trainerService.updateTrainerClass(
  //       this.filteredTrainer.id, 
  //       this.trainingClass, 
  //       this.student.id // Ajouter automatiquement l'étudiant
  //     );
  //   } else {
  //     console.warn("Aucun formateur sélectionné.");
  //   }
  // }

  // méthode encore augmentée d'une vérification additionnelle : que subscriptions[] soit préalablement renseigné

  setClassId(startingDate: NgForm) {
    console.log('startingDate', startingDate.value);
  
    // Vérifier si l'étudiant a des souscriptions
    if (!this.student.subscriptions || this.student.subscriptions.length === 0) {
      console.error("Aucune inscription trouvée pour générer la classe.");
      alert("Veuillez sélectionner une formation avant de définir la date de début.");
      return;
    }
  
    // Formater la date au format DDMMYYYY
    const formattedDate = this.formatDate(startingDate.value.startingDate);
  
    // Récupérer la dernière souscription
    const lastSubscription = this.student.subscriptions[this.student.subscriptions.length - 1];
  
    // Créer la classe normée
    this.trainingClass = `${lastSubscription}_${this.priorCenterPostalCode}_${formattedDate}`;
    console.log('Une classe normée générée', this.trainingClass);
  
    console.log('Student à mettre à jour', this.student);
    console.log('Trainer à mettre à jour', this.filteredTrainer);
  
    // Mettre à jour le student
    this.service.updateStudentClass(this.student.id, this.trainingClass);
  
    // Mettre à jour le trainer (classes et étudiants)
    // ATTENTION si DEUX EN UN c'est selectedTrainer qui remplace filteredTrainer !!!!
    if (this.filteredTrainer) {
      this.trainerService.updateTrainerClass(
        this.filteredTrainer.id,
        this.trainingClass,
        this.student.id // Ajouter automatiquement l'étudiant
      );
    } else {
      console.warn("Aucun formateur sélectionné.");
    }
  }
  

    // // Méthode pour formater une date au format DDMMYYYY
  private formatDate(date: string): string {
    const parsedDate = new Date(date);
    const day = parsedDate.getDate().toString().padStart(2, '0');
    const month = (parsedDate.getMonth() + 1).toString().padStart(2, '0');
    const year = parsedDate.getFullYear();
    return `${day}${month}${year}`;
  }



  selectedTrainer: any;  // Cette variable contiendra le formateur sélectionné

  // Méthode appelée lors de la sélection d'un formateur
  selectTrainer() {
    // console.log('Formateur sélectionné:', this.selectedTrainer);
    console.log('Formateur sélectionné:', this.selectedTrainer);
  }
  
  
  
  






}
