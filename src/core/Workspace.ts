import { BaseWorkspace } from './BaseWorkspace';
import { FileTree } from './FileTree';
import { EditorMetadata } from './interfaces/EditorMetadata';

export class Workspace extends BaseWorkspace  {
	private _currentEditorId = -1;
	private _fileTree: FileTree = new FileTree();
	private _tabsContainerId = '';

	public get currentEditorId(): number {
		return this._currentEditorId;
	}

	public set currentEditorId(editorId: number) {
		this._currentEditorId = editorId;
	}

	public get fileTree(): FileTree {
		return this._fileTree;
	}

	constructor(theme= '', tabsContainerId= '') {
		super(theme);
		this._tabsContainerId = tabsContainerId;
	}


	public addEditor(
    event: Event,
    onlyInParent= false,
    content= '',
    path='/',
    fileName='',
    theme='',
    active=true): void {
    event.stopPropagation();
    event.preventDefault();
    if(event.target !== event.currentTarget && onlyInParent) return;

    const editorId = this.createEditor(content, theme, active);
 
    // Add new editor
    fileName = fileName.trim() === '' ? `Untitled-${editorId}` : fileName.trim();
    const newEditor: EditorMetadata = { 
      id: editorId,
      name: fileName,
      type: 'FILE' 
    };
    try {
      this._fileTree.addFile(path, newEditor);
    } catch(err) {
      this.destroyEditor(editorId);
      throw err;
    }
    this.updateEditorName(editorId, fileName);
    if (active) {
      this.currentEditorId = editorId;
      window.setTimeout(() => {
        this.scrollEditor('right', 120 * editorId);
      }, 200);
    }
  }

  public updateEditorNameFull(editorId: number, newName: string): void {
    this.updateEditorName(editorId, newName);
    this._fileTree.updateFileById(editorId, newName);
  }

  public selectEditor(editorId: number, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    const previousEditorId = this.currentEditorId;
    this.currentEditorId = editorId;

    this.editorActive(editorId, true);
    this.focusEditor(editorId);
    window.setTimeout(() => {
      this.scrollEditor('right', 120 * (this.currentEditorId - previousEditorId));
    }, 200);
  }

  public deleteEditor(editorId: number, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.closeEditor(editorId, event);
    this.fileTree.removeFile(editorId)
    this.destroyEditor(editorId);
  }

  public closeEditor(editorId: number, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.editorActive(editorId, false);
    const lastEditorIdInWorkspace = this.editors.find((e) => {
      return e.active;
    });
    if (lastEditorIdInWorkspace) {
     this.currentEditorId = lastEditorIdInWorkspace.id;
    } else {
      this.currentEditorId = -1;
    }
  }

	scrollEditor(direction: string, translate = 120): void {
    const tabsContainer = document.getElementById(this._tabsContainerId);
    if (!tabsContainer) {
      throw Error('Tabs container undefined!');
    }

    if (direction === 'left') {
      tabsContainer.scrollLeft  -= translate;
    } else if (direction === 'right') {
      tabsContainer.scrollLeft += translate;
    } else {
      throw Error('Wrong direction :)');
    }
  }
}