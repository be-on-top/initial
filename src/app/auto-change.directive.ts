// Directives
// import { Directive, HostListener, Input } from '@angular/core';
// import { SocialFormComponent } from './social/social-form/social-form.component';

// @Directive({
//   selector: '[appAutoChange]'
// })
// export class AutoChangeDirective {
//   @Input() fieldName!: string;

//   // j'adore, ça ça ressemble à du javascript modulaire ! 
//   constructor( private component:SocialFormComponent) { }

//   @HostListener('change', ['$event.target.value'])
//   onChange(value: any) {
//     // Déclenche la fonction onInputChange avec le nom du champ et la nouvelle valeur
//     this.component.onInputChange(this.fieldName, value);
//   }
  

// }
// Directives
// Directive
import { Directive, ElementRef, HostListener } from '@angular/core';
import { SocialFormComponent } from './social/social-form/social-form.component';

@Directive({
  selector: '[appAutoChange]'
})
export class AutoChangeDirective {
  constructor(private el: ElementRef, private component: SocialFormComponent) { }

  @HostListener('change', ['$event.target.value'])
  onChange(value: any) {
    const fieldName = this.el.nativeElement.name;
    // Déclenche la fonction onInputChange du composant avec le nom du champ et la nouvelle valeur
    this.component.onInputChange(fieldName, value);
  }
}
