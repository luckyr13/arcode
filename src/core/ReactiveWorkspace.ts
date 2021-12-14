import { Workspace } from './Workspace';
import { EditorMetadata } from './interfaces/EditorMetadata';
import { 
  ref, reactive, Ref
} from 'vue';

export class ReactiveWorkspace extends Workspace  {
	private _currentEditorId: Ref<number> = ref(0);
	private _editorsReactive: EditorMetadata[] = reactive<EditorMetadata[]>([]);
	private _tabsContainerId = '';

	public get currentEditorId(): number {
		return this._currentEditorId.value;
	}

	public set currentEditorId(editorId: number) {
		this._currentEditorId.value = editorId;
	}

	public get editors(): EditorMetadata[] {
		return this._editorsReactive;
	}

	constructor(theme= '', tabsContainerId= '') {
		super(theme);
		this._tabsContainerId = tabsContainerId;
	}

	public addEditor(event: Event, onlyInParent= false, content= ''): void {
    event.stopPropagation();
    event.preventDefault();
    if(event.target !== event.currentTarget && onlyInParent) return;

    const editorId = this.createEditor(content);
    // Deactivate current editor 
    const i = this.editors.findIndex(ed => ed.id == this.currentEditorId);
		if (i >= 0 && this.editors[i]) {
			this.editors[i].active = false;
		}
    // Add new editor
    this.editors.push({ id: editorId, name: `Untitled-${editorId}`, active: true });
    this.currentEditorId = editorId;
    this.scrollEditor('right', 120 * editorId);
  }

  public selectEditor(editorId: number, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    // Deactivate current editor 
    const i = this.editors.findIndex(ed => ed.id == this.currentEditorId);
    if (i >= 0 && this.editors[i]) {
      this.editors[i].active = false;
    }
    // Activate new editor
    const j = this.editors.findIndex(ed => ed.id == editorId);
    this.editors[j].active = true;
    this.currentEditorId = editorId;
    this.focusEditor(editorId);
  }

  public deleteEditor(editorId: number, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    const i = this.editors.findIndex(ed => ed.id == editorId);
    this.editors.splice(i, 1);
    this.destroyEditor(editorId);
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