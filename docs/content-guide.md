# 内容维护说明

## 界面约定

顶部导航仅保留 `Home / Topics / Notes / Archive`，页面内容使用中文，名称简短。保留头像、简洁介绍和 PaperMod 原有留白，不添加商业化标语、装饰性英文和卡片推荐。

浏览器标签使用英文标题，例如 `Home | Aozaki Touko`、`Topics | Aozaki Touko`；页面内中文标题保持原样。中文文章可填写可选 `tab_title`（如 `Sliding Window`）定制英文标签标题，未填写时使用英文栏目名。

首页保留头像和简洁介绍，最近更新采用紧凑单列文章卡片，仅展示 3 篇，在列表下方靠右以省略号链接进入历史归档；头像在桌面为 124px，手机为 100px。主题采用原生 `details/summary` 折叠目录：领域 → 技术标签 → 文章，不展示阅读顺序和「全部文章」入口。每个分支最多展示 8 篇文章，超出部分通过「更多」进入分页列表。笔记页只列短笔记，每页 12 篇。导航和所有浏览页面使用相同的左右内容边缘。

搜索位于 `/search/`，通过导航旁的放大镜进入。页底不放搜索或关于入口；搜索初始只有输入框，输入后才展示结果。`/posts/`、标签、分类、系列与原有文章 URL 保留。没有独立 Paths 页面。

## 文章 Front Matter

```yaml
---
title: 示例标题
date: 2026-11-09T12:00:00+08:00
draft: true
description: 用一两句话说明文章内容。
topics: [backend]
tags: [Redis, 缓存]
# 可选：连载名称
series: [缓存实践]
---
```

- `topics` 使用稳定的小写标识：现有 `backend`、`systems`、`algorithms`、`reflections`。新增标识后会自动生成主题；在对应 `_index.md` 中补充中文标题。
- `tags` 为技术或问题的细分目录，同一主题下会自动聚合。尽量避免同义标签和大小写变体。
- `date` 是首次发布时间，保持不变；可选 `lastmod` 仅在正文实质更新时填写，不能早于 `date`。没有独立更新时间时省略，由 Hugo 回退到发布日期。
- `description` 优先用作摘要，兼容旧的 `summary`。
- `hidden: true` 保留公开 URL，但从首页、主题、归档、笔记、搜索和相关推荐中隐藏。它不是访问控制。
- 草稿与未来发布的内容默认不进入生产构建。

不添加类型、难度字段或对应徽标；已删除的配置也从新文章模板、索引和校验中移除。

```sh
hugo new content posts/backend/my-article.md
hugo new content notes/my-note.md
```

文章文件按主要主题整理：

```text
content/posts/
├── _index.md
├── backend/       # 后端工程
├── systems/       # 计算机系统
├── algorithms/    # 数据结构与算法
└── reflections/   # 学习与回顾
```

文件夹对应文章的主要 `topics`，页面仍按 Front Matter 聚合主题。在上述四类目录中用 `hugo new` 新建文章时，模板会自动填写对应 `topics`。使用 Hugo 的[固定链接配置](https://gohugo.io/configuration/permalinks/) `/posts/:slugorcontentbasename/`，子文件夹不进入文章网址，因此旧文章链接保持不变；新增文件名需全站唯一。分类调整不改正文、文件名、发布时间，也不为每篇文章额外添加 `url` 字段。

短笔记放在 `content/notes/`，由目录自动识别。目前旧内容均为较长文章，笔记页初始为空；不要为了填充页面而错误分类。新增普通内容只修改对应 Markdown，列表、树形目录、数量、搜索和推荐自动生成。

## 个人化效果

`params.homeEffects: true` 开启整个首页的星象背景、微光闪烁和流星。各个星群分别生成不同数量的节点与最短分支连线，不重复平铺形状；普通浏览时星位固定，不跟随鼠标，也不绘制鼠标连线。流星每 1～2 秒出现一次，经常成对划过；观星时约每 0.1～0.25 秒生成一组，手机同时最多 32 颗、桌面最多 48 颗；`false` 可关闭。动画最多每秒 24 帧，后台标签暂停，减少动态效果模式只绘制静态背景。

播放器以紧凑浮条固定在右下角，5 秒没有操作后缩成 44×44px 的正圆播放/暂停按钮，鼠标移入、触摸或键盘聚焦后立即展开。收起不暂停音乐。切歌只用上一首、下一首两个小型按键，只有一首时禁用，添加多首后自动启用并首尾循环；不显示下拉选曲。点击调节按钮只展开音量。没有重复标题、进度条或数量计数，界面不显示音源链接。`params.music` 控制 `enabled`、`autoplay` 和 `volume`。自动播放受浏览器策略限制，拦截时显示「点击播放」并在读者交互后重试；手动暂停会保存，不在切页后强行恢复。静态页面跳转时音频可能短暂切换，进度与音量会保存。

曲目统一在 `data/music.yaml` 中维护：

```yaml
tracks:
  - id: before-i-become-you
    title: 在我变成你之前
    subtitle: 纸房子 ED 版
    src: audio/before-i-become-you.m4a
  # 新歌：放入 static/audio/ 后，按同样格式添加即可。
```

每首歌的 `id` 必须唯一，`title` 和 `src` 必填，本地音频缺失会让构建失败。新增后上一首、下一首和顺序循环自动更新，不需要修改模板或脚本。目前配置用户指定的「在我变成你之前」「我用什么把你留住」两首音乐，音源出处保留在 `docs/music-source.md`。

网站图标为 `static/favicon.svg`，以圆形裁剪现有图案；由 `extend_head.html` 指定 SVG 图标，兼容原有图标文件。

首页停留 `homeIdleSeconds` 秒后进入观星模式，默认 30 秒，设置为 0 可关闭。计时不因鼠标移动、滚动或输入重置。导航、头像、文章列表、页脚、播放器等界面淡出并暂时不可交互；散落的星星逐渐聚成单行、清楚可读的「love」，沿用原来字形，不做上下排布或逐字扭曲。成形后无限保留，只轻微闪烁，不定时消散或自动退出。周围星图缓慢变化、密集流星划过，并尝试播放音乐。音乐仍尊重读者手动暂停与浏览器自动播放限制。移动鼠标不会打断观星；点击、触摸、滚轮或按键恢复界面，唤醒的首次点击不会误触链接，再停留 30 秒后可重新进入。页面进入后台时暂停动画；已进入观星则保留状态，返回后继续显示字形，否则返回时重新计时。文章、搜索等其他页面不启用。减少动态效果模式直接显示静态星字，不播放变形和流星动画。

单篇文章 Front Matter 可填写：

```yaml
article_background: grid
```

允许值为 `plain`（默认）、`grid`（网格）、`dusk`（暮色）、`paper`（纸页）。全站默认值由 `params.articleBackground` 控制。文章标题下的「背景」按钮可即时切换，仅保存在读者当前浏览器、当前文章；「恢复文章默认」清除覆盖。`content/posts/systems/CSAPP.md` 配置为网格，`content/posts/reflections/Summary-Fourth.md` 配置为暮色，供预览。

## 检查

```sh
hugo --minify
python scripts/check_site.py
python scripts/check_site.py --stress
```

检查从真实 Hugo CLI 构建开始，验证旧文章 URL、头像资源、四个导航、主题树链接、搜索索引及分页。`--stress` 在临时副本中扩充至 1000 篇，并验证草稿、隐藏、未来内容排除、错误元数据拦截，以及临时添加第二首音乐后的歌单扩展。构建与稳定 JSON manifest 保存在忽略的 `tests/fixtures/runs/`，不写入正式内容。

当前本地使用 Hugo 0.154.5，Actions 保留 0.153.5。项目模板覆盖主题，不修改 PaperMod 子模块；PR 检查独立于现有 Pages 部署。

全文搜索只在搜索页加载本站 `index.json`，支持中文子串、多词 AND，按相关度返回结果，每页 12 条；不展示筛选面板和默认文章列表；不提供拼音或错字模糊搜索。全文索引大小取决于真实正文总量，大量超长文章需要继续评估索引拆分。

参考：[Hugo 模板规则](https://gohugo.io/templates/lookup-order/)、[原生分页](https://gohugo.io/templates/pagination/)、[相关文章](https://gohugo.io/content-management/related-content/)。
