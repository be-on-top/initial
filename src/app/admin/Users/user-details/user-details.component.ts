import { Component } from '@angular/core';
import { UsersService } from '../../users.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css']
})
export class UserDetailsComponent {

  userId:any;
  user:any

  constructor(private service:UsersService, private ac:ActivatedRoute, private router:Router){
    this.userId=this.ac.snapshot.params["id"];
    this.service.getUser(this.userId).subscribe(data=>{
      console.log("data de getuser", data);
      this.user=data
      return this.user      
    })

  }

  deleteUser(userid:string){
    console.log(userid);
    
    this.service.deleteUser(userid)
    this.router.navigate(['/admin/users'])
  } 

}
