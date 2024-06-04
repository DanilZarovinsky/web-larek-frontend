import { IProductItem } from "../../types";

export interface IBasketModel {
  basketProducts: IProductItem[];
  getCounter: () => number;
  getSumAllProducts: () => number;
  setSelectedСard(data: IProductItem): void;
  deleteCardToBasket(item: IProductItem): void;
  clearBasketProducts(): void
}

export class BasketModel implements IBasketModel {
  // список карточек товара в корзине
  protected _basketProducts: IProductItem[]; 

  constructor() {
    this._basketProducts = [];
  }

  set basketProducts(data: IProductItem[]) {
    this._basketProducts = data;
  }

  get basketProducts() {
    return this._basketProducts;
  }

  // количество товара
  getCounter() {
    return this.basketProducts.length;
  }

  // сумма товаров 
  getSumAllProducts() {
    let sumAll = 0;
    this.basketProducts.forEach(item => {
      sumAll = sumAll + item.price;
    });
    return sumAll;
  }

  // добавить товар в корзину
  setSelectedСard(data: IProductItem) {
    this._basketProducts.push(data);
  }

  // удалить товар из корзины
  deleteCardToBasket(item: IProductItem) {
    const index = this._basketProducts.indexOf(item);
    if (index >= 0) {
      this._basketProducts.splice(index, 1);
    }
  }
  // очистить корзину
  clearBasketProducts() {
    this.basketProducts = []
  }
}