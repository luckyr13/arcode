import { FileTreeFolder } from './interfaces/FileTreeFolder';
import { EditorMetadata } from './interfaces/EditorMetadata';

export class FileTree
{
	private _tree: FileTreeFolder;
	private _storage = window.localStorage;

	constructor() {
		this._tree = {
			name: '',
			children: [],
			type: 'FOLDER'
		};
		if (this._storage.getItem('tree') !== null) {
			this._tree = JSON.parse(this._storage.getItem('tree')!);
		}
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
			return;
		}
		const firstRouteElem = path[0];
		if (tree.name == firstRouteElem && path.length === 1) {
			// Is the name already taken?
			const findName = this.findFolderInChildrenByName(newFolder.name, tree);
			if (findName) {
				throw Error(`Name ${newFolder.name} already taken!`);
			}

			tree.children.push(newFolder);
			return;
		}
		if (tree.children.length === 0) {
			//throw Error(`No children: ${JSON.stringify(tree)}`);
			return;
		}
		// Search in children
		for (const c of tree.children) {
			// Is this the element I'm looking for?
			if (c.name == firstRouteElem && c.type === 'FOLDER' && path.length == 1) {
				const c2: FileTreeFolder = <FileTreeFolder>c;
				// Is the name already taken?
				const findName = this.findFolderInChildrenByName(newFolder.name, c2);
				if (findName) {
					throw Error(`Name ${newFolder.name} already taken!`);
				}
				
				c2.children.push(newFolder);
				return;
			}

			// If the element is a Folder, search recursively
			if (c.type === 'FOLDER') {
				const c2: FileTreeFolder = <FileTreeFolder>c;
				this._addFolderHelper(c2, path.slice(1), newFolder);
			}

		}
	}

	public addFolder(path: string, newFolderName: string): void {
		const folders = this._breakPath(path);
		const newFolder: FileTreeFolder = {
			name: newFolderName,
			children: [],
			type: 'FOLDER'
		};

		// Search in Tree 
		this._addFolderHelper(this._tree, folders, newFolder);
		this._storage.setItem('tree', JSON.stringify(this._tree));
	}

	private _addFileHelper(tree: FileTreeFolder, path: string[], newFile: EditorMetadata) {
		// Base cases
		if (path.length === 0) {
			// throw Error(`Empty Path: ${JSON.stringify(path)} `);
			return;
		}
		const firstRouteElem = path[0];
		if (tree.name == firstRouteElem && path.length === 1) {
			// Is the name already taken?
			const findName = this.findFileInChildrenByName(newFile.name, tree);
			if (findName) {
				throw Error(`Name ${newFile.name} already taken!`);
			}

			tree.children.push(newFile);
			return;
		}
		if (tree.children.length === 0) {
			//throw Error(`No children: ${JSON.stringify(tree)}`);
			return;
		}
		// Search in children
		for (const c of tree.children) {
			// Is this the element I'm looking for?
			if (c.name == firstRouteElem && c.type === 'FOLDER' && path.length == 1) {
				// Is the name already taken?
				const findName = this.findFileInChildrenByName(newFile.name, <FileTreeFolder>c);
				if (findName) {
					throw Error(`Name ${newFile.name} already taken! Please use a different name.`);
				}

				const c2: FileTreeFolder = <FileTreeFolder>c;
				c2.children.push(newFile);
				return;
			}

			// If the element is a Folder, search recursively
			if (c.type === 'FOLDER') {
				const c2: FileTreeFolder = <FileTreeFolder>c;
				this._addFileHelper(c2, path.slice(1), newFile);
			}

		}
	}

	public addFile(path: string, file: EditorMetadata): void {
		const folders = this._breakPath(path);
		// Search in Tree 
		this._addFileHelper(this._tree, folders, file);
		this._storage.setItem('tree', JSON.stringify(this._tree));
	}

	
	public removeFolder(): void {
		console.log('...')
		this._storage.setItem('tree', JSON.stringify(this._tree));
	}

	public findFileInChildrenById(fileId: number, tree: FileTreeFolder): EditorMetadata|null {
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

	public findFileInChildrenByName(fileName: string, tree: FileTreeFolder): EditorMetadata|null {
		// Search children
		const i = tree.children.findIndex((f) => {
			const tmpF: EditorMetadata = <EditorMetadata>f;
			return (tmpF.type == 'FILE' && tmpF.name == fileName);
		});
    if (i >= 0 && tree.children[i]) {
      return <EditorMetadata>tree.children[i];
    }

    return null;
	}

	public findFolderInChildrenByName(folderName: string, tree: FileTreeFolder): FileTreeFolder|null {
		// Search children
		const i = tree.children.findIndex((f) => {
			const tmpF: FileTreeFolder = <FileTreeFolder>f;
			return (tmpF.type == 'FOLDER' && tmpF.name == folderName);
		});
    if (i >= 0 && tree.children[i]) {
      return <FileTreeFolder>tree.children[i];
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
		this._storage.setItem('tree', JSON.stringify(this._tree));
	}

	public get tree(): FileTreeFolder {
		return this._tree;
	}

	public set tree(_tree: FileTreeFolder) {
		this._tree = _tree;
	}

	private _getTreeAsPathStringArrHelper(tree: FileTreeFolder, path: string): string[] {
		if (tree.children.length === 0) {
			return [];
		}
		let res: string[] = [];
		
		// Search in children
		for (const i in tree.children) {
			// If the element is a Folder, search recursively
			if (tree.children[i].type === 'FOLDER') {
				const c2: FileTreeFolder = <FileTreeFolder>tree.children[i];
				const newPath2 = `${path}/${c2.name}`;
				res.push(newPath2);
				res = res.concat(this._getTreeAsPathStringArrHelper(c2, newPath2));
			}
		}
		
		
		return res;
	}

	public getTreeAsPathStringArr(): string[] {
		// Search in Tree 
		return this._getTreeAsPathStringArrHelper(this._tree, '');
	}


	private _updateFileByIdHelper(tree: FileTreeFolder, fileId: number, newName: string) {
		if (tree.children.length === 0) {
			return;
		}
		
		// Search in children
		for (const i in tree.children) {
			// Is this the element I'm looking for?
			if (tree.children[i].type === 'FILE') {
				const c2: EditorMetadata = <EditorMetadata>tree.children[i];
				if (c2.id === fileId) {
					// Check if the name is already in use
					if (this.findFileInChildrenByName(newName, tree)) {
						throw Error(`Name ${newName} already taken!`);
					}
					tree.children[i].name = newName;
					return;
				}
			}

			// If the element is a Folder, search recursively
			if (tree.children[i].type === 'FOLDER') {
				const c2: FileTreeFolder = <FileTreeFolder>tree.children[i];
				this._updateFileByIdHelper(c2, fileId, newName);
			}
		}
	}

	public updateFileById(fileId: number, name: string): void {
		// Search in Tree 
		this._updateFileByIdHelper(this._tree, fileId, name);
		this._storage.setItem('tree', JSON.stringify(this._tree));
	}

	private _getTreeAsFilenameStringArrHelper(
		tree: FileTreeFolder, path: string
		): Record<string, string> {
		if (tree.children.length === 0) {
			return {};
		}
		let res: Record<string, string> = {};
		
		// Search in children
		for (const i in tree.children) {
			// If the element is a Folder, search recursively
			if (tree.children[i].type === 'FOLDER') {
				const c2: FileTreeFolder = <FileTreeFolder>tree.children[i];
				const newPath2 = `${path}/${c2.name}`;
				res = { ...res, ...this._getTreeAsFilenameStringArrHelper(c2, newPath2)};
			}

			// If the element is a Folder, search recursively
			if (tree.children[i].type === 'FILE') {
				const f2: EditorMetadata = <EditorMetadata>tree.children[i];
				const filename = `${path}/${f2.name}`;
				res[f2.id] = filename;
			}
		}
		
		return res;
	}

	public getTreeAsFilenameStringArr(): Record<string, string> {
		// Search in Tree 
		return this._getTreeAsFilenameStringArrHelper(this._tree, '');
	}
}