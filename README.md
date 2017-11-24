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
