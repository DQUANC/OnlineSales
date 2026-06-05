import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { UserRestService } from '../services/userRest/user-rest.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserGuard implements CanActivate {

  constructor(
    private userRest: UserRestService,
    public router: Router
  ){}

  canActivate(){ // boolano -> true/false
    if(this.userRest.getIdentity().role == 'CLIENT' ||
       this.userRest.getIdentity().role == 'ADMIN'){
      return true;
    }else{
      this.router.navigateByUrl('/login');
      return false;
    }
  }
  
}
