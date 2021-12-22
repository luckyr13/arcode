import {EditorState, Extension, Compartment} from "@codemirror/state";
import {EditorView, keymap, highlightActiveLine} from "@codemirror/view";
import {defaultKeymap, indentWithTab} from "@codemirror/commands";
import { bracketMatching } from "@codemirror/matchbrackets";
import {javascript} from "@codemirror/lang-javascript";
import { lineNumbers, gutter } from "@codemirror/gutter";
import { oneDark } from "@codemirror/theme-one-dark";
import { defaultHighlightStyle } from "@codemirror/highlight";
import { closeBrackets } from "@codemirror/closebrackets";
import { history, historyKeymap } from "@codemirror/history";
import { autocompletion, completionKeymap } from "@codemirror/autocomplete";
import { GenericWorkspace } from './interfaces/GenericWorkspace';
import { EditorViewMetadata } from './interfaces/EditorViewMetadata';
import { ref } from 'vue';

export class BaseWorkspace implements GenericWorkspace
{
	private _extensions: Extension[] = [];
	private _editors = ref<EditorViewMetadata[]>([]);
	private _themeExtension: Compartment = new Compartment();

	constructor(theme = '') {
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
			javascript(),
			gutter({class: 'cm-arcode-gutter'}),
			EditorView.lineWrapping,
		);
		

	}

	public get editors() {
		return this._editors.value;
	}

	private _getThemeExtension(theme: string): Extension {
		if (theme == 'theme-dark' || theme == 'dark-blue') {
			return oneDark;
		}
		return defaultHighlightStyle.fallback;
	}

	public createEditor(content: string, active: boolean): number {
    const startState = EditorState.create({
      doc: content,
      extensions: this._extensions
    });
    const view: EditorView = new EditorView({
      state: startState
    });
    const editorId: number = this.editors[this.editors.length - 1] ? 
      this.editors[this.editors.length - 1].id + 1 : 0;
    const metadata: EditorViewMetadata = {id: editorId, view, name: '', active: active};
    this.editors.push(metadata);
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
}