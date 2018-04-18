# stylus-converter

![](http://img.shields.io/travis/1969290646/stylus-converter.svg)
![](https://img.shields.io/npm/dt/stylus-converter.svg)
![](https://img.shields.io/npm/v/stylus-converter.svg)
![](https://img.shields.io/npm/l/stylus-converter.svg)

## 注意

> 本项目还在测试中，请不要使用该工具转换您公司的项目代码。由于 stylus 不支持浏览器端，所以依赖 stylus 的本库暂时也不支持浏览器端，后期视情况考虑提供 node 服务。

## 为什么要做这个工具

> 因为早期有个项目用到了 stylus，stylus 开发起来很爽，但维护起来让人崩溃。加上 stylus 作者本人已经都已经放弃维护了，所以准备转换其他预编译 CSS 语言。但是本人又很懒，手动转换 stylus 浪费时间，且出错率大，所以灵机一动就有了这个项目。

## stylus converter 进度表

### stylus to scss

- [x] 转换选择器
- [x] 转换语法块
- [x] 转换 if / else 语法
- [x] 转换自定义函数
- [x] 转换 css property
- [x] 转换表达式
- [x] 转换参数列表
- [x] 转换 mixin
- [ ] 转换调用函数
- [ ] 转换调用 mixin

### stylus to less

- [ ] 转换选择器
- [ ] 转换语法块
- [ ] 转换 if / else 语法
- [ ] 转换自定义函数
- [ ] 转换 css property
- [ ] 转换表达式
- [ ] 转换参数列表
- [ ] 转换 mixin
- [ ] 转换调用函数
- [ ] 转换调用 mixin


## 搭建开发环境

```text
1. 先 fork 项目再 clone 项目到本地
git clone git@github.com:<your github>/focus-outside.git

2. 安装项目依赖
npm install

3. 打包编译源文件
npm run build

4. 本地运行
npm run dev
```

## 使用示例

```javascript
// 下载转换器
npm install stylus-converter

// src/simple.styl
add(a, b)
  if a > b
    a - b
  else if a < b
    a + b
  else
    a * b

default-border-radius(n)
  -webkit-border-radius n
  -moz-border-radius n
  border-radius n

body
  padding add(10px, 5)
  default-border-radius(5px)

  div
    color red

// src/test.js
const fs = require('fs')
const converter = require('stylus-converter')

fs.readFile('src/simple.styl', (err, res) => {
  if (err) return
  const result = res.toString()
  const scss = converter(result)
  fs.writeFile('src/simple.scss', scss)
})

// 执行 node src/test.js

// 编译后的 scss 源码, src/simple.scss
@function add (a, b) {
  @if a > b {
    @return a - b
  } @else if a < b {
    @return a + b
  } @else {
    @return a * b
  }
}

@mixin  default-border-radius (n) {
  -webkit-border-radius: n;
  -moz-border-radius: n;
  border-radius: n;
}

body {
  padding: add(10px, 5);
  default-border-radius(5px);

  div {
    color: red;
  }
}
```
