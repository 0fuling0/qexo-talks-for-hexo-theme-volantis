# qexo-talks-for-hexo-theme-volantis

[Qexo](https://github.com/Qexo/Qexo)说说功能，适配[hexo-theme-volantis](https://github.com/volantis-x/hexo-theme-volantis)静态文件。
适配了fancybox图片灯箱，点赞通知，样式等。

## 引入方法

在所需页面的markdown中或ejs模版中添加

```
<div id="qexot"></div>
<script src="https://gcore.jsdelivr.net/gh/0fuling0/qexo-talks-for-hexo-theme-volantis@main/talk.js"></script>
<link rel="stylesheet" href="https://gcore.jsdelivr.net/gh/0fuling0/qexo-talks-for-hexo-theme-volantis@main/talks.css">
<script>showQexoTalks("qexot", "${SITE}", 5)</script>
```

将其中的 ${SITE} 改为你的 Qexo 链接 例如 https://admin.mysite.com

> Tips: 第三个参数为每页的说说数量, 可结合实际进行修改

示例网站：[闲言碎语 - 迷宫间隙](https://www.fuling.cloudns.org/talks/)

## PJAX

如果volantis主题开启pjax，可以用`<pjax></pjax>`标签包裹，防止一些加载不出来的情况。

例如：

```
<pjax>
    <div>
	<div id="qexot"></div>
	<script src="https://gcore.jsdelivr.net/gh/0fuling0/qexo-talks-for-hexo-theme-volantis@main/talk.js"></script>
        <link rel="stylesheet" href="https://gcore.jsdelivr.net/gh/0fuling0/qexo-talks-for-hexo-theme-volantis@main/talks.css">
	<script>showQexoTalks("qexot", "${SITE}", 5)</script>
    </div>
</pjax>
```

## 侧边栏小组件

volantis的通用页面部件功能，可以将talks页面当成小部件渲染显示出来。

```blog/_config.volantis.yml
sidebar:
  position: right # left right
  # 主页、分类、归档等独立页面
  for_page: [blogger, announcement, webinfo, qexot] #category, tagcloud, blogger,
  # layout: docs/post 这类文章页面
  for_post: [blogger, toc]
  # 侧边栏组件库
  widget_library:
    qexot:
      class: page
      header:
        icon: fa-solid fa-comment
        title: 闲言碎语    
      display: [desktop, mobile]
      pid: qexot
      content: content
```

只需要设置小部件里的 `pid` 属性和文章的 `front-matter` 中设置一样的 `pid` 即可。（这里设置为pid: qexot）
