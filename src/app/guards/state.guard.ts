import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  UrlTree
} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class StateGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    
    let state = this.auth.getCurrentUser()?.estado;

    if(state!==true){
      alert("Usuario inactivo")
    }

    return state === true
      ? true
      : this.router.parseUrl('/login');
  }
}
