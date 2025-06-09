import { Component, OnInit } from '@angular/core';
import { UsersService } from '../../users.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ExternalsService } from '../../externals.service';
import { Users } from '../users';
import { Subscription } from 'rxjs';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css']
})
export class UserDetailsComponent implements OnInit {

  userId: any;
  user?: Users


  userRouterLinks: any;
  title?: string
  linkBackToList: string = ""

  permimeter: string = ""

  private authSubscription: Subscription | undefined;
  userRole: string | string[] | null = null;
  userUid: string = "";

  studentsList:any=[]


  constructor(
    private service: UsersService,
    private ac: ActivatedRoute,
    private router: Router,
    private externalS: ExternalsService,
    private authService:AuthService
  ) {
    this.userId = this.ac.snapshot.params["id"];
    this.userRouterLinks = this.ac.snapshot.data;
    // if (this.userRouterLinks.user == 'admin' && this.userRouterLinks.data == 'externals') {
    //   this.externalS.getExternal(this.userId).subscribe(data => {
    //     console.log('data de getExternal', data);
    //     this.user = data
    //     return this.user
    //   })
    // }
    // else {
    this.service.getUser(this.userId).subscribe((data: Users) => {
      // console.log("data de getuser !!!!", data);
      this.user = data
      if (this.user.geographicScope) {
        if (this.user.geographicScope = 'regional') {
          this.permimeter = "Régional"
        } if (this.user.geographicScope = "departmental") {
          this.permimeter = "Départemental"
        } else {
          this.permimeter = "Local"
        }
    // Vérification si des étudiants sont associés au contact
      if (this.userRole == 'referent' && this.user.students) {
        let list: string[] = [];

        // On attend que tous les abonnements des étudiants soient terminés
        this.user.students.forEach((student: any) => {
          this.service.getLinkedStudentName(student).subscribe(dataStudent => {
            // list.push(dataStudent.lastName);
            list.push(dataStudent.lastName + " " + dataStudent.firstName);
            this.studentsList=[...new Set(list)];
            // console.log('Liste des étudiants sans doublons:', this.studentsList)
          })
        })}
        // fin de la boucle pour les candidats potentiellement attribués
      }
      return this.user
    })
    // }

  }

  ngOnInit(): void {
    if (this.userRouterLinks.user == "admin" && this.userRouterLinks.data == "referents") {
      // this.title = "Référents Administratifs"
      this.linkBackToList = "/admin/referents"
    }
    else if (this.userRouterLinks.user == "admin" && this.userRouterLinks.data == "editors") {
      this.title = "Contributeur"
      this.linkBackToList = "/admin/editors"
    } else if (this.userRouterLinks.user == "admin" && this.userRouterLinks.data == "externals") {
      this.title = "Observateur Externe"
      this.linkBackToList = "/admin/externals"
    }
    // Responsable métiers
    else if (this.userRouterLinks.user == "admin" && this.userRouterLinks.data == "managers") {
      this.title = "Responsable métier"
      this.linkBackToList = "/admin/managers"
    }

    // pour pouvoir utiliser la même route initiale par moment
    this.authSubscription = this.authService.getCurrentUserInfo().subscribe(userInfo => {
      this.userRole = userInfo?.role ?? null;
      this.userUid = userInfo?.uid ?? "";
    });   


  }


  deleteUser(userid: string) {
    console.log(userid);

    this.service.deleteUser(userid)
    this.router.navigate(['/admin/users'])
  }



}
