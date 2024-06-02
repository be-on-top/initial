import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';

export const historyGuard = (): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree => {
  const router = inject(Router);
  const navigation = router.getCurrentNavigation();
  
  if (navigation?.trigger === 'popstate') {
    // Si la navigation a été déclenchée par le bouton de retour
    console.warn('Navigation from browser history detected, access denied.');
    // Optionnel : redirige vers une autre page
    router.navigate(['/home']);
    return false;
  }
  
  return true;
}