import './scss/styles.scss';
import { CDN_URL, API_URL } from './utils/constants';
import { EventEmitter } from './components/base/events';
import { ApiModel } from './components/Model/ApiModel';
import { DataModel } from './components/Model/DataModel';
import { Card } from './components/View/Card';
import { CardPreview } from './components/View/CardPreview';
import { IOrderForm, IProductItem } from './types';
import { Modal } from './components/View/Modal';
import { ensureElement } from './utils/utils';
import { BasketModel } from './components/Model/BasketModel';
import { Basket } from './components/View/Basket';
import { BasketItem } from './components/View/BasketItem';
import { FormModel } from './components/Model/FormModel';
import { Order } from './components/View/FormOrder';
import { Contacts } from './components/View/FormContacts';
import { Success } from './components/View/Success';

const cardCatalogTemplate = document.querySelector(
	'#card-catalog'
) as HTMLTemplateElement;
const cardPreviewTemplate = document.querySelector(
	'#card-preview'
) as HTMLTemplateElement;
const basketTemplate = document.querySelector('#basket') as HTMLTemplateElement;
const cardBasketTemplate = document.querySelector(
	'#card-basket'
) as HTMLTemplateElement;
const orderTemplate = document.querySelector('#order') as HTMLTemplateElement;
const contactsTemplate = document.querySelector(
	'#contacts'
) as HTMLTemplateElement;
const successTemplate = document.querySelector(
	'#success'
) as HTMLTemplateElement;

const apiModel = new ApiModel(CDN_URL, API_URL);
const events = new EventEmitter();
const dataModel = new DataModel(events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
const basket = new Basket(basketTemplate, events);
const basketModel = new BasketModel();
const formModel = new FormModel(events);
const order = new Order(orderTemplate, events);
const contacts = new Contacts(contactsTemplate, events);

// Отображения карточек товара на странице
events.on('productCards:receive', () => {
	dataModel.productCards.forEach((item) => {
		const card = new Card(cardCatalogTemplate, events, {
			onClick: () => events.emit('card:select', item),
		});
		ensureElement<HTMLElement>('.gallery').append(card.render(item));
	});
});

// Получить объект данных "IProductItem" карточки по которой кликнули
events.on('card:select', (item: IProductItem) => {
	dataModel.setPreview(item);
});

// Открываем модальное окно товара *
events.on('modalCard:open', (item: IProductItem) => {
	const cardPreview = new CardPreview(cardPreviewTemplate, events);
	modal.content = cardPreview.render(item);
	modal.render();
});

// Открытие модального окна корзины
events.on('basket:open', () => {
	modal.content = basket.render();
	modal.render();
});

// Добавление товара в корзину
events.on('card:addBasket', () => {
	basketModel.setSelectedСard(dataModel.selectedСard);
	events.emit('basket:change');
	modal.close();
});

// Удаление товара из корзины
events.on('basket:basketItemRemove', (item: IProductItem) => {
	basketModel.deleteCardToBasket(item);
	events.emit('basket:change');
});

events.on('basket:change', () => {
	basket.renderHeaderBasketCounter(basketModel.getCounter());
	renderBasketContent();
});

function renderBasketContent() {
	basket.renderSumAllProducts(basketModel.getSumAllProducts());

	basket.items = basketModel.basketProducts.map((item, index) => {
		const basketItem = new BasketItem(cardBasketTemplate, events, {
			onClick: () => events.emit('basket:basketItemRemove', item),
		});
		return basketItem.render(item, index + 1);
	});

	modal.content = basket.render();
	modal.render();
}

// Открытие модального окна "способа оплаты" и "адреса доставки"
events.on('order:open', () => {
	modal.content = order.render();
	modal.render();
	formModel.items = basketModel.basketProducts.map((item) => item.id);
});

events.on('order:paymentSelection', (button: HTMLButtonElement) => {
	formModel.payment = button.name;
});

// Отслеживаем изменение в поле ввода адреса доставки"
events.on(`order:changeAddress`, (data: { field: string; value: string }) => {
	formModel.setOrderAddress(data.field, data.value);
});

// Валидация данных "address" и payment
events.on('formErrors:address', (errors: Partial<IOrderForm>) => {
	const { address, payment } = errors;
	order.valid = !address && !payment;
	order.formErrors.textContent = Object.values({ address, payment })
		.filter((i) => !!i)
		.join('; ');
});

// Открытие модального окна Email и Телефон
events.on('contacts:open', () => {
	formModel.total = basketModel.getSumAllProducts();
	modal.content = contacts.render();
	modal.render();
});

// Отслеживаем изменение в полях вода Email и Телефон
events.on(`contacts:changeInput`, (data: { field: string; value: string }) => {
	formModel.setOrderData(data.field, data.value);
});

// Валидация данных Email и Телефон
events.on('formErrors:change', (errors: Partial<IOrderForm>) => {
	const { email, phone } = errors;
	contacts.valid = !email && !phone;
	contacts.formErrors.textContent = Object.values({ phone, email })
		.filter((i) => !!i)
		.join('; ');
});

events.on('success:open', () => {
	apiModel
		.postOrderLot(formModel.getOrderLot())
		.then((data) => {
			console.log(data);
			const success = new Success(successTemplate, events);
			modal.content = success.render(basketModel.getSumAllProducts());
			basketModel.clearBasketProducts();
			basket.renderHeaderBasketCounter(basketModel.getCounter());
			modal.render();
		})
		.catch((error) => console.log(error));
});

events.on('success:close', () => modal.close());

events.on('modal:open', () => {
	modal.locked = true;
});

events.on('modal:close', () => {
	modal.locked = false;
});

apiModel
	.getListProductCard()
	.then(function (data: IProductItem[]) {
		dataModel.productCards = data;
	})
	.catch((error) => console.log(error));
