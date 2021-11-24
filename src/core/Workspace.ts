import {EditorState, Extension} from "@codemirror/state";
import {EditorView, keymap, highlightActiveLine} from "@codemirror/view";
import {defaultKeymap} from "@codemirror/commands";
import { bracketMatching } from "@codemirror/matchbrackets";
import {javascript} from "@codemirror/lang-javascript";
import { lineNumbers, gutter } from "@codemirror/gutter";
import { oneDark } from "@codemirror/theme-one-dark";
import { defaultHighlightStyle } from "@codemirror/highlight";

export class Workspace {
	private _editors: EditorView[] = [];
	private _extensions: Array<Extension> = [];

	constructor(theme = '') {
		this._extensions.push(keymap.of(defaultKeymap), bracketMatching());

		if (theme == 'theme-dark' || theme == 'dark-blue') {
			this._extensions.push(oneDark);
		} else {
			this._extensions.push(defaultHighlightStyle.fallback);
			this._extensions.push(highlightActiveLine());
		}


		this._extensions.push(
			javascript(),
			lineNumbers(),
			gutter({class: 'cm-arcode-gutter'}),
			EditorView.lineWrapping,
		);

		console.log(this._extensions)

	}

	public createEditor(): EditorView {
    const startState = EditorState.create({
      doc: '',
      extensions: this._extensions
    })

    const view = new EditorView({
      state: startState
    })

    return view;

	}
}