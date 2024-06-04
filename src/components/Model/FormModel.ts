import { IEvents } from '../base/events';

export interface IFormModel {
	payment: string;
	email: string;
	phone: string;
	address: string;
	total: number;
	items: string[];
	setOrderAddress(field: string, value: string): void;
	setOrderData(field: string, value: string): void;
	getOrderLot(): object;
}

export class FormModel implements IFormModel {
	payment: string;
	email: string;
	phone: string;
	address: string;
	total: number;
	items: string[];

	constructor(protected events: IEvents) {
		this.payment = '';
		this.email = '';
		this.phone = '';
		this.address = '';
		this.total = 0;
		this.items = [];
	}

	// принимаем значение "address"
	setOrderAddress(field: string, value: string) {
		if (field === 'address') {
			this.address = value;
		}

		this.events.emit('order:ready', this.getOrderLot());
	}

	// принимаем значение данных "Email" и "Телефон"
	setOrderData(field: string, value: string) {
		if (field === 'email') {
			this.email = value;
		} else if (field === 'phone') {
			this.phone = value;
		}

		this.events.emit('order:ready', this.getOrderLot());
	}

	getOrderLot() {
		return {
			payment: this.payment,
			email: this.email,
			phone: this.phone,
			address: this.address,
			total: this.total,
			items: this.items,
		};
	}
}
