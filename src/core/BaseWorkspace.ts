import {EditorState, Extension, Compartment} from "@codemirror/state";
import {
	EditorView, keymap, highlightActiveLine, 
	lineNumbers, gutter } from "@codemirror/view";
import {defaultKeymap, indentWithTab, history, historyKeymap} from "@codemirror/commands";
import { bracketMatching, StreamLanguage, defaultHighlightStyle, syntaxHighlighting } from "@codemirror/language";
import {javascript} from "@codemirror/lang-javascript";
import {rust} from "@codemirror/lang-rust";
import {json} from "@codemirror/lang-json";
import {python} from "@codemirror/lang-python";
import {java} from "@codemirror/lang-java";
import {cpp} from "@codemirror/lang-cpp";
import { oneDark } from "@codemirror/theme-one-dark";
import { autocompletion, completionKeymap, closeBrackets } from "@codemirror/autocomplete";
import { GenericWorkspace } from './interfaces/GenericWorkspace';
import { EditorViewMetadata } from './interfaces/EditorViewMetadata';
import { ref } from 'vue';
import {erlang} from "@codemirror/legacy-modes/mode/erlang";
import {go} from "@codemirror/legacy-modes/mode/go";

export class BaseWorkspace implements GenericWorkspace
{
	private _extensions: Extension[] = [];
	private _editors = ref<EditorViewMetadata[]>([]);
	private _themeExtension: Compartment = new Compartment();
  protected _cachedEditorsContent: Record<string, string> = {};
	private _cachedEventExtension: Compartment = new Compartment();
  private _storage = window.localStorage;
  private _currentContent = ref('');
  private _tx = '';
  private _workspaceParam = '';
  private _langExtension: Compartment = new Compartment();

	constructor(theme = '', tx= '', workspaceParam='') {
		// Save content in cache
		this._extensions.push(
			this._cachedEventExtension.of([])	
		);

		this._extensions.push(
			lineNumbers(),
			highlightActiveLine(),
			history(),
			bracketMatching(),
			closeBrackets(),
			autocompletion(),
      keymap.of([...defaultKeymap, indentWithTab]),
      keymap.of(historyKeymap),
			keymap.of(completionKeymap),
		);
		
		this._extensions.push(
			this._themeExtension.of(this._getThemeExtension(theme))
		);

		this._extensions.push(
			this._langExtension.of(this._getLangExtension(''))
		);

		this._extensions.push(
			gutter({class: 'cm-arcode-gutter'}),
			EditorView.lineWrapping,
		);

    if (this._storage.getItem('cachedEditors') !== null && !tx && !workspaceParam) {
      this._cachedEditorsContent = JSON.parse(this._storage.getItem('cachedEditors')!);
    }

    this._tx = tx;
    this._workspaceParam = workspaceParam;

	}

	public get editors() {
		return this._editors.value;
	}


	public get currentContent(): string {
		return this._currentContent.value;
	}

	public set currentContent(content: string) {
		this._currentContent.value = content;
	}

	private _getThemeExtension(theme: string): Extension {
		if (theme == 'theme-dark' || theme == 'dark-blue') {
			return oneDark;
		}
		return syntaxHighlighting(defaultHighlightStyle);
	}

	private _getLangExtension(lang: string): Extension {
		if (lang == 'js') {
			return javascript();
		} else if (lang == 'rs') {
			return rust();
		} else if (lang == 'json') {
			return json();
		} else if (lang == 'py') {
			return python();
		} else if (lang == 'java') {
			return java();
		} else if (lang == 'cpp') {
			return cpp();
		} else if (lang == 'erl') {
			return StreamLanguage.define(erlang);
		} else if (lang == 'go') {
			return StreamLanguage.define(go);
		}
		
		return [];
	}

	public createEditor(content: string, active: boolean, newEditorId = -1): number {
		let editorId = 0;
		const ids = this.editors.map((v) => {
			return v.id
		});
		if (ids.length) {
			editorId = Math.max(...ids) + 1;
		}

    if (newEditorId >= 0) {
			editorId = newEditorId;
    }
    const startState = EditorState.create({
      doc: content,
      extensions: this._extensions

    });
    const view: EditorView = new EditorView({
      state: startState,
    });
    const metadata: EditorViewMetadata = {id: editorId, view, name: '', active: active};
    this.editors.push(metadata);
    view.dispatch({
			effects: this._cachedEventExtension.reconfigure(EditorView.updateListener.of((upd) => {
				this.updateCachedEditors(editorId);
				this.currentContent = upd.state.doc.toString();
			}))
		});
    return editorId;
	}

	public updateEditorName(editorId: number, newName: string): void {
		const i = this.editors.findIndex(ed => ed.id == editorId);
		this.editors[i].name = newName;
	}

	public destroyEditor(editorId: number): void {
		const i = this.editors.findIndex(ed => ed.id == editorId);
		this.editors[i].view.destroy();
		this.editors.splice(i, 1);
		// Delete from cache 
		delete this._cachedEditorsContent[editorId];
		if (!this._tx && !this._workspaceParam) {
			this._storage.setItem('cachedEditors', JSON.stringify(this._cachedEditorsContent));
		}
	}

	public getEditorView(editorId: number): EditorView {
		const i = this.editors.findIndex(ed => ed.id == editorId);
		return <EditorView>this.editors[i].view;
	}


  public isEditorActive(editorId: number): boolean {
		const i = this.editors.findIndex(ed => ed.id == editorId);
		if (i >= 0) {
			return this.editors[i].active;
		}
    return false;
  }

	public editorActive(editorId: number, active: boolean): void {
		const i = this.editors.findIndex(ed => ed.id == editorId);
		if (i >= 0) {
			this.editors[i].active = active;
		}
	}

	public mountEditor(editorId: number, container: HTMLElement|null): void {
		const editor = this.getEditorView(editorId);
		if (container !== null && editor) {
			const editorHTML = this.getEditorView(editorId).dom;
			container.append(editorHTML);
			editor.focus();
		} else {
			// throw Error(`Error on mounting editor with id ${editorId}`);
		}
	}

	public focusEditor(editorId: number): void {
		const editor = this.getEditorView(editorId);
		if (editor) {
			editor.focus();	
		}
	}

	public setTheme(editorId: number, theme: string): void {
		const editor = this.getEditorView(editorId);
		if (editor) {
			editor.dispatch({
				effects: this._themeExtension.reconfigure(this._getThemeExtension(theme))
			});
		}
	}

	public setLanguage(editorId: number, fname: string): void {
		const editor = this.getEditorView(editorId);
		const lang = this._getFileExtensionFromName(fname);
		if (editor) {
			editor.dispatch({
				effects: this._langExtension.reconfigure(this._getLangExtension(lang))
			});
		}
	}

	private _getFileExtensionFromName(fname: string) {
		const fnpieces = fname.trim().split('.');
		const ext = fnpieces.length ? fnpieces[fnpieces.length - 1] : '';
		return ext;
	}

	updateCachedEditors(editorId: number) {
		// Store in cache 
    this._cachedEditorsContent[editorId] = this.getEditorView(editorId).state.doc.toString();
		if (!this._tx && !this._workspaceParam) {
			this._storage.setItem('cachedEditors', JSON.stringify(this._cachedEditorsContent));
		}
	}
}