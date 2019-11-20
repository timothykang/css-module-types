declare module 'icss-utils' {
  import { Root } from 'postcss';
  interface Extracted {
    icssExports: { [exportName: string]: string; }
  }
  export const extractICSS: (css: Root, removeRules?: boolean) => Extracted;
}

declare module 'postcss-icss-selectors' {
  import { Plugin } from 'postcss';
  const plugin: Plugin<{mode: 'local' | 'global'}>;
  export = plugin;
}
