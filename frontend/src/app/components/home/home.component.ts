import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  proyect:string = 'ONLINE_SALES';
  products = [
    {name: 'Teléfono', price: 1000, brand: 'Motorola'},
    {name: 'Televisión', price: 1500, brand: 'LG'}
  ];
  IVA = 30;
  private model:string = '2018';
  name = 'Maria';
  num = 0;

  username = 'MARIA';

  constructor() { } //inicalizaban propiedades, var...

  ngOnInit(): void { //Ciclo de vida de un componente de Angular
  }

  getModel():string {
    return this.model;
  }

  verInfo(){
    console.log(++this.num);
  }
  restar(event:Event){
    console.log(--this.num);
  }
  verUsername(){
    console.log(this.username);
  }

}
