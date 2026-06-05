import { Component, OnInit } from '@angular/core';
import { UserRestService } from 'src/app/services/userRest/user-rest.service';

@Component({
  selector: 'navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  token:any;
  role:any;
  identity:any;

  constructor(
    public userRest: UserRestService
  ) { }

  ngOnInit(): void { //Cliclo de vida del componente | 1ro ejcutarse
                    // ngDoCheck -> parte del ciclo de vida (validaciones)
                    //ngDoChange -> parte del ciclo de vida (cambios de propiedades)
    this.identity = this.userRest.getIdentity().role;
    this.token = this.userRest.getToken();
    
  }

}