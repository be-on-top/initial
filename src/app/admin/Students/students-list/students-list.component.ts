import { AfterViewInit, Component, OnInit } from '@angular/core';
import { StudentsService } from '../../students.service';
import { Student } from '../student';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { SettingsService } from '../../settings.service';
import { Trade } from '../../trade';

@Component({
  selector: 'app-students-list',
  templateUrl: './students-list.component.html',
  styleUrls: ['./students-list.component.css']
})
export class StudentsListComponent implements OnInit, AfterViewInit {

  allStudents: any[] = [];
  // pour différencier la vue si user external
  userRouterLinks: any;

  // on le prépare à recevoir un terme de recherche
  searchText: string = ''

  // pour récupérer les métiers et en faire des filtres
  trades:string[]=[]

  // on pourrait avoir directement dans le template une méthode  pour réinitialiser le composant

  constructor(private service: StudentsService, private activatedRoute: ActivatedRoute, private tradeService:SettingsService) {
    this.userRouterLinks = this.activatedRoute.snapshot.data;
  }

  ngOnInit() {
    this.getStudents();
    this.onSearchTextEntered("")
  }

  ngAfterViewInit() {
    this.tradeService.getTrades().subscribe(data=>{
      data.forEach(element => {
        this.trades.push(element.sigle)        
      });
    })

  }

  // getStudents() {
  //   this.service.getStudents().subscribe(students => {
  //     this.allStudents = students
  //     console.log('this.allStudents', this.allStudents)
  //   })

  // }


  // getStudents() {
  //   this.service.getStudents().pipe(
  //     map(students => students.filter(student => this.hasFullResults(student)))
  //   ).subscribe(filteredStudents => {
  //     this.allStudents = filteredStudents;
  //     console.log('this.allStudents', this.allStudents);
  //   });
  // }

  getStudents() {
    this.service.getStudents().pipe(
      map(students => students.filter(student => this.hasFullResults(student)))
    ).subscribe(filteredStudents => {
      this.initialStudents = filteredStudents; // Stocker la liste initiale
      this.allStudents = [...this.initialStudents]; // Initialiser allStudents
      this.applyFilters();
    });
  }

  hasFullResults(obj: any): boolean {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (key === 'fullResults') {
          return true;
        }
        if (typeof obj[key] === 'object' && this.hasFullResults(obj[key])) {
          return true;
        }
      }
    }
    return false;
  }


  deleteStudent(student: Student) {
    /* console.log(student); */
    this.service.deleteStudent(student);
    this.getStudents();
  }

  // pour utiliser le composant de recherche
  onSearchTextEntered(searchValue: string) {
    console.log(searchValue);

    this.searchText = searchValue
    console.log(this.searchText);

  }

  exportStudentsCollection() {
    this.service.exportCollection("students")
  }

  exportCollectionAsCSV() {
    this.service.exportCollectionAsCSV("students")
  }


  isSocialFormSentFilter: boolean = false;
  isSubscriptionFilter: boolean = false
  initialStudents: any[] = []; // Copie initiale des étudiants
  isTradeFilter:boolean = false
  tradesActivated:boolean=false
  isQualifiedFilter:boolean=false

  // applyFilters() {
  //   // Restaurer l'état initial avant de filtrer
  //   this.allStudents = this.initialStudents.filter(student => {
  //     const matchesSearchText = this.searchText === '' || student.lastName.includes(this.searchText) || student.lastName.toLowerCase().includes(this.searchText) || student.firstName.includes(this.searchText) || student.firstName.toLowerCase().includes(this.searchText);
  //     if (this.isSocialFormSentFilter) {
  //       return student.isSocialFormSent && matchesSearchText;
  //     }
  //     return matchesSearchText;
  //   });
  // }

  // onCheckboxChange(event: any) {
  //   this.isSocialFormSentFilter = event.target.checked;
  //   this.applyFilters();
  // }

  applyFilters(trade?:string) {
    if (this.isSocialFormSentFilter) {
      this.allStudents = this.initialStudents.filter(student => student.isSocialFormSent);
    } else if (this.isSubscriptionFilter) {
      this.allStudents = this.initialStudents.filter(student => student.subscriptions);
      this.tradesActivated=true
    } else if (this.isTradeFilter) {
      this.allStudents = this.initialStudents.filter(student => student.subscriptions && student.subscriptions.includes(trade));
    } else if (this.isQualifiedFilter) {
      this.allStudents = this.initialStudents.filter(student => student.endedSubscriptions);
    } else {
      this.allStudents = [...this.initialStudents];
      this.tradesActivated=false
    }
  }

  onCheckboxChangeSocial(event: any) {
    this.isSocialFormSentFilter = event.target.checked;
    this.applyFilters();
  }

  onCheckboxChangeSubscriptions(event: any) {
    this.isSubscriptionFilter = event.target.checked;
    this.applyFilters();
  }

  onCheckboxChangeTrades(event: any, trade:string) {
    this.isTradeFilter = event.target.checked;
    this.applyFilters(trade);
  }

  onCheckboxChangeEndedTraining(event: any) {
    this.isQualifiedFilter = event.target.checked;
    this.applyFilters();
  }


}
