import { Component } from '@angular/core';
import { ExternalsService } from '../../externals.service';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-external-details',
  templateUrl: './external-details.component.html',
  styleUrls: ['./external-details.component.css']
})
export class ExternalDetailsComponent {

  externalId: string = "";
  // @Input() student: Student;
  // student: any = {};
  external: any = {};
  // @Output() deleteStudent = new EventEmitter<Student>();


  lastIndex: number = 0
  // pour afficher si on garde cette option fullResults à l'administrateur
  userRouterLinks: any
 
  constructor(
    private service: ExternalsService,
    private route: ActivatedRoute,
  ) {

    this.userRouterLinks = this.route.snapshot.data;
  }

  ngOnInit() {
    this.externalId = this.route.snapshot.params['id']
    if (!this.externalId) {
      console.error('studentId is undefined.')
      return;
    }
    this.getExternalDetails(this.externalId)
    this.getUsers()
  }

  getExternalDetails(externalId: string) {
    this.service.getExternal(externalId).subscribe(student => {
      this.external = student
      /* console.log(studentId); */

    })

  }

  delete(external: any) {
    /* console.log(student);   */
    this.service.deleteExternal(external)
  }

  // Fonction pour obtenir les entrées d'un objet
  objectEntries(obj: any): [string, any][] {
    return Object.entries(obj);
  }

  getUsers() {
    if (this.userRouterLinks.user == "external") {
      alert("C'est un formateur !!!")
    }
    else if (this.userRouterLinks.user == "admin") {
      alert("C'est un super administrateur !!!")
    }
  }




}
