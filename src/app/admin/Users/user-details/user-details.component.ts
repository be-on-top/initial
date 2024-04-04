import { Component, OnInit } from '@angular/core';
import { UsersService } from '../../users.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ExternalsService } from '../../externals.service';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css']
})
export class UserDetailsComponent implements OnInit {

  userId: any;
  user: any


  userRouterLinks: any;
  title?: string
  linkBackToList: string = ""


  constructor(private service: UsersService, private ac: ActivatedRoute, private router: Router, private externalS: ExternalsService) {
    this.userId = this.ac.snapshot.params["id"];
    this.userRouterLinks = this.ac.snapshot.data;
    if (this.userRouterLinks.user == 'admin' && this.userRouterLinks.data == 'externals') {
      this.externalS.getExternal(this.userId).subscribe(data => {
        console.log('data de getExternal', data);
        this.user = data
        return this.user
      })
    }
    else {
      this.service.getUser(this.userId).subscribe(data => {
        console.log("data de getuser", data);
        this.user = data
        return this.user
      })
    }

  }

  ngOnInit(): void {
    if (this.userRouterLinks.user == "admin" && this.userRouterLinks.data == "referents") {
      // this.title = "Référents Administratifs"
      this.linkBackToList = "/admin/referents"
    }
    else if (this.userRouterLinks.user == "admin" && this.userRouterLinks.data == "editors") {
      this.title = "Contributeurs"
      this.linkBackToList = "/admin/editors"
    } else if (this.userRouterLinks.user == "admin" && this.userRouterLinks.data == "externals") {
      this.title = "Observateurs Externes"
      this.linkBackToList = "admin/externals"
    }
    // Responsable métiers
    else if (this.userRouterLinks.user == "admin" && this.userRouterLinks.data == "managers") {
      this.title = "Responsables métiers"
      this.linkBackToList = "admin/managers"
    }
  }

// Responsable métiers

  deleteUser(userid: string) {
    console.log(userid);

    this.service.deleteUser(userid)
    this.router.navigate(['/admin/users'])
  }



}
