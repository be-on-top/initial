import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-full-details',
  templateUrl: './full-details.component.html',
  styleUrls: ['./full-details.component.css']
})
export class FullDetailsComponent {

  @Input() q: any;

}
