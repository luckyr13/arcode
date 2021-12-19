import { FileTreeFolder } from './interfaces/FileTreeFolder';
import { EditorMetadata } from './interfaces/EditorMetadata';

export class FileTree
{
	private _tree: FileTreeFolder = {
		name: '',
		children: [],
		type: 'FOLDER'
	};

	constructor() {

	}

	private _breakPath(path: string) {
		path = path.trim();
		// Validate path
		if (path[0] !== '/') {
			throw Error(`Invalid path! ${path}`)
		}
		const elements = path.split('/');
		return elements.slice(1);
	}

	private _addFolderHelper(tree: FileTreeFolder, path: string[], newFolder: FileTreeFolder) {
		// Base cases
		if (path.length === 0) {
			throw Error(`Empty Path: ${JSON.stringify(path)} `);
		}
		const firstRouteElem = path[0];
		if (tree.name == firstRouteElem) {
			tree.children.push(newFolder);
		}
		if (tree.children.length === 0) {
			throw Error(`No children: ${JSON.stringify(tree)}`);
		}
		// Search in children
		for (const c of tree.children) {
			// Is this the element I'm looking for?
			if (c.name == firstRouteElem && c.type === 'FOLDER') {
				const c2: FileTreeFolder = <FileTreeFolder>c;
				c2.children.push(newFolder);
			}

			// If the element is a Folder, search recursively
			if (c.type === 'FOLDER') {
				const c2: FileTreeFolder = <FileTreeFolder>c;
				this._addFolderHelper(c2, path.slice(1), newFolder);
			}

		}
		throw Error(`ERR:Path ${JSON.stringify(path)} Tree: ${JSON.stringify(tree)} NF: ${newFolder}`);
	}

	public addFolder(path: string, newFolderName: string) {
		const folders = this._breakPath(path);
		const newFolder: FileTreeFolder = {
			name: newFolderName,
			children: [],
			type: 'FOLDER'
		};

		// Search in Tree 
		this._addFolderHelper(this._tree, folders, newFolder);
	}

	private _addFileHelper(tree: FileTreeFolder, path: string[], newFile: EditorMetadata) {
		// Base cases
		if (path.length === 0) {
			throw Error(`Empty Path: ${JSON.stringify(path)} `);
		}
		const firstRouteElem = path[0];
		if (tree.name == firstRouteElem) {
			tree.children.push(newFile);
		}
		if (tree.children.length === 0) {
			throw Error(`No children: ${JSON.stringify(tree)}`);
		}
		// Search in children
		for (const c of tree.children) {
			// Is this the element I'm looking for?
			if (c.name == firstRouteElem && c.type === 'FOLDER') {
				const c2: FileTreeFolder = <FileTreeFolder>c;
				c2.children.push(newFile);
			}

			// If the element is a Folder, search recursively
			if (c.type === 'FOLDER') {
				const c2: FileTreeFolder = <FileTreeFolder>c;
				this._addFileHelper(c2, path.slice(1), newFile);
			}

		}
		throw Error(`ERR:Path ${JSON.stringify(path)} Tree: ${JSON.stringify(tree)} NF: ${newFile}`);
	}

	public addFile(path: string, file: EditorMetadata) {
		const folders = this._breakPath(path);
		// Search in Tree 
		this._addFileHelper(this._tree, folders, file);
	}

	public removeFile(path: string, fileName: string) {

	}

	public removeFolder(path: string) {

	}

}