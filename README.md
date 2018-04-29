# stylus-converter

![](http://img.shields.io/travis/TaoXuSheng/stylus-converter.svg)
![](https://img.shields.io/npm/dt/stylus-converter.svg)
![](https://img.shields.io/npm/v/stylus-converter.svg)
![](https://img.shields.io/npm/l/stylus-converter.svg)


## 注意

> 本项目还在测试中，请不要使用该工具转换您公司的项目代码。由于 stylus 不支持浏览器端，所以依赖 stylus 的本库暂时也不支持浏览器端，后期视情况考虑提供 node 服务。


## 为什么要做这个工具

> 因为早期有个项目用到了 stylus，stylus 开发起来很爽，但维护起来让人崩溃。加上 stylus 作者本人已经都已经放弃维护了，所以准备转换其他预编译 CSS 语言。但是本人又很懒，手动转换 stylus 浪费时间，且出错率大，所以灵机一动就有了这个项目。


## 使用示例

### 下载并执行
```javascript
// 下载 stylus-converter
npm install stylus-converter

// 编写测试代码读取 stylus 源文件
// src/test.js
const fs = require('fs')
const converter = require('stylus-converter')

fs.readFile('src/test.styl', (err, res) => {
  if (err) return
  const result = res.toString()
  const scss = converter(result)
  fs.writeFile('src/test.scss', scss)
})

// 执行测试代码
node src/test.js
```

### 转换前的 stylus 源码
```stylus
@media screen and (max-width: 500px) and (min-width: 100px), (max-width: 500px) and (min-height: 200px)
  .foo
    color: #100

.foo
  for i in 1..4
    @media (min-width: 2 * (i + 7) px)
      width: 100px*i

keyframe-name = pulse
default-width = 200px
$val = 20

@keyframes { $keyframe-name }
  for i in 0..5
    {20% * i}
      opacity (i / $val)

#logo
  default-border = 1px solid #ccc
  border default-border
  width: default-width
  height: h = 80px
  margin-top: -(h / 2)
  padding-top: -(@width * 3)

add(a, b)
  if a > b && a > b + b
    a - b
  else if a < b || b - a > a
    a + b
  else
    a * b

default-border-radius(prop, args)
  -webkit-{prop}-radius args
  -moz-{prop}-radius args
  {prop}-radius args

.message
  margin: 10px
  border: 1px solid #eee

body
  @extend .message
  padding add(10px, 5)
  default-border-radius(5px)

  div
    color red
    for num in (1..5)
      foo num
    for str in 1 2 3 4 5
      bar str
```

### 转换后的 sass 源码
```sass
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

$keyframe-name: pulse;
$default-width: 200px;
$val: 20;

@keyframes #{$keyframe-name} {
  @for $i from 0 through 5 {
    #{20% * $i} {
      opacity: $i / $val;
    }
  }
}

#logo {
  $default-border: 1px solid #ccc;
  border: $default-border;
  width: $default-width;
  $h: 80px;
  height: $h;
  margin-top: -($h / 2);
  padding-top: -($default-border * 3);
}

@function add($a, $b) {
  @if $a > $b and ($a > $b + $b) {
    @return $a - $b
  } @else if $a < $b or ($b - $a > $a) {
    @return $a + $b
  } @else {
    @return $a * $b
  }
}

@mixin default-border-radius($prop, $args) {
  -webkit-#{$prop}-radius: $args;
  -moz-#{$prop}-radius: $args;
  #{$prop}-radius: $args;
}

.message {
  margin: 10px;
  border: 1px solid #eee;
}

body {
  @extend .message;
  padding: add(10px, 5);
  @include default-border-radius(5px);

  div {
    color: red;
    @for $num from 1 through 5 {
      foo: $num;
    }
    @each $str in 1, 2, 3, 4, 5 {
      bar: $str;
    }
  }
}
```

> 如果你不想你转换的 @keyframes 添加默认前缀，请设置 `options.autoprefixer = false`


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


## stylus 转换器进度表 stylus Converter Schedule

### stylus to scss

- [ ] Atrule
- [ ] Member
- [ ] Return
- [x] Mixins
- [ ] @Block
- [x] @Media
- [x] @Import
- [x] @Extend
- [ ] Atblock
- [ ] Charset
- [ ] Ternary
- [ ] Comments
- [ ] Supports
- [ ] NameScope
- [x] Variables
- [x] Operators
- [x] Selectors
- [x] Iteration
- [x] Functions
- [x] @Keyframes
- [ ] @Font-face
- [x] CSS Literal
- [x] Call Mixins
- [x] Syntax Block
- [x] Conditionals
- [x] Cll Functions
- [x] Interpolation
- [x] Keyword Arguments
- [x] Built-in Functions

### stylus to less


- [ ] Atrule
- [ ] Mixins
- [ ] Member
- [ ] Return
- [ ] @Block
- [ ] @Media
- [ ] @Import
- [ ] @Extend
- [ ] Atblock
- [ ] Charset
- [ ] Ternary
- [ ] Comments
- [ ] Supports
- [ ] NameScope
- [ ] Variables
- [ ] Operators
- [ ] Selectors
- [ ] Iteration
- [ ] Functions
- [ ] @Keyframes
- [ ] @Font-face
- [ ] CSS Literal
- [ ] Call Mixins
- [ ] Syntax Block
- [ ] Conditionals
- [ ] Cll Functions
- [ ] Interpolation
- [ ] Keyword Arguments
- [ ] Built-in Functions
