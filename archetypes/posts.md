---
date: '{{ .Date }}'
draft: true
tags: []
topics: {{ $topic := path.Base .File.Dir }}{{ if in (slice "backend" "systems" "algorithms" "reflections") $topic }}[{{ $topic }}]{{ else }}[]{{ end }}
title: '{{ replace .File.ContentBaseName "-" " " | title }}'
summary: ""
---
