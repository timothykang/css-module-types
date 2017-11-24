import { extractICSS } from 'icss-utils';
import * as ts_module from 'typescript/lib/tsserverlibrary';
import * as path from 'path';
import * as postcss from 'postcss';
import * as postcssIcssSelectors from 'postcss-icss-selectors';

export = function init({ typescript: ts }: { typescript: typeof ts_module }) {
  function isCSS(fileName: string): boolean {
    return /\.css$/.test(fileName);
  }

  function isRelativeCSS(fileName: string): boolean {
    return isCSS(fileName) && /^\.\.?($|[\\/])/.test(fileName);
  }

  function create(info: ts.server.PluginCreateInfo) {
    const processor = postcss(postcssIcssSelectors({ mode: 'local' }))

    function getDtsSnapshot(scriptSnapshot: ts.IScriptSnapshot) {
      const css = scriptSnapshot.getText(0, scriptSnapshot.getLength());
      const dts = Object.keys(extractICSS(processor.process(css).root).icssExports)
          .map(exportName => `export const ${exportName}: string;`)
          .join('');
      return ts.ScriptSnapshot.fromString(dts);
    }

    const clssf = ts.createLanguageServiceSourceFile;

    ts.createLanguageServiceSourceFile = (fileName: string, scriptSnapshot: ts.IScriptSnapshot, scriptTarget: ts.ScriptTarget, version: string, setNodeParents: boolean, scriptKind?: ts.ScriptKind, cheat?: string): ts.SourceFile => {
      if (isCSS(fileName)) {
        scriptSnapshot = getDtsSnapshot(scriptSnapshot);
      }
      var sourceFile = clssf(fileName, scriptSnapshot, scriptTarget, version, setNodeParents, scriptKind);
      if (isCSS(fileName)) {
        sourceFile.isDeclarationFile = true;
      }
      return sourceFile;
    }

    const ulssf = ts.updateLanguageServiceSourceFile;

    ts.updateLanguageServiceSourceFile = (sourceFile: ts.SourceFile, scriptSnapshot: ts.IScriptSnapshot, version: string, textChangeRange: ts.TextChangeRange, aggressiveChecks?: boolean, cheat?: string): ts.SourceFile => {
      if (isCSS(sourceFile.fileName)) {
        scriptSnapshot = getDtsSnapshot(scriptSnapshot);
      }
      var sourceFile = ulssf(sourceFile, scriptSnapshot, version, textChangeRange, aggressiveChecks);
      if (isCSS(sourceFile.fileName)) {
        sourceFile.isDeclarationFile = true;
      }
      return sourceFile;
    }

    if (info.languageServiceHost.resolveModuleNames) {
      const rmn = info.languageServiceHost.resolveModuleNames.bind(info.languageServiceHost);

      info.languageServiceHost.resolveModuleNames = (moduleNames, containingFile, reusedNames) => {
        const resolvedCSS: ts.ResolvedModuleFull[] = [];

        return rmn(moduleNames.filter(moduleName => {
          if (isRelativeCSS(moduleName)) {
            resolvedCSS.push({
              resolvedFileName: path.resolve(path.dirname(containingFile), moduleName),
              extension: ts_module.Extension.Dts,
            });
            return false;
          }
          return true;
        }), containingFile, reusedNames).concat(resolvedCSS);
      };
    }

    return info.languageService;
  }

  function getExternalFiles(project: ts_module.server.ConfiguredProject) {
    return project.getFileNames().filter(isCSS);
  }

  return { create, getExternalFiles };
};
