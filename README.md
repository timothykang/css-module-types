# css-module-types

[TypeScript Language Service Plugin](https://github.com/Microsoft/TypeScript/wiki/Writing-a-Language-Service-Plugin) for [CSS modules](https://github.com/css-modules/css-modules).

Real-time autocompletion and validation of exports. Use alongside your build tool, such as [webpack + css-loader](https://github.com/css-modules/webpack-demo) or [browserify + css-modulesify](https://github.com/css-modules/browserify-demo).

![screenshot](https://timothykang.github.io/css-module-types.gif)

## Install

```sh
npm install --save-dev css-module-types
```

## Usage

Add declaration to `global.d.ts`:

```ts
declare module '*.css' {
  const exports: { [exportName: string]: string };
  export = exports;
}
```

Add plugin to `tsconfig.json`:

```
{
  "compilerOptions": {
    "plugins": [ { "name": "css-module-types" } ],
    ...
  },
  "include": [
    "global.d.ts",
    ...
  ]
}
```

## Css modules with default exports

In case when you are importing css modules as default export:

```ts
import styles from 'some.css'
```

 add confifuration parameter in `tsconfig.json` file:


```json
{
  "compilerOptions": {
    "plugins": [ { 
        "name": "css-module-types",
        "defaultExport": true
    } ],
    ...
  }
}
```

## Visual Studio Code integration:

1. install `typescript` and this package localy in project: `npm i typescript css-module-types --save-dev`

2. specify `"typescript.tsdk": "./node_modules/typescript/lib"` in `.vccode/settings.json`

3. switch typescript compiler to workspace version of typescript

4. restart VSCode.

