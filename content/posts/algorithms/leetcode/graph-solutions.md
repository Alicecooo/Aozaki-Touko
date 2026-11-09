---
title: "图论题解"
tab_title: "Graph Solutions"
date: "2026-11-10T00:41:49+08:00"
draft: false
topics: ["algorithms"]
series: ["LeetCode"]
tags: ["图论", "搜索"]
summary: "岛屿、网格搜索、拓扑排序与前缀树的题解。"
---

# 岛屿数量

[200. 岛屿数量](https://leetcode.cn/problems/number-of-islands/)

岛屿数量：网格 DFS/BFS「淹岛」——碰到陆地就把连通的 '1' 全标成水，每次启动淹没 ans++。并查集合并陆地也行。越界和遇水是递归出口。

复杂度：时间 O(mn)，空间 O(mn) 最坏栈

```typescript
class Solution {
  numIslands(grid: string[][]): number {
    const m = grid.length, n = grid[0].length
    const dfs = (i: number, j: number) => {
      if (i < 0 || i >= m || j < 0 || j >= n || grid[i][j] !== '1') return
      grid[i][j] = '0'
      dfs(i + 1, j); dfs(i - 1, j); dfs(i, j + 1); dfs(i, j - 1)
    }
    let ans = 0
    for (let i = 0; i < m; i++)
      for (let j = 0; j < n; j++)
        if (grid[i][j] === '1') { ans++; dfs(i, j) }
    return ans
  }
}
```

# 腐烂的橘子

[994. 腐烂的橘子](https://leetcode.cn/problems/rotting-oranges/)

腐烂橘子：多源 BFS。一开始所有烂橘子入队，一层层向外传染新鲜的；分钟数就是 BFS 层数。最后若还有新鲜的，返回 -1。

注意：没有新鲜橘子时答案是 0；队列里可以存坐标，用一个变量记本层个数，或在状态里带时间。

复杂度：时间 O(mn)，空间 O(mn)

```typescript
class Solution {
  orangesRotting(grid: number[][]): number {
    const m = grid.length, n = grid[0].length
    const q: [number, number][] = []
    let fresh = 0
    for (let i = 0; i < m; i++)
      for (let j = 0; j < n; j++) {
        if (grid[i][j] === 2) q.push([i, j])
        else if (grid[i][j] === 1) fresh++
      }
    if (fresh === 0) return 0
    const dirs = [[1,0],[-1,0],[0,1],[0,-1]]
    let minutes = 0
    while (q.length) {
      const size = q.length
      let rotten = false
      for (let s = 0; s < size; s++) {
        const [x, y] = q.shift()!
        for (const [dx, dy] of dirs) {
          const nx = x + dx, ny = y + dy
          if (nx < 0 || nx >= m || ny < 0 || ny >= n || grid[nx][ny] !== 1) continue
          grid[nx][ny] = 2
          fresh--
          rotten = true
          q.push([nx, ny])
        }
      }
      if (rotten) minutes++
    }
    return fresh === 0 ? minutes : -1
  }
}
```

# 课程表

[207. 课程表](https://leetcode.cn/problems/course-schedule/)

课程表：有向图判环。建邻接表和入度，拓扑排序把入度 0 的入队，学完减邻居入度。最终学完数等于 n 则无环可完成；否则有环。

复杂度：时间 O(n+e)，空间 O(n+e)

```typescript
class Solution {
  canFinish(numCourses: number, prerequisites: number[][]): boolean {
    const g: number[][] = Array.from({ length: numCourses }, () => [])
    const indeg = new Array(numCourses).fill(0)
    for (const [a, b] of prerequisites) {
      g[b].push(a)
      indeg[a]++
    }
    const q: number[] = []
    for (let i = 0; i < numCourses; i++) if (indeg[i] === 0) q.push(i)
    let taken = 0
    while (q.length) {
      const u = q.shift()!
      taken++
      for (const v of g[u]) {
        if (--indeg[v] === 0) q.push(v)
      }
    }
    return taken === numCourses
  }
}
```

# 实现 Trie (前缀树)

[208. 实现 Trie (前缀树)](https://leetcode.cn/problems/implement-trie-prefix-tree/)

Trie（前缀树）：每个节点 26 个孩子指针 + `isEnd` 标记。`insert` 一路建节点，`search` 要走到终点且 `isEnd`，`startsWith` 只要前缀路径存在。

实现时节点类写清楚，空串、单字母这些边界顺手测一下。

复杂度：时间 O(L)，空间 O(字典总字符数)

```typescript
class TrieNode {
  children = new Map<string, TrieNode>()
  isEnd = false
}
class Trie {
  private root = new TrieNode()
  insert(word: string): void {
    let node = this.root
    for (const c of word) {
      if (!node.children.has(c)) node.children.set(c, new TrieNode())
      node = node.children.get(c)!
    }
    node.isEnd = true
  }
  search(word: string): boolean {
    const node = this.find(word)
    return !!node && node.isEnd
  }
  startsWith(prefix: string): boolean {
    return !!this.find(prefix)
  }
  private find(s: string): TrieNode | null {
    let node: TrieNode | null = this.root
    for (const c of s) {
      if (!node!.children.has(c)) return null
      node = node!.children.get(c)!
    }
    return node
  }
}
```
