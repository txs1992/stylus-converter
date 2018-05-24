<div  align="center">
  <img src="./banner.png"></img>
</div>

<p align="center">
  <a href="http://img.shields.io/travis/txs1992/focus-outside.svg">
    <img src="http://img.shields.io/travis/txs1992/focus-outside.svg" />
  </a>
  <a href="https://img.shields.io/npm/dt/focus-outside.svg">
    <img src="https://img.shields.io/npm/dt/focus-outside.svg" />
  </a>
  <a href="https://img.shields.io/npm/dm/focus-outside.svg">
    <img src="https://img.shields.io/npm/dm/focus-outside.svg" />
  </a>
  <a href="https://img.shields.io/npm/v/focus-outside.svg">
    <img src="https://img.shields.io/npm/v/focus-outside.svg" />
  </a>
  <a href="https://img.shields.io/npm/l/focus-outside.svg">
    <img src="https://img.shields.io/npm/l/focus-outside.svg" />
  </a>
  <a href="https://img.shields.io/node/v/passport.svg">
    <img src="https://img.shields.io/node/v/passport.svg" />
  </a>
</p>

## 为什么要做这个工具

> 因为早期有个项目用到了 stylus，stylus 开发起来很爽，但 stylus 基于缩进的代码在修改的时候不是很方便，加上所在团队开发使用的都是 SCSS ，为了便于维护和统一，准备将项目中的 stylus 替换成 SCSS。但是本人又很懒，手动转换 stylus 浪费时间，且出错率大，所以灵机一动就有了这个项目。**请各位大大动用你们发财的小手，给我点个 `star`，不胜感激。^_^**

## stylus-converter 配置

### converter 配置

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| ---- | ---- | ---- | ---- | ---- |
| `quote` | 转换中遇到字符串时，使用的引号类型 | string | `'` / `"` | `'` |
| `conver` | 转换类型，例如转换成 scss 语法 | string | scss | scss |
| `autoprefixer ` | 是否自动添加前缀，stylus 在转换 css 语法的时候，有些语法会自动添加前缀例如 `@keyframes`。 | boolean | true / false | true |

### cli 配置

| 参数 | 简写 | 说明 | 可选值 | 默认值 |
| ---- | ---- | ---- | ---- | ---- |
| `--quote` | `-q` | 转换中遇到字符串时，使用的引号类型 | single / dobule | single |
| `--input` | `-i` | 输入名称，可以是文件或者是文件夹的路径 | - | - |
| `--output` | `-o` | 输出名称，可以是文件或者是文件夹的路径 | - | - |
| `--conver ` | `-c` | 转换类型，例如转换成 scss 语法 | scss | scss |
| `--directory` | `-d` | 输入和输出路径是否是个目录 | yes / no | no |
| `--autoprefixer ` | `-p` | 是否添加前缀 | yes / no | yes |

## 使用示例

```javascript
npm install -g stylus-converter

// 运行 cli 转换文件
stylus-conver -i test.styl -o test.scss
```

## 转换文件比较

### 转换前的 stylus 源码

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

### 转换后的 sass 源码

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

> 如果你不想你转换的 @keyframes 添加默认前缀，请设置 `options.autoprefixer = false`

### 转换前的 `.vue` 文件
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

### 转换后的 `.vue` 文件
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


## 搭建开发环境

```text
1. 先 fork 项目再 clone 项目到本地
git clone git@github.com:<your github>/stylus-converter.git

2. 进入项目目录
cd stylus-converter

3. 安装项目依赖
npm install

4. 打包编译源文件
npm run build

5. 本地运行 dev 打包并转换 stylus 测试文件
npm run dev
```
