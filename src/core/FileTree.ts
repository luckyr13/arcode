import { FileTreeFolder } from './interfaces/FileTreeFolder';
import { EditorMetadata } from './interfaces/EditorMetadata';

export class FileTree
{
	private _tree: FileTreeFolder;

	constructor() {
		this._tree = {
			name: '',
			children: [],
			type: 'FOLDER'
		};
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
	}

	public addFile(path: string, file: EditorMetadata) {
		const folders = this._breakPath(path);
		// Search in Tree 
		this._addFileHelper(this._tree, folders, file);
	}

	
	public removeFolder(path: string) {
		console.log('...')
	}

	private _findFileInChildrenById(fileId: number, tree: FileTreeFolder): EditorMetadata|null {
		// Search children
		const i = tree.children.findIndex((f) => {
			const tmpF: EditorMetadata = <EditorMetadata>f;
			return (tmpF.type == 'FILE' && tmpF.id == fileId);
		});
    if (i >= 0 && tree.children[i]) {
      return <EditorMetadata>tree.children[i];
    }

    return null;
	}

	private _removeFileHelper(tree: FileTreeFolder, fileId: number): void {
		if (tree.children.length === 0) {
			return;
		}
		
		// Search in children
		for (const i in tree.children) {
			// Is this the element I'm looking for?
			if (tree.children[i].type === 'FILE') {
				const c2: EditorMetadata = <EditorMetadata>tree.children[i];
				if (c2.id === fileId) {
					tree.children.splice(+i, 1);
					return;
				}
			}

			// If the element is a Folder, search recursively
			if (tree.children[i].type === 'FOLDER') {
				const c2: FileTreeFolder = <FileTreeFolder>tree.children[i];
				this._removeFileHelper(c2, fileId);
			}
		}
	}

	public removeFile(fileId: number): void {
		// Search in Tree 
		this._removeFileHelper(this._tree, fileId);
	}

	public getTree() {
		return this._tree;
	}
}