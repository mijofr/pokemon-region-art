export interface HasInfo {
    name: string;
    enumeratedName: string;
}

export interface TreeNode<T, U> {
	name: string;
	path: string[];
    metadata: U;
	children: TreeNode<T, U>[];
	items: T[];
}


export function cleanTree<T, V>(inp: TreeNode<T, V>) {
	for (let c of inp.children) {
		cleanTree(c);
	}
	inp.children = inp.children.filter(n => !(n.children.length === 0 && n.items.length === 0));
	return inp;
}

export function convertTree<T, U, V>(inp: TreeNode<T, V>, conv: (i: T) => U): TreeNode<U, V> {
	return {
		name: inp.name,
		path: inp.path.slice(),
		metadata: inp.metadata,
		items: inp.items.map(n => conv(n)),
		children: inp.children.map(n => convertTree(n, conv))
	};
}

export async function convertTreeAsync<T, U, V>(inp: TreeNode<T, V>, conv: (i: T) => Promise<U>): Promise<TreeNode<U, V>> {
	return {
		name: inp.name,
		path: inp.path.slice(),
		metadata: inp.metadata,
		items: await Promise.all(inp.items.map(async n => conv(n))),
		children: await Promise.all(inp.children.map(n => convertTreeAsync(n, conv)))
	};
}

export function applyToTree<T, V>(inp: TreeNode<T, V>, func: (i: TreeNode<T, V>) => void) {
	func(inp);
	inp.children.forEach(n => applyToTree(n, func));
}
export function applyToTreeItems<T, V>(inp: TreeNode<T, V>, func: (i: T) => void) {
	inp.items.forEach(n => func(n));
	inp.children.forEach(n => applyToTreeItems(n, func));
}

export function flattenTree<T, V>(inp: TreeNode<T, V>): T[] {
	return inp.items.concat(...inp.children.map(n => flattenTree(n)));
}

export function filterTree<T, V>(inp: TreeNode<T, V>, searchFunc: (value: T, index: number, array: T[]) => boolean, thisArg?: any): TreeNode<T, V> {
	return {
		name: inp.name,
		path: inp.path.slice(),
		metadata: inp.metadata,
		items: inp.items.filter(searchFunc, thisArg),
		children: inp.children.map(c => filterTree(c, searchFunc, thisArg))
	}
}


export function insertItemsToTree<T extends HasInfo, U>(tree: TreeNode<T, U>, itemsToAdd: T[], overwrite: boolean = false): void {
	for (let i of itemsToAdd) {
		let enCmp = i.enumeratedName.split("\\");
		enCmp = enCmp.slice(0, enCmp.length - 1);
		insertItemToTree(tree, i, enCmp, overwrite);

	}
}

function insertItemToTree<T extends HasInfo, U>(tree: TreeNode<T, U>, item: T, path: string[], overwrite: boolean = false) {
	if (path.length == 0) {

		//insert
		let existsIndex = tree.items.findIndex(n => n.name.toLocaleLowerCase() == item.name.toLocaleLowerCase());
		if (existsIndex >= 0) {
			let exists = tree.items[existsIndex];
			if (overwrite) {
				console.warn(`alias overwriting ${exists.enumeratedName}`);
				tree.items[existsIndex] = item;
			} else {
				console.warn(`alias cannot insert item that already exists: ${exists.enumeratedName}`);
			}
		} else {
			tree.items.push(item);
		}

	} else {
		let toFind = path[0].toLocaleLowerCase();
		let newPath = path.slice(1);
		let res = tree.children.filter((item) => item.name.toLocaleLowerCase() == toFind);
		if (res.length > 0) {
			insertItemToTree(res[0], item, newPath, overwrite)
		} else {
			console.error(`no child node ${toFind} on ${tree.path} for alias`);
		}
	}
}


let replacr = new RegExp("\\s", "g");
function nameSmash(inp: string): string {
	return inp.toLocaleLowerCase().trim().replace(replacr, "-");
}

export function SetEnumeratedNames<U>(inp: TreeNode<HasInfo, U>) {
	inp.items.forEach(n => {
		n.enumeratedName = (([] as string[]).concat(inp.path, [nameSmash(n.name)])).join("\\");
	});
	inp.children.forEach(c => {
		SetEnumeratedNames(c);
	});
}

