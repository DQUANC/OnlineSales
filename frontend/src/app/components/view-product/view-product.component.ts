import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductRestService } from 'src/app/services/productRest/product-rest.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-product',
  templateUrl: './view-product.component.html',
  styleUrls: ['./view-product.component.css']
})
export class ViewProductComponent implements OnInit {
  idProduct:any;
  product:any;

  constructor(
    public activatedRoute: ActivatedRoute,
    private productRest: ProductRestService
  ) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((idP:any)=>{
      this.idProduct = idP.get('idP');
    });
    this.getProduct();
  }

  getProduct(){
    this.productRest.getProduct(this.idProduct).subscribe({
      next: (res:any)=> this.product = res.product,
      error: (err)=> Swal.fire({
        title: err.error.message,
        icon: 'error',
        timer: 3000
      })
    })    
  }

}
