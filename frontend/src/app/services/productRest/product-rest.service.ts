import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { UserRestService } from '../userRest/user-rest.service';

@Injectable({
  providedIn: 'root'
})
export class ProductRestService {
  httpOptions = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': this.userRest.getToken()
  })

  constructor(
    private http: HttpClient,
    private userRest: UserRestService
  ) { }

  getProducts(){
    return this.http.get(environment.baseUrl + 'product/getProducts', {headers: this.httpOptions});
  }
  
  saveProduct(params:{}){
    return this.http.post(environment.baseUrl + 'product/saveProduct', params, {headers: this.httpOptions});
  }

  getProduct(id:string){
    return this.http.get(environment.baseUrl + 'product/getProduct/' + id, {headers: this.httpOptions});
  }

  updateProduct(id:string, params:{}){
    return this.http.put(environment.baseUrl + 'product/updateProduct/' + id, params, {headers: this.httpOptions});
  }

  deleteProduct(id:string){
    return this.http.delete(environment.baseUrl + 'product/deleteProduct/' + id, {headers: this.httpOptions});
  }
}
