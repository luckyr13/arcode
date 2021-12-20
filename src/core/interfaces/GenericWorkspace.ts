import {EditorView} from "@codemirror/view";

export interface GenericWorkspace {
	createEditor(content: string, fileName: string, theme: string): number;
	destroyEditor(editorId: number): void;
	getEditorView(editorId: number): EditorView;
	mountEditor(editorId: number, container: HTMLElement|null): void;
 	focusEditor(editorId: number): void;
}