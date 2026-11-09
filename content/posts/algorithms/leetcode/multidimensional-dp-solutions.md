---
title: "多维动态规划题解"
tab_title: "Multidimensional DP Solutions"
date: "2026-11-10T00:41:47+08:00"
draft: false
topics: ["algorithms"]
series: ["LeetCode"]
tags: ["动态规划"]
summary: "网格路径、公共子序列、编辑距离与模式匹配的动态规划。"
---

# 不同路径

[62. 不同路径](https://leetcode.cn/problems/unique-paths/)

机器人只能右或下，从左上到右下的路径数。`dp[i][j]=dp[i-1][j]+dp[i][j-1]`，第一行/列都是 1。可以压成一维；也可直接算组合数 C(m+n-2, m-1)。

复杂度：时间 O(mn)，空间 O(n)

```typescript
class Solution {
  uniquePaths(m: number, n: number): number {
    const dp = new Array(n).fill(1)
    for (let i = 1; i < m; i++)
      for (let j = 1; j < n; j++) dp[j] += dp[j - 1]
    return dp[n - 1]
  }
}
```

# 最小路径和

[64. 最小路径和](https://leetcode.cn/problems/minimum-path-sum/)

最小路径和：只能向右或向下，`dp[i][j]=grid[i][j]+min(上,左)`。可以直接在 grid 上原地累加，省空间。

复杂度：时间 O(mn)，空间 O(1) 原地

```typescript
class Solution {
  minPathSum(grid: number[][]): number {
    const m = grid.length, n = grid[0].length
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        if (i === 0 && j === 0) continue
        const up = i > 0 ? grid[i - 1][j] : Infinity
        const left = j > 0 ? grid[i][j - 1] : Infinity
        grid[i][j] += Math.min(up, left)
      }
    }
    return grid[m - 1][n - 1]
  }
}
```

# 最长回文子串

[5. 最长回文子串](https://leetcode.cn/problems/longest-palindromic-substring/)

最长回文子串：中心扩展最省事——每个字符、每个「缝」当中心向外扩，记录最长起止。DP `dp[i][j]` 也能做。Manacher 是进阶优化。

复杂度：中心扩展 O(n²)/O(1)

```typescript
class Solution {
  longestPalindrome(s: string): string {
    let start = 0, maxLen = 0
    const expand = (l: number, r: number) => {
      while (l >= 0 && r < s.length && s[l] === s[r]) { l--; r++ }
      if (r - l - 1 > maxLen) {
        start = l + 1
        maxLen = r - l - 1
      }
    }
    for (let i = 0; i < s.length; i++) {
      expand(i, i)
      expand(i, i + 1)
    }
    return s.slice(start, start + maxLen)
  }
}
```

# 最长公共子序列

[1143. 最长公共子序列](https://leetcode.cn/problems/longest-common-subsequence/)

最长公共子序列：`dp[i][j]` 表示两串前缀的 LCS；字符相等则对角 +1，否则取左或上的最大。可滚动成一维省空间。

复杂度：时间 O(mn)，空间 O(mn) 或 O(min)

```typescript
class Solution {
  longestCommonSubsequence(text1: string, text2: string): number {
    const m = text1.length, n = text2.length
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (text1[i - 1] === text2[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1
        else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
    return dp[m][n]
  }
}
```

# 编辑距离

[72. 编辑距离](https://leetcode.cn/problems/edit-distance/)

编辑距离：`dp[i][j]` 把 word1 前 i 变成 word2 前 j 的最少操作。字符相等抄对角；否则插入/删除/替换三者取 min 再 +1。边界是空串对另一串的长度。

复杂度：时间 O(mn)，空间 O(mn)

```typescript
class Solution {
  minDistance(word1: string, word2: string): number {
    const m = word1.length, n = word2.length
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
    for (let i = 0; i <= m; i++) dp[i][0] = i
    for (let j = 0; j <= n; j++) dp[0][j] = j
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (word1[i - 1] === word2[j - 1]) dp[i][j] = dp[i - 1][j - 1]
        else dp[i][j] = Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]) + 1
      }
    }
    return dp[m][n]
  }
}
```

# 正则表达式匹配

[10. 正则表达式匹配](https://leetcode.cn/problems/regular-expression-matching/)

正则匹配 `.` 与 `*`。DP `dp[i][j]` 表示 s 前 i、p 前 j 是否匹配。遇 `*` 分两种：匹配 0 次看 `dp[i][j-2]`；或前一字符能配上且 `dp[i-1][j]`。旧笔记调了一晚上，基本都卡在 `*` 转移和空串初始化。

复杂度：时间 O(mn)，空间 O(mn)

```typescript
class Solution {
  isMatch(s: string, p: string): boolean {
    const m = s.length, n = p.length
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(false))
    dp[0][0] = true
    for (let j = 2; j <= n; j++) if (p[j - 1] === '*') dp[0][j] = dp[0][j - 2]
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (p[j - 1] === '*') {
          dp[i][j] = dp[i][j - 2]
          if (p[j - 2] === '.' || p[j - 2] === s[i - 1]) dp[i][j] = dp[i][j] || dp[i - 1][j]
        } else if (p[j - 1] === '.' || p[j - 1] === s[i - 1]) {
          dp[i][j] = dp[i - 1][j - 1]
        }
      }
    }
    return dp[m][n]
  }
}
```

# 通配符匹配

[44. 通配符匹配](https://leetcode.cn/problems/wildcard-matching/)

通配符 `?` 单字符、`*` 任意序列。DP 可做；贪心双指针则要记住 `*` 的位置，匹配失败就让 `*` 多吞一个字符再试。旧笔记长用例翻车，多半是 `*` 回溯进度没记对。

复杂度：DP O(mn)；贪心平均更快

```typescript
class Solution {
  isMatch(s: string, p: string): boolean {
    const m = s.length, n = p.length
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(false))
    dp[0][0] = true
    for (let j = 1; j <= n; j++) if (p[j - 1] === '*') dp[0][j] = dp[0][j - 1]
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (p[j - 1] === '*') dp[i][j] = dp[i][j - 1] || dp[i - 1][j]
        else if (p[j - 1] === '?' || p[j - 1] === s[i - 1]) dp[i][j] = dp[i - 1][j - 1]
      }
    }
    return dp[m][n]
  }
}
```

# 不同的子序列

[115. 不同的子序列](https://leetcode.cn/problems/distinct-subsequences/)

不同子序列：求 s 中有多少个子序列等于 t。一维 DP 倒序更新：`s` 当前字符和 `t[j-1]` 相等时 `dp[j]+=dp[j-1]`。旧笔记从二维压到一维就是这步。

复杂度：时间 O(mn)，空间 O(|t|)

```typescript
class Solution {
  numDistinct(s: string, t: string): number {
    const m = s.length, n = t.length
    const dp = new Array(n + 1).fill(0)
    dp[0] = 1
    for (let i = 1; i <= m; i++) {
      for (let j = n; j >= 1; j--) {
        if (s[i - 1] === t[j - 1]) dp[j] += dp[j - 1]
      }
    }
    return dp[n]
  }
}
```
