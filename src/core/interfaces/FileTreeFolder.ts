import { EditorMetadata } from './EditorMetadata';

export interface FileTreeFolder {
	name: string;
	children: Array<EditorMetadata|FileTreeFolder>;
	type: string;
}