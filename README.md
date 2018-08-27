<div  align="center">
  <img src="./banner.png"></img>
</div>

<p align="center">
  <a href="http://img.shields.io/travis/txs1992/stylus-converter.svg">
    <img src="http://img.shields.io/travis/txs1992/stylus-converter.svg" />
  </a>
  <a href="https://img.shields.io/npm/dt/stylus-converter.svg">
    <img src="https://img.shields.io/npm/dt/stylus-converter.svg" />
  </a>
  <a href="https://img.shields.io/npm/dm/stylus-converter.svg">
    <img src="https://img.shields.io/npm/dm/stylus-converter.svg" />
  </a>
  <a href="https://img.shields.io/npm/v/stylus-converter.svg">
    <img src="https://img.shields.io/npm/v/stylus-converter.svg" />
  </a>
  <a href="https://img.shields.io/npm/l/stylus-converter.svg">
    <img src="https://img.shields.io/npm/l/stylus-converter.svg" />
  </a>
  <a href="https://img.shields.io/node/v/passport.svg">
    <img src="https://img.shields.io/node/v/passport.svg" />
  </a>
</p>

<div align="center">
  <h3>
    <a href="https://github.com/txs1992/stylus-converter/blob/master/doc/zh-cn.md#readme">
      中文
    </a>
    <span> | </span>
    <a href="https://github.com/txs1992/stylus-converter#readme">
      English
    </a>
  </h3>
</div>

## What is this

> A tool that converts a stylus into scss, or less, or other precompiled CSS.

## stylus-converter config

### converter options

| Attribute | Description | Type | Accepted Values | Default |
| ---- | ---- | ---- | ---- | ---- |
| `quote` | The quote type to use when converting strings | string | `'` / `"` | `'` |
| `conver` | Conversion type, such as conversion to scss syntax | string | scss | scss |
| `autoprefixer` | Whether or not to automatically add a prefix, stylus will automatically add prefixes when converting stylus grammars. `@keyframes` | boolean | true / false | true |
| `indentVueStyleBlock` | Indent the entire style block of a vue file with a certain amount of spaces. | number | number | 0 |

### cli options

| Attribute | Shorthand | Description | Accepted Values | Default |
| ---- | ---- | ---- | ---- | ---- |
| `--quote` | `-q` | The quote type to use when converting strings | single / dobule | single |
| `--input` | `-i` | Enter a name, which can be a path to a file or a folder | - | - |
| `--output` | `-o` | Output name, can be a path to a file or a folder | - | - |
| `--conver ` | `-c` | Conversion type, such as conversion to scss syntax | scss | scss |
| `--directory` | `-d` | Whether the input and output paths are directories | yes / no | no |
| `--autoprefixer` | `-p` | Whether to add a prefix | yes / no | yes |
| `--indentVueStyleBlock` | `-v` | Indent the entire style block of a vue file with a certain amount of spaces. | number | 0 |

### How to handle single line comments
```js
1. First fork project and then clone project to local
git clone git@github.com:<your github>/stylus-converter.git

2. Enter the project directory
cd stylus-converter

3. Installation project depends
npm install

4. Go to line 581 of the `node_modules/stylus/lib/lexer.js` file.

5. Modify the code below.
// before modification
if ('/' == this.str[0] && '/' == this.str[1]) {
  var end = this.str.indexOf('\n');
  if (-1 == end) end = this.str.length;
  this.skip(end);
  return this.advance();
}

// After modification
if ('/' == this.str[0] && '/' == this.str[1]) {
  var end = this.str.indexOf('\n');
  const str = this.str.substring(0, end)
  if (-1 == end) end = this.str.length;
  this.skip(end);
  return new Token('comment', new nodes.Comment(str, suppress, true))
}
```

## Use examples

```javascript
// download stylus-converter
npm install -g stylus-converter

// Run the cli conversion file
stylus-conver -i test.styl -o test.scss

// Run the cli conversion directory
// cd your project
mv src src-temp
stylus-conver -d yes -i src-temp -o src
```

## Conversion file comparison

### Stylus source code before conversion

```stylus
handleParams(args...)
  args

@media screen and (max-width: 500px) and (min-width: 100px), (max-width: 500px) and (min-height: 200px)
  .foo
    color: #100

.foo
  for i in 1..4
    @media (min-width: 2 * (i + 7) px)
```

### Converted SCSS source code

```scss
@function handleParams($args...) {
  @return $args;
}

@media screen and (max-width: 500px) and (min-width: 100px), (max-width: 500px) and (min-height: 200px) {
  .foo {
    color: #100;
  }
}

.foo {
  @for $i from 1 through 4 {
    @media (min-width: 2 * ($i + 7) px) {
      width: 100px * $i;
    }
  }
}
```

> If you do not want to add the default prefix for your converted @keyframes, please set `options.autoprefixer = false`

### The `.vue` file before conversion

```html
<template>
  <div class="page-home">
    <el-button>click me</el-button>
  </div>
</template>

<style lang="stylus">
.page-home
  .el-button
    margin: 10px auto
</style>
```

### Converted `.vue`  file

```html
<template>
  <div class="page-home">
    <el-button>click me</el-button>
  </div>
</template>

<style lang="scss">
.page-home {
  .el-button {
    margin: 10px auto;
  }
}
</style>
```

## Build a development environment

```text
1. First fork project and then clone project to local
git clone git@github.com:<your github>/stylus-converter.git

2. Enter the project directory
cd stylus-converter

3. Installation project depends
npm install

4. Package compilation source file
npm run build

5. Local debugging cli
npm link
```
