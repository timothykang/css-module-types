import { extractICSS } from 'icss-utils';
import * as ts_module from 'typescript/lib/tsserverlibrary';
import * as fs from 'fs';
import * as path from 'path';
import * as postcss from 'postcss';
import * as postcssIcssSelectors from 'postcss-icss-selectors';

export = function init({ typescript: ts }: { typescript: typeof ts_module }) {
  function isCSS(fileName: string): boolean {
    return /\.css$/i.test(fileName);
  }

  function isRelativeCSS(fileName: string): boolean {
    return isCSS(fileName) && /^\.\.?($|[\\/])/.test(fileName);
  }

  function create(info: ts.server.PluginCreateInfo) {
    const processor = postcss(postcssIcssSelectors({ mode: 'local' }))

    function getDts(css: string | Buffer) {
      return Object.keys(extractICSS(processor.process(css).root).icssExports)
        .map(exportName => `export const ${exportName}: string;`)
        .join('')
    }

    function getDtsSnapshot(scriptSnapshot: ts.IScriptSnapshot) {
      return ts.ScriptSnapshot.fromString(getDts(scriptSnapshot.getText(0, scriptSnapshot.getLength())));
    }

    if (info.languageServiceHost.resolveModuleNames) {
      const rmn: (moduleNames: string[], containingFile: string, reusedNames?: string[]) => ts.ResolvedModule[] = info.languageServiceHost.resolveModuleNames.bind(info.languageServiceHost);

      info.languageServiceHost.resolveModuleNames = (moduleNames, containingFile, reusedNames) => {
        return moduleNames.map(moduleName => (
          isRelativeCSS(moduleName)
            ? {
              resolvedFileName: path.resolve(path.dirname(containingFile), moduleName),
              extension: ts_module.Extension.Dts,
            }
            : rmn([moduleName], containingFile, reusedNames)[0]
        ));
      };
    }

    if (info.languageServiceHost.readFile) {
      const rf: (path: string, encoding?: string) => string | undefined = info.languageServiceHost.readFile.bind(info.languageServiceHost);

      info.languageServiceHost.readFile = (path, encoding) => {
        info.project.projectService.logger.info(`XXX ${path}`);
        return (
          isCSS(path)
            ? getDts(fs.readFileSync(path))
            : rf(path, encoding)
        );
      }
    }

    return info.languageService;
  }

  function getExternalFiles(project: ts_module.server.ConfiguredProject) {
    return project.getFileNames().filter(isCSS);
  }

  return { create, getExternalFiles };
};
