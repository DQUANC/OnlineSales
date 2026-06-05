import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { UserRestService } from '../userRest/user-rest.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryRestService {
  httpOptions = new HttpHeaders()
    .set('Content-Type', 'application/json')
    .set('Authorization', this.userRest.getToken());

  constructor(
    private http: HttpClient,
    private userRest: UserRestService
  ) { }

  getCategorys(){
    return this.http.get(environment.baseUrl + 'category/categorys', {headers: this.httpOptions});
  }
}
