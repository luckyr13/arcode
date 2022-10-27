import * as ts from "typescript"
import type DefaultWorkspace from '@/components/composed/DefaultWorspace.vue'
import { EditorMetadata } from '@/core/interfaces/EditorMetadata'
// import * as Babel from '@babel/standalone';
// https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API

export class TSTranspilerCompilerHost implements ts.CompilerHost {
  private _workspace: typeof DefaultWorkspace

  constructor(workspace: typeof DefaultWorkspace) {
    this._workspace = workspace
  }

  getSourceFile(
    fileName: string,
    languageVersionOrOptions: ts.ScriptTarget | ts.CreateSourceFileOptions,
    onError?: ((message: string) => void) | undefined,
    shouldCreateNewSourceFile?: boolean | undefined): ts.SourceFile|undefined {

    const src = this.readFile(fileName)

    const sourceFile = ts.createSourceFile(
      fileName,
      src,
      ts.ScriptTarget.Latest,
      /*setParentNodes */ true
    );

    return sourceFile
  }

  getDefaultLibFileName(options: ts.CompilerOptions): string {
    const res = ''
    return res
  }

  writeFile(
    fileName: string,
    contents: string): void {
    const emptyEvent = new Event('empty')
    const data = ''

    const fnames = fileName.split('/')
    let path = ''
    if (fnames.length > 1) {
      path = fnames.slice(0, fnames.length - 1).join('/')
      const date = new Date()
      const dateF = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}T${date.getHours()}_${date.getMinutes()}_${date.getSeconds()}`
      const onlyFileName = fnames[fnames.length - 1]
      const fileNameFrgm = onlyFileName.split('.')

      if (fileNameFrgm.length > 1) {
        const n = fileNameFrgm.slice(0, fileNameFrgm.length - 1).join('')
        const ext = fileNameFrgm[fileNameFrgm.length - 1]
        fileName = `${n}_${dateF}.${ext}`
      } else {
        fileName = `${fnames[fnames.length - 1]}_${dateF}`
      }

      if (!path) {
        path = '/'
      }
      } else {
        path = '/'
      }

    this._workspace.addEditor(
      emptyEvent,
      false,
      contents,
      fileName,
      path,
      false)
  }

  readFile(
    fileName: string): string {
    const name = fileName.split('/')[fileName.split('/').length - 1]
    let path = fileName.split('/').splice(0, fileName.split('/').length - 1).join('/')
    if (path === '') {
      path = '/'
    }

    const fileId = this._workspace.findFileIdByName(path, name)
    const id = this._workspace.editors.findIndex((ed: EditorMetadata) => ed.id == fileId)
    
    if ( id < 0) {
      throw Error(`Invalid file id ${id}`)
    }
    const src = this._workspace.editors[id].view.state.doc.toString()
    return src
  }

  getCurrentDirectory(): string {
    const path = '/'
    return path
  }

  getCanonicalFileName(fileName: string): string {
    return fileName
  }

  useCaseSensitiveFileNames(): boolean {
    return true
  }

  getNewLine(): string {
    return "\n"
  }

  fileExists(fileName: string): boolean {
    const name = fileName.split('/')[fileName.split('/').length - 1]
    let path = fileName.split('/').splice(0, fileName.split('/').length - 1).join('/')
    if (path === '') {
      path = '/'
    }

    const fileId = this._workspace.findFileIdByName(path, name)
    const id = this._workspace.editors.findIndex((ed: EditorMetadata) => ed.id == fileId)
    
    if ( id >= 0) {
      return true
    }

    return false
  }
/*
  babelTransform(contents: string) {
    let output = '';
    output = Babel.transform(
      contents, { presets: ["env"] }
    ).code;
  
    return output;
  }
*/

}