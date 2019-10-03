# tsx-to-string

[![npm version](https://img.shields.io/npm/v/tsx-to-string.svg)](https://www.npmjs.com/package/tsx-to-string)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![All Contributors](https://img.shields.io/badge/all_contributors-8-orange.svg?style=flat-square)](#contributors)

Use tsx files as templates for your html!.

## Install

```sh
npm install --global tsx-to-string typescript
```

or from github

``` fish
npm install --global danielpza/tsx-to-string
```

## Usage

```
Usage: tsx-to-string <files glob pattern> [options]

Options:
  --rootDir  Same as in tsconfig.json                                   [string]
  --outDir   Same as in tsconfig.json                                   [string]
  --strict   Same as in tsconfig.json                 [boolean] [default: false]
  --html     Outputs html files                       [boolean] [default: false]
  --stdout   Outputs to stdout                        [boolean] [default: false]
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]
```

## Example

```sh
tsx-to-string index.tsx --html
```

```tsx
// index.tsx
function Layout(props: { title: string; children?: any }) {
  return (
    <html>
      <head>
        <title>{props.title}</title>
      </head>
      <body>{props.children}</body>
    </html>
  );
}

export default () => (
  <Layout title="Hello World">
    <h1>Hello World!</h1>
  </Layout>
);
```

```html
<html>
  <head>
    <title>Hello World</title>
  </head>
  <body>
    <h1>Hello World!</h1>
  </body>
</html>
```

## Related

- [https://github.com/LeDDGroup/typescript-transform-jsx](https://github.com/LeDDGroup/typescript-transform-jsx)
