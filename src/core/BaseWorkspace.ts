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

export class BaseWorkspace implements GenericWorkspace
{
	private _extensions: Extension[] = [];
	private _editors: EditorViewMetadata[] = [];
	private _themeExtension: Compartment = new Compartment();

	constructor(theme = '') {
		this._extensions.push(
			keymap.of(defaultKeymap),
      keymap.of([indentWithTab]),
			history(),
			autocompletion(),
			bracketMatching(),
			closeBrackets(),
			highlightActiveLine(),
      keymap.of(historyKeymap),
      keymap.of(completionKeymap),
		);
		this._extensions.push(this._themeExtension.of(this._getThemeExtension(theme)));

		this._extensions.push(
			javascript(),
			lineNumbers(),
			gutter({class: 'cm-arcode-gutter'}),
			EditorView.lineWrapping,
		);

	}

	public get editors() : EditorViewMetadata[] {
		return this._editors;
	}

	private _getThemeExtension(theme: string): Extension {
		if (theme == 'theme-dark' || theme == 'dark-blue') {
			return oneDark;
		}
		return defaultHighlightStyle.fallback;
	}

	public createEditor(content: string, theme: string): number {
    const startState = EditorState.create({
      doc: content,
      extensions: this._extensions
    });
    const view: EditorView = new EditorView({
      state: startState
    });
    const editorId: number = this._editors[this._editors.length - 1] ? 
      this._editors[this._editors.length - 1].id + 1 : 0;
    const metadata: EditorViewMetadata = {id: editorId, view, name: ''};
    this._editors.push(metadata);
    this.setTheme(editorId, theme);
    return editorId;
	}

	public updateEditorName(editorId: number, newName: string): void {
		const i = this._editors.findIndex(ed => ed.id == editorId);
		this._editors[i].name = newName;
	}

	public destroyEditor(editorId: number): void {
		const i = this._editors.findIndex(ed => ed.id == editorId);
		const removed: EditorView = this._editors[i].view;
		removed.destroy();
		this._editors.splice(i, 1);
	}

	public getEditor(editorId: number): EditorView {
		const i = this._editors.findIndex(ed => ed.id == editorId);
		return this._editors[i].view;
	}

	public mountEditor(editorId: number, container: HTMLElement|null): void {
		const editor = this.getEditor(editorId);
		if (container !== null && editor) {
			const editorHTML = this.getEditor(editorId).dom;
			container.append(editorHTML);
			editor.focus();
		} else {
			// throw Error(`Error on mounting editor with id ${editorId}`);
		}
	}

	public focusEditor(editorId: number): void {
		const editor = this.getEditor(editorId);
		if (editor) {
			editor.focus();	
		}
	}

	public setTheme(editorId: number, theme: string): void {
		const editor = this.getEditor(editorId);
		if (editor) {
			editor.dispatch({
				effects: this._themeExtension.reconfigure(this._getThemeExtension(theme))
			});
		}
	}
}