import * as ts from "typescript"
import { TSTranspilerCompilerHost } from './TSTranspilerCompilerHost'
import type DefaultWorkspace from '@/components/composed/DefaultWorspace.vue'

// https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API

export class TSTranspiler {
  private _compilerOptions: ts.CompilerOptions
  private _host: ts.CompilerHost

  constructor(options: ts.CompilerOptions, workspace: typeof DefaultWorkspace) {
    // Create a Program with an in-memory emit
    this._compilerOptions = options
    this._host = new TSTranspilerCompilerHost(workspace)
  }

  public transpileSimple(source: string): ts.TranspileOutput {
    const compilerOptions = { compilerOptions: { module: ts.ModuleKind.CommonJS } }
    const result = ts.transpileModule(source, compilerOptions)
    return result
  }

  public compile(fileNames: string[]): string[] {
    const program = ts.createProgram(fileNames, this._compilerOptions, this._host)
    const res = program.emit()
    const diagnostics = this.getDiagnostics(program, res)
    return diagnostics
  }

  public getDiagnostics(program: ts.Program, res: ts.EmitResult): string[] {
    const allDiagnostics = ts
      .getPreEmitDiagnostics(program)
      .concat(res.diagnostics)
    const diagnostics: string[] = []

    allDiagnostics.forEach(diagnostic => {
      if (diagnostic.file) {
        const start = diagnostic.start ? diagnostic.start : 0;
        const { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, start)
        const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")
        diagnostics.push(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`)
      } else {
        diagnostics.push(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"))
      }
    });

    return diagnostics
  }


}