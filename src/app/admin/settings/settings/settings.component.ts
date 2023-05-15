import { Component } from '@angular/core';
import { Trades } from '../../trades';
import { NgForm } from '@angular/forms';
import { SettingsService } from '../../settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  sigles:Trades={trade:{sigle:"", denomination:""}, competences:[{cpName:"", cpResume:""}]}


  //  dans un premier temps, on peut ne leur donner qu'un nom. l'important étant de savoir à combien les catégories métiers s'élèveront pour pouvoir  prévoir
  // 1 - autant de zones éditables sur la  page d'accueil
  // 2 - rattacher le décompte des questions à une catégorie et non un tronc commun

  constructor(private service:SettingsService){}

  addSettings(form:NgForm){
    console.log(form);
    this.service.addTrade(form.value)

    
  }



}
