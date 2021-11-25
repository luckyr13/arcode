import {EditorState, Extension} from "@codemirror/state";
import {EditorView, keymap, highlightActiveLine} from "@codemirror/view";
import {defaultKeymap, indentWithTab} from "@codemirror/commands";
import { bracketMatching } from "@codemirror/matchbrackets";
import {javascript} from "@codemirror/lang-javascript";
import { lineNumbers, gutter } from "@codemirror/gutter";
import { oneDark } from "@codemirror/theme-one-dark";
import { defaultHighlightStyle } from "@codemirror/highlight";
import { closeBrackets } from "@codemirror/closebrackets";

export interface EditorMetadata {
	id: number,
	name: string
}

export class Workspace {
	private _editors: EditorView[] = [];
	private _extensions: Extension[] = [];

	constructor(theme = '') {
		this._extensions.push(
			keymap.of(defaultKeymap),
      keymap.of([indentWithTab]),
			bracketMatching(),
			closeBrackets(),
			highlightActiveLine(),
		);

		if (theme == 'theme-dark' || theme == 'dark-blue') {
			this._extensions.push(oneDark);
		} else {
			this._extensions.push(defaultHighlightStyle.fallback);
		}

		this._extensions.push(
			javascript(),
			lineNumbers(),
			gutter({class: 'cm-arcode-gutter'}),
			EditorView.lineWrapping,
		);

	}

	public createEditor(): number {
    const startState = EditorState.create({
      doc: '',
      extensions: this._extensions
    })

    const view = new EditorView({
      state: startState
    })
    const editorId = this._editors.push(view) - 1;

    return editorId;
	}

	public removeEditor(start: number): void {
		const removed: EditorView = this._editors.splice(start, start)[0];
		removed.destroy();
	}

	public getEditor(editorId: number): EditorView {
		return this._editors[editorId];
	}

	public mountEditor(editorId: number, container: HTMLElement|null): void {
		const editorHTML = this._editors[editorId].dom;
		const editor = this.getEditor(editorId);
		if (container !== null) {
			container.append(editorHTML);
			editor.focus();
		} else {
			throw Error(`Error on mounting editor with id ${editorId}`);
		}
	}
}