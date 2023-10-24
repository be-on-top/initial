import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  confirm(message: string): boolean {
    return window.confirm(message);
  }
  
}
