import { Container } from 'pixi.js';
import { Layout } from '../Layout';
import { getFlexDirection, getFlexWrap } from '../utils/helpers';
import { JustifyContent } from '../utils/types';

type Items = Container[];

export class FlexAlignController {
	private root: Layout;
	private items: Items = [];

	constructor(root: Layout, items?: Items) {
		this.root = root;

		if (items) {
			this.items = items;
		}
	}

	add(items: Items | Container) {
		if (Array.isArray(items)) {
			items.forEach((item) => this.items.push(item));
		} else {
			this.items.push(items);
		}
	}

	update() {
		const flexDirection =
			this.root.options?.styles?.flexDirection ??
			getFlexDirection(this.root.options?.styles?.flexFlow);

		switch (flexDirection) {
			case 'row':
				this.alignFlexRow(this.items);
				break;
			case 'row-reverse':
				this.alignFlexRow(this.items.slice().reverse());
				break;
			case 'column':
				this.alignFlexColumn(this.items);
				break;
			case 'column-reverse':
				this.alignFlexColumn(this.items.slice().reverse());
				break;
			default:
				throw new Error('Invalid flex-direction value');
		}
	}

	private alignFlexColumn(items: Items) {
		let y = 0;

		items.forEach((child) => {
			child.y = y;
			y += child.height;
		});
	}

	private alignFlexRow(items: Items) {
		const flexWrap =
			this.root.options?.styles?.flexWrap ??
			getFlexWrap(this.root.options?.styles?.flexFlow);

		const justifyContent = this.root.options?.styles?.justifyContent;

		switch (flexWrap) {
			case 'wrap-reverse':
				this.alignRowReverse(items, justifyContent);
				break;
			case 'wrap':
				this.alignRowWrap(items, justifyContent);
				break;
			default: // nowrap
				this.alignNowrap(items, justifyContent);
				break;
		}
	}

	private alignRowWrap(items: Items, justifyContent: JustifyContent) {
		switch (justifyContent) {
			case 'flex-start':
			case 'start':
			case 'left':
			default:
				this.alignRowWrapStart(items);
				break;
			case 'flex-end':
			case 'end':
			case 'right':
				this.alignRowWrapEnd(items);
				break;
			case 'center':
				this.alignRowWrapCenter(items);
				break;
			case 'space-between':
				this.alignRowWrapSpaceBetween(items);	
				break;
			case 'space-around':
				this.alignRowWrapSpaceAround(items);	
				break;
			case 'space-evenly':
				this.alignRowWrapSpaceEvenly(items);
				break;
			case 'stretch':
				// TODO
				break;
			}
	}

	private alignRowWrapStart(items: Items) {
		let maxChildHeight = 0;
		let x = 0;
		let y = 0;
		
		items.forEach((child) => {
			child.x = x;
			child.y = y;

			if (x + child.width > this.root.width) {
				x = child.width;
				y += maxChildHeight;

				maxChildHeight = 0;

				child.x = 0;
				child.y = y;
			} else {
				x += child.width;
			}

			if (child.height > maxChildHeight) {
				maxChildHeight = child.height;
			}
		});
	}

	private alignRowWrapEnd(items: Items) {
		let maxChildHeight = 0;
		let x = 0;
		let y = 0;
		let firstLineElementID = 0;

		items.forEach((child, id) => {
			child.x = x;
			child.y = y;

			if (x + child.width > this.root.width) {
				const offset = this.root.width - x;
				
				for (let i = firstLineElementID; i <= id; i++) {
					items[i].x += offset;
				}

				firstLineElementID = id;
				
				x = child.width;
				y += maxChildHeight;

				maxChildHeight = 0;

				child.x = 0;
				child.y = y;
			} else {
				x += child.width;
			}

			if (child.height > maxChildHeight) {
				maxChildHeight = child.height;
			}
		});

		const offset = this.root.width - x;
				
		for (let i = firstLineElementID; i <= items.length - 1; i++) {
			items[i].x += offset;
		}
	}

	private alignRowWrapCenter(items: Items) {
		let maxChildHeight = 0;
		let x = 0;
		let y = 0;
		let firstLineElementID = 0;

		items.forEach((child, id) => {
			child.x = x;
			child.y = y;

			if (x + child.width > this.root.width) {
				const offset = (this.root.width - x) / 2;
				
				for (let i = firstLineElementID; i <= id; i++) {
					items[i].x += offset;
				}

				firstLineElementID = id;
				x = child.width;
				y += maxChildHeight;

				maxChildHeight = 0;

				child.x = 0;
				child.y = y;
			} else {
				x += child.width;
			}

			if (child.height > maxChildHeight) {
				maxChildHeight = child.height;
			}
		});

		const offset = (this.root.width - x) / 2;
				
		for (let i = firstLineElementID; i <= items.length - 1; i++) {
			items[i].x += offset;
		}
	}

	private alignRowWrapSpaceBetween(items: Items) {
		let maxChildHeight = 0;
		let x = 0;
		let y = 0;
		let firstLineElementID = 0;

		items.forEach((child, id) => {
			child.x = x;
			child.y = y;

			if (x + child.width > this.root.width) {
				const space = this.root.width - x;
				const lineAmount = id - firstLineElementID - 1;
				let number = 0;

				for (let i = firstLineElementID; i <= id; i++) {
					items[i].x += (space / lineAmount) * number;
					number++;
				}

				firstLineElementID = id;

				x = child.width;
				y += maxChildHeight;

				child.x = 0;
				child.y = y;

				maxChildHeight = 0;

			} else {
				x += child.width;
			}

			if (child.height > maxChildHeight) {
				maxChildHeight = child.height;
			}
		});

		const id = items.length - 1;
		const space = this.root.width - x;
		const lineAmount = id - firstLineElementID;
		let number = 0;

		for (let i = firstLineElementID; i <= id; i++) {
			items[i].x += (lineAmount > 0 ? (space / lineAmount) : space) * number;
			number++;
		}
	}
	
	private alignRowWrapSpaceAround(items: Items) {
		let maxChildHeight = 0;
		let x = 0;
		let y = 0;
		let firstLineElementID = 0;

		items.forEach((child, id) => {
			child.x = x;
			child.y = y;

			if (x + child.width > this.root.width) {
				const space = this.root.width - x;
				const lineAmount = id - firstLineElementID;
				let tmpX = 0;

				for (let i = firstLineElementID; i <= id; i++) {
					items[i].x = tmpX + space / 2 / lineAmount;
					tmpX += items[i].width + space / lineAmount;
				}

				firstLineElementID = id;

				x = child.width;
				y += maxChildHeight;

				child.x = 0;
				child.y = y;

				maxChildHeight = 0;

			} else {
				x += child.width;
			}

			if (child.height > maxChildHeight) {
				maxChildHeight = child.height;
			}
		});

		const id = items.length - 1;
		const space = this.root.width - x;
		const lineAmount = id - firstLineElementID + 1;
		let tmpX = 0;

		for (let i = firstLineElementID; i <= id; i++) {
			items[i].x = tmpX + space / 2 / lineAmount;
			tmpX += items[i].width + space / lineAmount;
		}
	}

	private alignRowWrapSpaceEvenly(items: Items) {
		let maxChildHeight = 0;
		let x = 0;
		let y = 0;
		let firstLineElementID = 0;

		items.forEach((child, id) => {
			child.x = x;
			child.y = y;

			if (x + child.width > this.root.width) {
				const space = this.root.width - x;
				const lineAmount = id - firstLineElementID;
				let tmpX = 0;

				for (let i = firstLineElementID; i <= id; i++) {
					items[i].x = tmpX + space / (lineAmount + 1);
					tmpX += items[i].width + space / (lineAmount + 1);
				}

				firstLineElementID = id;

				x = child.width;
				y += maxChildHeight;

				child.x = 0;
				child.y = y;

				maxChildHeight = 0;

			} else {
				x += child.width;
			}

			if (child.height > maxChildHeight) {
				maxChildHeight = child.height;
			}
		});

		const id = items.length - 1;
		const space = this.root.width - x;
		const lineAmount = id - firstLineElementID + 1;
		let tmpX = 0;

		for (let i = firstLineElementID; i <= id; i++) {
			items[i].x = tmpX + space / (lineAmount + 1);
			tmpX += items[i].width + space / (lineAmount + 1);
		}
	}

	private alignRowReverse(items: Items, justifyContent: JustifyContent) {
		let maxChildHeight = 0;
		let x = 0;
		let y = 0;
		let currentRow = 0;

		const rows: Array<Items> = [];
		rows[currentRow] = [];

		items.forEach((child) => {
			child.x = x;

			if (x + child.width > this.root.width) {
				x = child.width;
				y += maxChildHeight;

				maxChildHeight = 0;

				child.x = 0;

				currentRow++;

				rows[currentRow] = [];
				rows[currentRow].push(child);
			} else {
				x += child.width;
				rows[currentRow].push(child);
			}

			if (child.height > maxChildHeight) {
				maxChildHeight = child.height;
			}
		});

		const maxHeight: number[] = [0];

		rows.reverse().forEach((row, rowID) => {
			maxHeight[rowID + 1] = 0;

			row.forEach((child) => {
				child.y = maxHeight[rowID];

				if (maxHeight[rowID + 1] < child.height) {
					maxHeight[rowID + 1] = child.height;
				}
			});
		});
	}

	private alignNowrap(items: Items, justifyContent: JustifyContent) {
		let x = 0;

		const totalWidth = items.reduce((acc, child) => acc + child.width, 0);
		const offset = (this.root.width - totalWidth) / 2;
		const space = this.root.width - totalWidth;

		switch (justifyContent) {
			case 'flex-start':
			case 'start':
			case 'left':
			default:
				items.forEach((child) => {
					child.x = x;
					x += child.width;
				});
				break;
			case 'flex-end':
			case 'end':
			case 'right':
				items.slice().reverse().forEach((child) => {
					child.x = this.root.width - x - child.width;
					x += child.width;
				});
				break;
			case 'center':
				items.forEach((child) => {
					child.x = x + offset;
					x += child.width;
				});
				break;
			case 'space-between':
				items.forEach((child) => {
					child.x = x;
					x += child.width + space / (items.length - 1);
				});
				break;
			case 'space-around':
				items.forEach((child) => {
					child.x = x + space / 2 / items.length;
					x += child.width + space / items.length;
				});
				break;
			case 'space-evenly':
				items.forEach((child) => {
					child.x = x + space / (items.length + 1);
					x += child.width + space / (items.length + 1);
				});
				break;
			case 'stretch':
				// TODO
				break;
			}
	}
}
