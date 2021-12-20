import {EditorView} from "@codemirror/view";

export interface EditorViewMetadata {
	id: number;
	name: string;
	view: EditorView;
	active: boolean;
}