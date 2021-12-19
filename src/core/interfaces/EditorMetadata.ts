import {EditorView} from "@codemirror/view";

export interface EditorMetadata {
	id: number;
	name: string;
	active: boolean;
	type: string;
}