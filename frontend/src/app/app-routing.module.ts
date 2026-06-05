import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { ProductsComponent } from './components/products/products.component';
import { RegisterComponent } from './components/register/register.component';
import { ViewProductComponent } from './components/view-product/view-product.component';
import { UserGuard } from './guards/user.guard';

const routes: Routes = [
  {path: '', component: HomeComponent}, //RUTA POR DEFAULT | LA PRIMERA VISTA
  {path: 'home', component: HomeComponent}, //RUTAS NORMALES
  {path: 'login', component: LoginComponent}, //RUTAS NORMALES 1+
  {path: 'register', component: RegisterComponent},
  {path: 'products', canActivate: [UserGuard], component: ProductsComponent},
  {path: 'viewProduct/:idP', component: ViewProductComponent},
  {path: '**', component: NotFoundComponent} //PATH DE EXEPCIÓN | 404
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
