import { Component, OnInit } from '@angular/core';
import { ProductRestService } from 'src/app/services/productRest/product-rest.service';
import { CategoryRestService } from 'src/app/services/categoryRest/category-rest.service';
import { ProductModel } from 'src/app/models/product.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  products:any;
  categorys:any;
  product: ProductModel;
  productUpdate:any;
  search:any;

  constructor(
    private productRest: ProductRestService,
    private categoryRest: CategoryRestService
  ) { 
    this.product = new ProductModel('','','', 0, 0, 0, '');
  }

  ngOnInit(): void {
    this.getProducts();
    this.getCategorys();
  }

  getProducts(){
    this.productRest.getProducts().subscribe({
      next: (res:any)=> this.products = res.products,
      error: (err)=> alert(err.error.message)
    })
  }

  getCategorys(){
    this.categoryRest.getCategorys().subscribe({
      next: (res:any)=> this.categorys = res.categorys,
      error: (err)=> console.log(err)
    })
  }

  saveProduct(addProductForm:any){
    this.productRest.saveProduct(this.product).subscribe({
      next: (res:any)=> {
        alert(res.message);
        this.getProducts();
        //resetear un solo input -> this.product.name = '';
        addProductForm.reset();
      },
      error: (err)=> alert(err.error.message || err.error)
    })
  }

  getProduct(id:string){
    this.productRest.getProduct(id).subscribe({
      next: (res:any)=> this.productUpdate = res.product,
      error: (err)=> alert(err.error.message)
    })
  }

  updateProduct(){
    this.productUpdate.sales = undefined;
    this.productRest.updateProduct(this.productUpdate._id, this.productUpdate).subscribe({
      next: (res:any)=> {
        alert(res.message);
        this.getProducts();
      },
      error: (err)=> alert(err.error.message || err.error)
    })
  }

  deleteProduct(id:string){
    this.productRest.deleteProduct(id).subscribe({
      next: (res:any)=> {
        Swal.fire({
          title: res.message + ' ' + res.productDeleted.name,
          position: 'center',
          icon: 'success',
          showConfirmButton: false,
          timer: 2000
        });
        this.getProducts();
      },
      error: (err)=> Swal.fire({
        title: err.error.message,
        position: 'center',
        icon: 'error',
        timer: 4000
      })
    })
  }

}
