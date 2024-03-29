import JSZip from 'jszip';
import fileDownload from 'js-file-download';
import { FileTreeFolder } from '@/core/interfaces/FileTreeFolder';
import { EditorMetadata } from '@/core/interfaces/EditorMetadata';
import { EditorViewMetadata } from '@/core/interfaces/EditorViewMetadata';

export class JSZipWrapper {
	private _zip: JSZip;

	constructor() {
		this._zip = new JSZip();
	}

	get zip() {
		return this._zip;
	}

	public addFile(fileName: string, content: string) {
		this._zip.file(fileName, content);
	}

	public addFolder(folderName: string): JSZip|null {
		return this._zip.folder(folderName);
	}

	public async downloadZip(name: string) {
		const content = await this._zip.generateAsync({type:'blob'});
		fileDownload(content, name);
	}

	public async getZipBlob(): Promise<Blob> {
		const content = await this._zip.generateAsync({type:'blob'});
		return content;
	}

	public async getZipSize(): Promise<number> {
		const content = await this.getZipBlob();
		return content.size;
	}

	public loadTreeToZip(fileTreeRoot: FileTreeFolder, fullpath: string, editors: EditorViewMetadata[]) {
		if (!fileTreeRoot) {
			return;
		}

		if (fileTreeRoot.children &&
			fileTreeRoot.children.length) {
			fullpath += fileTreeRoot.name ? `${fileTreeRoot.name}/` : '';
			for (const child of fileTreeRoot.children) {
				if (child.type === 'FILE') {
					// Load file to zip
					const i = editors.findIndex(ed => ed.id == (child as EditorMetadata).id);
					const view = editors[i].view;
					const content = view.state.doc.toString();
					const filename = `${fullpath}${child.name}`;
					this.addFile(filename, content);

				} else if (child.type === 'FOLDER') {
					this.loadTreeToZip(child as FileTreeFolder, fullpath, editors);
				}
			}
		}
	}

	async openZip(file: File) {
		return this._zip.loadAsync(file);		
	}

	public getTotalTreeBytes(fileTreeRoot: FileTreeFolder, fullpath: string, editors: EditorViewMetadata[]): number {
		if (!fileTreeRoot) {
			return 0;
		}
		let totalBytesInFolder = 0;

		if (fileTreeRoot.children &&
			fileTreeRoot.children.length) {
			fullpath += fileTreeRoot.name ? `${fileTreeRoot.name}/` : '';
			for (const child of fileTreeRoot.children) {
				if (child.type === 'FILE') {
					// Load file to zip
					const i = editors.findIndex(ed => ed.id == (child as EditorMetadata).id);
					const view = editors[i].view;
					const content = view.state.doc.toString();
					const numbytes = new Blob([content]).size;
					totalBytesInFolder += numbytes;

				} else if (child.type === 'FOLDER') {
					totalBytesInFolder += this.getTotalTreeBytes(child as FileTreeFolder, fullpath, editors);
				}
			}
		}
		return totalBytesInFolder;
	}

}