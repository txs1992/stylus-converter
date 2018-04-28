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
keyframe-name = pulse
default-width = 200px
$val = 20

@keyframes { $keyframe-name }
  for i in 0..5
    {20% * i}
      opacity (i / $val)

@keyframes auto-color
  0%
    color red
  50%
    color blue
  100%
    color yellow

@keyframes foo
  from
    color: black
  to
    color: white


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

body
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
$keyframe-name: pulse;
$default-width: 200px;
$val: 20;

@-webkit-keyframes #{$keyframe-name} {
  @for $i from 0 through 5 {
    #{20% * $i} {
      opacity: $i / $val;
    }
  }
}

@-moz-keyframes #{$keyframe-name} {
  @for $i from 0 through 5 {
    #{20% * $i} {
      opacity: $i / $val;
    }
  }
}

@-ms-keyframes #{$keyframe-name} {
  @for $i from 0 through 5 {
    #{20% * $i} {
      opacity: $i / $val;
    }
  }
}

@-o-keyframes #{$keyframe-name} {
  @for $i from 0 through 5 {
    #{20% * $i} {
      opacity: $i / $val;
    }
  }
}

@keyframes #{$keyframe-name} {
  @for $i from 0 through 5 {
    #{20% * $i} {
      opacity: $i / $val;
    }
  }
}

@-webkit-keyframes auto-color {
  0% {
    color: red;
  }
  50% {
    color: blue;
  }
  100% {
    color: yellow;
  }
}

@-moz-keyframes auto-color {
  0% {
    color: red;
  }
  50% {
    color: blue;
  }
  100% {
    color: yellow;
  }
}

@-ms-keyframes auto-color {
  0% {
    color: red;
  }
  50% {
    color: blue;
  }
  100% {
    color: yellow;
  }
}

@-o-keyframes auto-color {
  0% {
    color: red;
  }
  50% {
    color: blue;
  }
  100% {
    color: yellow;
  }
}

@keyframes auto-color {
  0% {
    color: red;
  }
  50% {
    color: blue;
  }
  100% {
    color: yellow;
  }
}

@-webkit-keyframes foo {
  from {
    color: black;
  }
  to {
    color: white;
  }
}

@-moz-keyframes foo {
  from {
    color: black;
  }
  to {
    color: white;
  }
}

@-ms-keyframes foo {
  from {
    color: black;
  }
  to {
    color: white;
  }
}

@-o-keyframes foo {
  from {
    color: black;
  }
  to {
    color: white;
  }
}

@keyframes foo {
  from {
    color: black;
  }
  to {
    color: white;
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
  @if $a > $b and $a > $b + $b {
    @return $a - $b
  } @else if $a < $b or $b - $a > $a {
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

body {
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


## stylus converter 进度表

### stylus to scss

- [x] 转换变量
- [x] 转换运算符
- [x] 转换选择器
- [x] 转换语法块
- [x] 转换导入语法
- [x] 转换条件语句
- [x] 转换自定义函数
- [x] 转换 css property
- [x] 转换表达式
- [x] 转换参数列表
- [x] 转换
- [x] 转换插值
- [ ] 转换 url()
- [x] 转换循环语法
- [ ] 转换 extend
- [ ] 转换 Feature
- [ ] 转换 keyframes
- [ ] 转换 CSS 字面量
- [x] 转换 call mixin
- [x] 转换 call function

### stylus to less

- [ ] 转换变量
- [ ] 转换运算符
- [ ] 转换选择器
- [ ] 转换语法块
- [ ] 转换导入语法
- [ ] 转换条件语句
- [ ] 转换自定义函数
- [ ] 转换 css property
- [ ] 转换表达式
- [ ] 转换参数列表
- [ ] 转换 mixin
- [ ] 转换插值
- [ ] 转换 url()
- [ ] 转换循环语法
- [ ] 转换 extend
- [ ] 转换 Feature
- [ ] 转换 CSS 字面量
- [ ] 转换 keyframes
- [ ] 转换 call mixin
- [ ] 转换 call function
