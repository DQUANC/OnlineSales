import { Component, OnInit } from '@angular/core';
import { UserModel } from 'src/app/models/user.model';
import { UserRestService } from 'src/app/services/userRest/user-rest.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  user:UserModel;
  repeatPass: string = '';
  timer:any;

  constructor(
    private userRest: UserRestService,
    private router: Router
  ) { 
    this.user = new UserModel('', '', '', '', '', '', '', '');
  }

  ngOnInit(): void {
  }

  //TODOS LOS MÉTODOS QUE CREAMOS VAN DESPUÉS del ngOnInit();

  async checkPass(){
    clearTimeout(this.timer);
    this.timer = await setTimeout(()=>{
      if(this.repeatPass != this.user.password){
        alert('Password doesnt match');
        clearTimeout(this.timer);
      }else{
        alert('Password match');
        clearTimeout(this.timer);
      }
    }, 1000)
  }

  /* 
    MÉTODO DE PRUEBA
  register(){
    this.userRest.prueba().subscribe((res:any)=>{
      alert(res.message);
    })
    console.log(this.user, this.repeatPass);
  }*/

  register(registerForm:any){
    this.userRest.register(this.user).subscribe({
      next: (response:any)=>{
        alert(response.message);
        return this.router.navigateByUrl('/login');
      },
      error: (err)=> {
        registerForm.reset();
        return alert(err.error.message || err.error);
      }
    })
  }

}
