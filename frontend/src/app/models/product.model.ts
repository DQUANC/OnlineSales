export class ProductModel{
    constructor(
        public id: string,
        public name: string,
        public description: string,
        public price: number,
        public stock: number,
        public sales: number,
        public category: string
    ){}
}