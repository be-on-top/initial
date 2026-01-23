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
import { UsersService } from '../../users.service';
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
  tradesEvaluated: string[] = []
  availableTrainings: string[] = []

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

  cpArray: string[] = []

  tinyInit: any;
  initialContent: string = '';

  // Si vrai → on ne demande plus de confirmation
  deleteConfirmed = false;

    trainerLastName: string = ""
  trainerFirstName: string = ""

  constructor(
    private service: StudentsService,
    private ac: ActivatedRoute,
    private router: Router,
    private settingsService: SettingsService,
    private trainerService: TrainersService,
    private authService: AuthService,
    private centersService: CentersService,
    // juste pour pouvoir récupérer éventuellement les cp gérés par le referent
    private usersService: UsersService
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


          // Valeur initiale venant de Firestore
          this.initialContent = this.evaluationToUpdate.details || '';
        }

        // console.log("evaluationToUpdate", this.evaluationToUpdate)

        for (const key in this.student.tutorials) {
          key === this.tutorialKey ? this.tutorialToUpdate = this.student.tutorials[key] : ''
        }
        // console.log("tutorialToUpdate", this.tutorialToUpdate)
      }


      // 1. Extraire les métiers évalués (métiers dont le questionnaire est terminé)
      const tradesEvaluated = Object.keys(this.student)
        .filter(key => key.startsWith('quizz_') && (this.student[key] as { fullResults?: any }).fullResults)
        .map(key => key.replace('quizz_', ''));

      // 2. Si endedSubscriptions existe, exclure les métiers déjà suivis
      if (this.student.endedSubscriptions && this.student.endedSubscriptions.length > 0) {
        // Convertir achievedTrainings en Set pour des recherches plus rapides
        const achievedTrainingsSet = new Set(
          this.student.endedSubscriptions.map((sub: any) => sub.sigle)
        );

        // Filtrer les traidesEvaluated en excluant les formations déjà suivies
        this.availableTrainings = tradesEvaluated.filter(
          trade => !achievedTrainingsSet.has(trade)
        );
      } else {
        // Si endedSubscriptions est vide ou non défini, on laisse tradesEvaluated tel quel
        this.availableTrainings = tradesEvaluated;
      }

      // Récupérer l'UID de manière synchrone
      this.userUid = this.authService.getCurrentUserUid();
      // console.log('UID de l\'utilisateur authentifié dans le composant :', this.userUid);
      if (!this.userUid) {
        console.log('uid utilisateur authentifié non récupéré');
      } else {
        this.usersService.getUser(this.userUid).subscribe(data => {
          // // Transformer la string CSV en tableau
          // const cpList: string[] = data.cp.split(',');   // ["44980","35230","44150", ...]
          // // Simuler 1 code postal pour tester la branche length === 1
          // this.cpArray = cpList.slice(0, 1);             // ["44980"]
          // this.cpArray = data.cp.split(',')
          this.cpArray = data.cp

          console.log('cpArray simulé :', this.cpArray);
          console.log('length :', this.cpArray.length);
          console.log('premier élément :', this.cpArray[0]);

          if (Array.isArray(this.cpArray) && this.cpArray.length === 1 && this.student['innerStudent']) {
            this.student.localTraining = this.cpArray[0];  // "44980"
          } else {
            this.student.localTraining = '';
          }

          console.log('student.localTraining :', this.student.localTraining);
        });

      }

          if (this.userUid) {
      this.trainerService.getTrainer(this.userUid).subscribe(trainer => {
        this.trainerLastName = trainer.lastName
        this.trainerFirstName = trainer.firstName
      })
    }



    })

    this.getUsers()
    this.fetchSigleIds()

    // implémenter la méthode conçue pour les "conseillers projets" (référents admin)


    // On peut maintenant utiliser cet UID pour d'autres opérations
    // if (this.userUid) {
    // Une méthode qui s'en inspière mais va me retourner
    // la liste des formateurs et ceux qui ont le même tableau de cp
    // ou ceux dont un des cp du tableau est contenu dans le tableau des cp du compte authentifié
    // this.getCenterPostalCode(id:string)

    // this.getTrainersWithSameCp(this.userUid)
    // this.getDedicatedTrainer()

    // SI JE VEUX FAIRE un DEUX EN UN : n'est plus utile si pas de classe normée
    // this.getTrainersWithSameCpAndSigle(this.userUid)

    // }

    // this.tinyInit = {
    //   plugins: 'link image',
    //   toolbar: 'undo redo | bold italic | link image',

    //   setup: (editor: any) => {

    //     let initialLength = 0;

    //     editor.on('init', () => {
    //       // Charger texte initial + paragraphe vide pour écrire à la suite
    //       editor.setContent(this.initialContent + '<p><br></p>');

    //       // Sauvegarder longueur du texte initial
    //       initialLength = editor.getContent({ format: 'text' }).length;

    //       // Placer le curseur dans le paragraphe vide
    //       setTimeout(() => {
    //         const body = editor.getBody();
    //         const lastNode = body.lastChild;
    //         editor.selection.select(lastNode, true);
    //         editor.selection.collapse(false);
    //       }, 50);
    //     });

    //     const moveCaretToEnd = () => {
    //       const body = editor.getBody();
    //       const lastNode = body.lastChild;
    //       editor.selection.select(lastNode, true);
    //       editor.selection.collapse(false);
    //     };

    //     editor.on('keydown', (e: KeyboardEvent) => {
    //       if (this.deleteConfirmed) return;

    //       if (e.key === 'Backspace' || e.key === 'Delete') {
    //         const text = editor.getContent({ format: 'text' });
    //         const rng = editor.selection.getRng();

    //         // Calculer la position de début de la sélection dans le texte brut
    //         const startOffset = editor.selection.getRng().startOffset;
    //         let caretPos = 0;

    //         const traverse = (node: any): boolean => {
    //           if (node === rng.startContainer) {
    //             caretPos += rng.startOffset;
    //             return true;
    //           }
    //           if (node.nodeType === 3) {
    //             caretPos += node.textContent.length;
    //           }
    //           if (node.childNodes) {
    //             for (let child of node.childNodes) {
    //               if (traverse(child)) return true;
    //             }
    //           }
    //           return false;
    //         };

    //         traverse(editor.getBody());

    //         // 🔹 Alerte uniquement si la sélection touche le texte initial
    //         if (caretPos < initialLength) {
    //           e.preventDefault();
    //           e.stopPropagation();

    //           const ok = confirm(
    //             "⚠️ Vous tentez de supprimer le partie du commentaire initial.\n" +
    //             "Confirmez-vous cette suppression ?"
    //           );

    //           if (ok) {
    //             this.deleteConfirmed = true;
    //           } else {
    //             // Restaurer texte initial + paragraphe vide
    //             editor.setContent(this.initialContent + '<p><br></p>');
    //             setTimeout(() => moveCaretToEnd(), 0);
    //           }
    //         }
    //       }
    //     });
    //   }
    // };


    this.tinyInit = {
      // plugins: 'link image',
      // toolbar: 'undo redo | bold italic | link image',
      plugins: '',                   // désactive images + liens
      toolbar: 'undo redo | bold italic',
      menubar: false,                // optionnel : retire le menu "Insert"

      setup: (editor: any) => {

        editor.on('init', () => {

          // On enveloppe le texte initial dans un conteneur reconnu et stable
          const initialHTML =
            `<div data-initial="true">${this.initialContent}</div><p><br></p>`;

          editor.setContent(initialHTML);

          // On place le curseur dans la zone libre
          setTimeout(() => {
            const body = editor.getBody();
            const last = body.lastChild;
            editor.selection.select(last, true);
            editor.selection.collapse(false);
          }, 50);
        });

        const moveCaretToEnd = () => {
          const body = editor.getBody();
          const last = body.lastChild;
          editor.selection.select(last, true);
          editor.selection.collapse(false);
        };

        editor.on('keydown', (e: KeyboardEvent) => {
          if (this.deleteConfirmed) return;

          if (e.key === 'Backspace' || e.key === 'Delete') {
            const rng = editor.selection.getRng();

            // On récupère le conteneur initial PAR data-attribute (fiable)
            const initialBlock = editor.getBody().querySelector('[data-initial="true"]');

            if (!initialBlock) return; // sécurité

            // Vérifier si le caret ou la sélection touche ce bloc
            const touchesInitial =
              initialBlock.contains(rng.startContainer) ||
              initialBlock.contains(rng.endContainer);

            if (touchesInitial) {
              e.preventDefault();
              e.stopPropagation();

              const ok = confirm(
                "⚠️ Vous tentez de supprimer le texte initial.\n" +
                "Confirmez-vous cette suppression ?"
              );

              if (ok) {
                this.deleteConfirmed = true;
                initialBlock.removeAttribute('data-initial');
              } else {
                editor.setContent(
                  `<div data-initial="true">${this.initialContent}</div><p><br></p>`
                );
                setTimeout(() => moveCaretToEnd(), 0);
              }
            }
          }
        });

      }
    };




















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
    this.userRouterLinks.user === 'referent' ? this.router.navigate(['/admin/referent/studentDetails', this.studentId]) : this.router.navigate(['/admin/student', this.studentId])
  }

  // updateStudentEvaluation(form: NgForm) {
  //   if (!form.valid) {
  //     /* console.log('form valid'); */
  //     return
  //   }


  // // 🔥 1. Nettoyage du wrapper data-initial (évite les imbrications infinies)
  // form.value.details = this.cleanInitialWrapper(form.value.details);

  // // 🔥 2. Nettoyage des paragraphes vides
  // form.value.details = this.cleanEmptyParagraphs(form.value.details);

    

  //   // Ajouter la signature du formateur (ça marche mais pas souhaitable si intégré dans details)
  //   form.value.details = this.appendTrainerSignature(form.value.details);   



  //   /* console.log("form update values", form.value); */
  //   const updatedEvaluations: any = { evaluations: { ...this.student.evaluations } }
  //   // pour actualiser la date à l'update
  //   const currentDate: string = formatDate(new Date(), 'yyyy-MM-dd', 'en');
  //   // updatedEvaluations.evaluations[this.evaluationKey]=form.value
  //   updatedEvaluations.evaluations[this.evaluationKey] = { "sigle": this.evaluationToUpdate.sigle, "competence": this.evaluationToUpdate.competence, "level": form.value.level, "date": currentDate, "details": form.value.details, "subject": form.value.subject }
  //   console.log("this.student.evaluations après lecture du formulaire d'update", updatedEvaluations)

  //   this.service.updateStudentEvaluation(this.studentId, updatedEvaluations)
  //   // il faudra prévoir une redirection... 
  //   this.router.navigate(['/admin/myStudentDetails', this.studentId])
  // }
  updateStudentEvaluation(form: NgForm) {
  if (!form.valid) {
    return;
  }

  // 🔥 1. Nettoyage du wrapper data-initial
  form.value.details = this.cleanInitialWrapper(form.value.details);

  // 🔥 2. Nettoyage des paragraphes vides
  form.value.details = this.cleanEmptyParagraphs(form.value.details);

  // 🔥 3. Ajout ou gestion de la signature formateur
  form.value.details = this.appendTrainerSignature(form.value.details);

  // 🔥 4. Mise à jour de la date de l'évaluation
  const currentDate: string = formatDate(new Date(), 'yyyy-MM-dd', 'en');

  // 🔥 5. On prépare SEULEMENT le champ à mettre à jour dans Firestore
  const dataToPatch = {
    [`evaluations.${this.evaluationKey}`]: {
      sigle: this.evaluationToUpdate.sigle,
      competence: this.evaluationToUpdate.competence,
      level: form.value.level,
      date: currentDate,             // ✔️ la date est bien écrasée désormais
      details: form.value.details,   // ✔️ détails nettoyés + signature
      subject: form.value.subject
    }
  };

  // 🔥 6. Patch Firestore (ne modifie QUE la sous-clé ciblée)
  this.service.updateStudentEvaluation(this.studentId, dataToPatch);

  // 🔥 7. Redirection
  this.router.navigate(['/admin/myStudentDetails', this.studentId]);
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
      // alert("C'est un formateur !!!")
      console.log("C'est un formateur !!!");

    }
    else if (this.userRouterLinks.user == "tutor") {
      // alert("C'est un tuteur !!!")
      console.log("C'est un tuteur !!!");
    }
    else if (this.userRouterLinks.user == "admin") {
      // alert("C'est un super administrateur !!!")
      console.log("C'est un super admin !!!");

    }

  }



  // Utilisation de la fonction du service lorsque nécessaire
  fetchSigleIds() {
    this.settingsService.getSigleIds()
      .then((sigleIds) => {
        this.sigleIds = sigleIds
        // console.log(sigleIds);
      })
      .catch((error) => {
        console.error('Erreur lors de la récupération des IDs de documents :', error);
      });
  }

  // subscribeStudent(subscribeStudent: NgForm) {
  //   // console.log('subscribeStudent.value.sigle', subscribeStudent.value.sigle);
  //   console.log('this.priorCenterPostalCode', this.priorCenterPostalCode)
  //   console.log('localTraining du formulaire', subscribeStudent.value.localTraining)

  //   let localTraining=''

  //   subscribeStudent.value.localTraining!=undefined?localTraining=subscribeStudent.value.localTraining:localTraining=this.priorCenterPostalCode

  //   let array = []
  //   for (const key of subscribeStudent.value.sigle) {
  //     array.push(key)

  //   }
  //   // alert(array)

  //   // this.service.activateSubscription(this.studentId, array)
  //   // si on veut profiter de l'inscription pour enregistrer une variable qui localise la formation directement dans compte utilisateur
  //   this.service.activateSubscription(this.studentId, array, localTraining)

  // }

  // poura voir des feedback explicites
  feedBackSubscribe: boolean = false
  async subscribeStudent(subscribeStudent: NgForm) {
    // console.log('this.priorCenterPostalCode', this.priorCenterPostalCode);
    // console.log('localTraining du formulaire', subscribeStudent.value.localTraining);

    let localTraining = subscribeStudent.value.localTraining
      ? subscribeStudent.value.localTraining
      : this.priorCenterPostalCode;

    let array: string[] = [];
    for (const key of subscribeStudent.value.sigle) {
      array.push(key);
    }

    try {
      await this.service.activateSubscription(this.studentId, array, localTraining);
      this.feedBackSubscribe = true
      // alert('Inscription réussie !'); 
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      alert('Échec de l\'inscription. Veuillez réessayer.');
    }
  }



  sendElearningInfo(info: NgForm) {
    this.service.sendElearningInfo(this.studentId, info.value.elearning)

  }

  feedBackEndSubscription: boolean = false

  async addEndingDate(endSubscription: NgForm) {
    // this.service.endSubscription(this.studentId, endSubscription.value.sigle)

    try {
      await this.service.endSubscription(this.studentId, endSubscription.value.sigle)
      this.feedBackEndSubscription = true
      alert('Fin de formation enregistrée !');

    } catch (error) {
      console.error('Erreur lors de l\'enregistrement fin de formation:', error);
      alert('Échec de l\'enregistrement de fin de formation. Veuillez réessayer.');

    }
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

      // on peut ajouter pour l'hypothèse d'un candidat externe 
      if (!this.student.innerStudent) {
        // alert(this.priorCenterPostalCode)
        this.student.localTraining = this.priorCenterPostalCode
      }

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



  // méthode encore augmentée d'une vérification additionnelle : que subscriptions[] soit préalablement renseigné (désactivé puisque prématuré....)

  // setClassId(startingDate: NgForm) {
  //   console.log('startingDate', startingDate.value);

  //   // Vérifier si l'étudiant a des souscriptions
  //   if (!this.student.subscriptions || this.student.subscriptions.length === 0) {
  //     console.error("Aucune inscription trouvée pour générer la classe.");
  //     alert("Veuillez sélectionner une formation avant de définir la date de début.");
  //     return;
  //   }

  //   // Formater la date au format DDMMYYYY
  //   const formattedDate = this.formatDate(startingDate.value.startingDate);

  //   // Récupérer la dernière souscription
  //   const lastSubscription = this.student.subscriptions[this.student.subscriptions.length - 1];

  //   // Créer la classe normée
  //   this.trainingClass = `${lastSubscription}_${this.priorCenterPostalCode}_${formattedDate}`;
  //   console.log('Une classe normée générée', this.trainingClass);

  //   console.log('Student à mettre à jour', this.student);
  //   console.log('Trainer à mettre à jour', this.filteredTrainer);

  //   // Mettre à jour le student
  //   this.service.updateStudentClass(this.student.id, this.trainingClass);

  //   // Mettre à jour le trainer (classes et étudiants)
  //   // ATTENTION si DEUX EN UN c'est selectedTrainer qui remplace filteredTrainer !!!!
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

  // // Méthode pour formater une date au format DDMMYYYY
  // private formatDate(date: string): string {
  //   const parsedDate = new Date(date);
  //   const day = parsedDate.getDate().toString().padStart(2, '0');
  //   const month = (parsedDate.getMonth() + 1).toString().padStart(2, '0');
  //   const year = parsedDate.getFullYear();
  //   return `${day}${month}${year}`;
  // }



  selectedTrainer: any;  // Cette variable contiendra le formateur sélectionné

  // Méthode appelée lors de la sélection d'un formateur
  selectTrainer() {
    // console.log('Formateur sélectionné:', this.selectedTrainer);
    console.log('Formateur sélectionné:', this.selectedTrainer);
  }


  // pour itérer sur endedSubscriptions et vérifier si on a déjà acté de la fin de formation
  isSubscriptionEnded(sigle: string): boolean {
    if (!this.student.endedSubscriptions) {
      return false;
    }
    return this.student.endedSubscriptions.some((sub: any) => sub.sigle === sigle);
  }

  feedBackResetChoice: boolean = false

  async resetStudentChoice(id: string) {
    console.log(id);
    if (this.student.isSocialFormSent) {
      try {
        // console.log(id);      
        await this.service.resetFormSent(id);
        this.feedBackResetChoice = true
        // alert("Le formulaire est à nouveau actif dans le compte candidat. Il pourra à nouveau choisir son centre ou une autre formation que mon centre ne dispense pas.");
      } catch (error) {
        console.error("Erreur lors de la réinitialisation :", error);
        alert("Une erreur est survenue. Veuillez réessayer.");
      }
    }
  }

  getAbsoluteCaretPos(editor: any): number {
    const sel = editor.selection.getRng();
    let pos = 0;

    const traverse = (node: any) => {
      if (node === sel.startContainer) {
        pos += sel.startOffset;
        throw 'done';
      }
      if (node.nodeType === 3) {
        pos += node.textContent.length;
      }
      if (node.childNodes) {
        for (let child of node.childNodes) {
          traverse(child);
        }
      }
    };

    try {
      traverse(editor.getBody());
    } catch { }

    return pos;
  }

  cleanEmptyParagraphs(html: string): string {
    if (!html) return html;

    // Supprime <p> vides, <p><br></p>, <p>&nbsp;</p>
    html = html.replace(/<p>(\s|&nbsp;|<br>|<br\/>|<br \/>)*<\/p>/gi, '');

    // Trim final pour éviter les artefacts
    return html.trim();
  }


  // appendTrainerSignature(details: string): string {

  //   // alert(this.userUid)

  //   const signature = `<p class="fst-italic">— ${this.trainerFirstName} ${this.trainerLastName}</p>`;

  //    alert(this.trainerFirstName)

  //   // Détecter si déjà signé pour éviter doublons
  //   if (details.includes(this.trainerFirstName) && details.includes(this.trainerLastName)) {
  //     return details; // déjà signé
  //   }

  //   return details + signature;
  // }

  // ok
//   appendTrainerSignature(details: string): string {
//   if (!details) return details;

//   const signature = `<p class="fst-italic">— ${this.trainerFirstName} ${this.trainerLastName}</p>`.trim();

//   // 1. Normaliser pour éviter les faux négatifs
//   const cleanDetails = details.trim();

//   // 2. Si la signature n’existe pas → l’ajouter
//   if (!cleanDetails.includes(signature)) {
//     return cleanDetails + signature;
//   }

//   // 3. Si elle existe → vérifier doublons consécutifs
//   const container = document.createElement('div');
//   container.innerHTML = cleanDetails;

//   const paragraphs = Array.from(container.querySelectorAll('p'));

//   for (let i = 0; i < paragraphs.length - 1; i++) {
//     const p1 = paragraphs[i].outerHTML.trim();
//     const p2 = paragraphs[i + 1].outerHTML.trim();

//     if (p1 === signature && p2 === signature) {
//       // Supprimer le second doublon
//       paragraphs[i + 1].remove();
//       break;
//     }
//   }

//   return container.innerHTML;
// }

// ok avec cas additionnel où si toutes signatures identiques on ne garde que la dernière
// appendTrainerSignature(details: string): string {
//   if (!details) return details;

//   const signatureHtml = `<p class="fst-italic">— ${this.trainerFirstName} ${this.trainerLastName}</p>`.trim();

//   // On normalise
//   const cleanDetails = details.trim();

//   // Si la signature n’est pas présente du tout → l’ajouter simplement
//   if (!cleanDetails.includes(signatureHtml)) {
//     return cleanDetails + signatureHtml;
//   }

//   // Sinon : analyser
//   const container = document.createElement('div');
//   container.innerHTML = cleanDetails;

//   const paragraphs = Array.from(container.querySelectorAll('p'));

//   // On collecte toutes les signatures identiques trouvées
//   const signaturesOfTrainer = paragraphs.filter(
//     p => p.outerHTML.trim() === signatureHtml
//   );

//   // S’il n’y en a qu’une → rien à faire
//   if (signaturesOfTrainer.length <= 1) {
//     return container.innerHTML;
//   }

//   // ➜ Si plusieurs signatures identiques et AUCUNE signature différente rencontrée :
//   //    → garder uniquement la dernière occurrence
//   let otherSignatureFound = false;

//   for (let p of paragraphs) {
//     const content = p.textContent?.trim() || "";

//     // signature d'un autre formateur ?
//     if (
//       content.startsWith("— ") &&
//       content !== `— ${this.trainerFirstName} ${this.trainerLastName}`
//     ) {
//       otherSignatureFound = true;
//       break;
//     }
//   }

//   // Seulement si AUCUNE autre signature distincte trouvée
//   if (!otherSignatureFound) {
//     // supprimer toutes sauf la dernière
//     const lastSignature = signaturesOfTrainer[signaturesOfTrainer.length - 1];

//     signaturesOfTrainer.forEach(sig => {
//       if (sig !== lastSignature) {
//         sig.remove();
//       }
//     });
//   }

//   return container.innerHTML;
// }

// cas où on rajoute la date dans chaque signature dans le détail
// appendTrainerSignature(details: string): string {
//   if (!details) return details;

//   // Date en format français
//   const today = formatDate(new Date(), 'dd/MM/yyyy', 'en');

//   // Signature complète (unique modification ici)
//   const signatureHtml = `<p class="trainer-signature" contenteditable="false">— ${this.trainerFirstName} ${this.trainerLastName} (${today})</p>`.trim();

//   const cleanDetails = details.trim();

//   // Signature absente → ajouter
//   if (!cleanDetails.includes(signatureHtml)) {
//     return cleanDetails + signatureHtml;
//   }

//   // La signature existe → gérer doublons
//   const container = document.createElement('div');
//   container.innerHTML = cleanDetails;

//   const paragraphs = Array.from(container.querySelectorAll('p'));

//   const signaturesOfTrainer = paragraphs.filter(
//     p => p.outerHTML.trim() === signatureHtml
//   );

//   // Si une seule signature → OK
//   if (signaturesOfTrainer.length <= 1) {
//     return container.innerHTML;
//   }

//   // Vérifier si un autre formateur a aussi signé
//   let otherSignatureFound = false;
//   for (let p of paragraphs) {
//     const content = p.textContent?.trim() || "";

//     // Commence par "— " mais nom différent → signature d’un autre formateur
//     if (
//       content.startsWith("— ") &&
//       !content.startsWith(`— ${this.trainerFirstName} ${this.trainerLastName} `)
//     ) {
//       otherSignatureFound = true;
//       break;
//     }
//   }

//   // Si pas d'autre signature → garder uniquement la dernière du formateur
//   if (!otherSignatureFound) {
//     const lastSignature = signaturesOfTrainer[signaturesOfTrainer.length - 1];

//     signaturesOfTrainer.forEach(sig => {
//       if (sig !== lastSignature) sig.remove();
//     });
//   }

//   return container.innerHTML;
// }

appendTrainerSignature(details: string): string {
  if (!details) return details;

  const today = formatDate(new Date(), 'dd/MM/yyyy', 'en');
  const newSignatureText = `— ${this.trainerFirstName} ${this.trainerLastName} (${today})`;

  // Crée un container temporaire pour manipuler le HTML
  const container = document.createElement('div');
  container.innerHTML = details.trim();

  const paragraphs = Array.from(container.querySelectorAll('p'));

  // Cherche les signatures existantes du formateur
  const existingSignature = paragraphs.find(p =>
    p.textContent?.trim().startsWith(`— ${this.trainerFirstName} ${this.trainerLastName}`));

  if (existingSignature) {
    // Remplace le texte existant par la nouvelle date
    existingSignature.textContent = newSignatureText;
  } else {
    // Ajoute la signature à la fin
    const p = document.createElement('p');
    p.className = 'trainer-signature';
    p.setAttribute('contenteditable', 'false');
    p.textContent = newSignatureText;
    container.appendChild(p);
  }

  return container.innerHTML;
}


cleanInitialWrapper(details: string): string {
  if (!details) return details;

  const container = document.createElement('div');
  container.innerHTML = details;

  // Trouver le wrapper data-initial
  const initialDiv = container.querySelector('[data-initial="true"]');

  if (initialDiv) {
    // On remplace le wrapper par son contenu
    const fragment = document.createElement('div');
    fragment.innerHTML = initialDiv.innerHTML;

    initialDiv.replaceWith(...Array.from(fragment.childNodes));
  }
  return container.innerHTML;
}

feedBackCancel: boolean = false;
showCancelEnd: boolean = false;


cancelEndingDate(form: NgForm) {
  if (form.invalid) return; // sécurité : rien si le formulaire est invalide

  // 1️⃣ Récupérer le sigle sélectionné
  const sigleToCancel = form.value.endedSigle;
  if (!sigleToCancel) return;

  // 2️⃣ Vérifier que cette fin de formation existe réellement
  const exists = this.student.endedSubscriptions.some(
    (sub: any) => sub.sigle === sigleToCancel
  );

  if (!exists) {
    console.warn(`Fin de formation ${sigleToCancel} introuvable.`);
    return;
  }

  // 3️⃣ Filtrer student.endedSubscriptions pour supprimer la fin sélectionnée
  this.student.endedSubscriptions = this.student.endedSubscriptions.filter(
    (sub: any) => sub.sigle !== sigleToCancel
  );

  // 4️⃣ Optionnel : mettre à jour availableTrainings
  // if (!this.student.endedSubscriptions || this.student.endedSubscriptions.length === 0) {
  //   this.availableTrainings = this.tradesEvaluated;
  // } else {
  //   const endedSet = new Set(
  //     this.student.endedSubscriptions.map((sub: any) => sub.sigle)
  //   );
  //   this.availableTrainings = this.tradesEvaluated.filter(
  //     trade => !endedSet.has(trade)
  //   );
  // }

  // 5️⃣ Persistency : mettre à jour Firestore 
this.service.updateEndedSubscriptions(this.student.id, this.student.endedSubscriptions)
  .then(() => {
    alert("fin de formation annulée")
    this.feedBackCancel = true;       // message succès
    form.resetForm();                 // reset formulaire
    this.showCancelEnd = false;       // masquer le formulaire si besoin
  })
  .catch(err => {
    console.error("Erreur lors de l'annulation :", err);
    this.feedBackCancel = false;      // message erreur
  });
}



}
