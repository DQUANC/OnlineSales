import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'search'
})
export class SearchPipe implements PipeTransform {

  transform(products:any, search:any){
    if(search == undefined){
      return products;
    }else{
      return products.filter( (product:any) => {
        return product.name.toLowerCase().includes(search.toLowerCase())
      })
    }
  }
}
