import { Component } from '@angular/core';
import { Centers } from '../../centers';
import { CentersService } from '../../centers.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-center-details',
  templateUrl: './center-details.component.html',
  styleUrls: ['./center-details.component.css']
})
export class CenterDetailsComponent {

  centerId:any;
  center?:Centers

  constructor(private service:CentersService, private ac:ActivatedRoute, private router:Router){
    this.centerId=this.ac.snapshot.params["id"];
    this.service.getCenter(this.centerId).subscribe(data=>{
      console.log("data de getCenter", data);
      this.center=data
      return this.center     
    })

  }

}
