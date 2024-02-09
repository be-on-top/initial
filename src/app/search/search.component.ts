import { Component, EventEmitter, Output, Input } from '@angular/core';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {
  // @Input() searchText: string='';

  enteredSearchValue:string='';
  @Output() searchTextChanged: EventEmitter<string>=new EventEmitter<string>();

  onSearchTextChanged(){
    this.searchTextChanged.emit(this.enteredSearchValue)
  }



}
