---
title: "回溯题解"
tab_title: "Backtracking Solutions"
date: "2026-11-10T00:41:50+08:00"
draft: false
topics: ["algorithms"]
series: ["LeetCode"]
tags: ["回溯"]
summary: "排列、组合、子集、棋盘与搜索问题的回溯过程。"
---

# 全排列

[46. 全排列](https://leetcode.cn/problems/permutations/)

全排列模板：`path` + `used[]`，选一个没用过的推进，长度到 n 就拷贝答案，再撤销。理解「做选择 / 递归 / 撤销」之后，子集、组合都是小改动。

复杂度：时间 O(n·n!)，空间 O(n)

```typescript
class Solution {
  permute(nums: number[]): number[][] {
    const ans: number[][] = []
    const path: number[] = []
    const used = new Array(nums.length).fill(false)
    const dfs = () => {
      if (path.length === nums.length) { ans.push([...path]); return }
      for (let i = 0; i < nums.length; i++) {
        if (used[i]) continue
        used[i] = true
        path.push(nums[i])
        dfs()
        path.pop()
        used[i] = false
      }
    }
    dfs()
    return ans
  }
}
```

# 子集

[78. 子集](https://leetcode.cn/problems/subsets/)

子集：回溯「从 start 起选下一个」，路径本身就是一个子集，每个节点都收进答案（含空集）。也可用位枚举 `0..(1<<n)-1`。

复杂度：时间 O(n·2^n)，空间 O(n)

```typescript
class Solution {
  subsets(nums: number[]): number[][] {
    const ans: number[][] = []
    const path: number[] = []
    const dfs = (start: number) => {
      ans.push([...path])
      for (let i = start; i < nums.length; i++) {
        path.push(nums[i])
        dfs(i + 1)
        path.pop()
      }
    }
    dfs(0)
    return ans
  }
}
```

# 电话号码的字母组合

[17. 电话号码的字母组合](https://leetcode.cn/problems/letter-combinations-of-a-phone-number/)

电话号码字母组合：digits 映射到 `abc/def/...`，回溯按位选字母拼串。digits 为空返回空数组，别返回 `[""]`。

复杂度：时间 O(4^n·n)，空间 O(n)

```typescript
class Solution {
  letterCombinations(digits: string): string[] {
    if (!digits) return []
    const map: Record<string, string> = {
      '2':'abc','3':'def','4':'ghi','5':'jkl',
      '6':'mno','7':'pqrs','8':'tuv','9':'wxyz',
    }
    const ans: string[] = []
    const path: string[] = []
    const dfs = (i: number) => {
      if (i === digits.length) { ans.push(path.join('')); return }
      for (const c of map[digits[i]]) {
        path.push(c)
        dfs(i + 1)
        path.pop()
      }
    }
    dfs(0)
    return ans
  }
}
```

# 组合总和

[39. 组合总和](https://leetcode.cn/problems/combination-sum/)

组合总和可重复使用候选：递归下一轮仍从下标 i 开始（不是 i+1）；用 start 保证序列非降，从而组合不重复。注意先排序方便剪枝。

复杂度：指数级，与解个数有关

```typescript
class Solution {
  combinationSum(candidates: number[], target: number): number[][] {
    candidates.sort((a, b) => a - b)
    const ans: number[][] = []
    const path: number[] = []
    const dfs = (start: number, remain: number) => {
      if (remain === 0) { ans.push([...path]); return }
      for (let i = start; i < candidates.length; i++) {
        if (candidates[i] > remain) break
        path.push(candidates[i])
        dfs(i, remain - candidates[i])
        path.pop()
      }
    }
    dfs(0, target)
    return ans
  }
}
```

# 括号生成

[22. 括号生成](https://leetcode.cn/problems/generate-parentheses/)

生成括号的剪枝很漂亮：左括号数 < n 才能放 `(`；右括号数 < 左括号数才能放 `)`。这样不会生成非法串，也不用事后过滤。

复杂度：卡特兰数量级

```typescript
class Solution {
  generateParenthesis(n: number): string[] {
    const ans: string[] = []
    const dfs = (path: string, left: number, right: number) => {
      if (path.length === 2 * n) { ans.push(path); return }
      if (left < n) dfs(path + '(', left + 1, right)
      if (right < left) dfs(path + ')', left, right + 1)
    }
    dfs('', 0, 0)
    return ans
  }
}
```

# 单词搜索

[79. 单词搜索](https://leetcode.cn/problems/word-search/)

网格里找单词：每个格子当起点 DFS，匹配成功就朝四方向走，并把当前格临时改成墙（或 visited），返回时还原。剪枝点是「越界 / 已访 / 字母不对」。

复杂度：时间 O(mn·3^L)，空间 O(L)

```typescript
class Solution {
  exist(board: string[][], word: string): boolean {
    const m = board.length, n = board[0].length
    const dfs = (i: number, j: number, k: number): boolean => {
      if (k === word.length) return true
      if (i < 0 || i >= m || j < 0 || j >= n || board[i][j] !== word[k]) return false
      const tmp = board[i][j]
      board[i][j] = '#'
      const ok =
        dfs(i + 1, j, k + 1) || dfs(i - 1, j, k + 1) ||
        dfs(i, j + 1, k + 1) || dfs(i, j - 1, k + 1)
      board[i][j] = tmp
      return ok
    }
    for (let i = 0; i < m; i++)
      for (let j = 0; j < n; j++)
        if (dfs(i, j, 0)) return true
    return false
  }
}
```

# 分割回文串

[131. 分割回文串](https://leetcode.cn/problems/palindrome-partitioning/)

分割回文串：从 start 枚举结束下标 i，若 `s[start..i]` 是回文就切一刀继续；到末尾收路径。可预处理 `dp[l][r]` 加速回文判断。

复杂度：指数级

```typescript
class Solution {
  partition(s: string): string[][] {
    const n = s.length
    const isPal = Array.from({ length: n }, () => new Array(n).fill(false))
    for (let i = n - 1; i >= 0; i--)
      for (let j = i; j < n; j++)
        isPal[i][j] = s[i] === s[j] && (j - i < 2 || isPal[i + 1][j - 1])
    const ans: string[][] = []
    const path: string[] = []
    const dfs = (start: number) => {
      if (start === n) { ans.push([...path]); return }
      for (let i = start; i < n; i++) {
        if (!isPal[start][i]) continue
        path.push(s.slice(start, i + 1))
        dfs(i + 1)
        path.pop()
      }
    }
    dfs(0)
    return ans
  }
}
```

# 组合总和 II

[40. 组合总和 II](https://leetcode.cn/problems/combination-sum-ii/)

和 39 比：每个数只能用一次，且 candidates 有重复。排序后同层若 `candidates[i]==candidates[i-1]` 则跳过；递归从 i+1 起步。旧笔记：39 + 去重。

复杂度：指数级

```typescript
class Solution {
  combinationSum2(candidates: number[], target: number): number[][] {
    candidates.sort((a, b) => a - b)
    const ans: number[][] = [], path: number[] = []
    const dfs = (start: number, remain: number) => {
      if (remain === 0) { ans.push([...path]); return }
      for (let i = start; i < candidates.length; i++) {
        if (candidates[i] > remain) break
        if (i > start && candidates[i] === candidates[i - 1]) continue
        path.push(candidates[i])
        dfs(i + 1, remain - candidates[i])
        path.pop()
      }
    }
    dfs(0, target)
    return ans
  }
}
```

# 全排列 II

[47. 全排列 II](https://leetcode.cn/problems/permutations-ii/)

有重复数字的全排列：先排序，回溯时若 `nums[i]==nums[i-1]` 且 `i-1` 在本层还没用过，就跳过——保证相同数字的相对次序固定，从而去重。

复杂度：时间 O(n·n!)，空间 O(n)

```typescript
class Solution {
  permuteUnique(nums: number[]): number[][] {
    nums.sort((a, b) => a - b)
    const ans: number[][] = [], path: number[] = []
    const used = new Array(nums.length).fill(false)
    const dfs = () => {
      if (path.length === nums.length) { ans.push([...path]); return }
      for (let i = 0; i < nums.length; i++) {
        if (used[i]) continue
        if (i > 0 && nums[i] === nums[i - 1] && !used[i - 1]) continue
        used[i] = true; path.push(nums[i])
        dfs()
        path.pop(); used[i] = false
      }
    }
    dfs()
    return ans
  }
}
```

# N 皇后

[51. N 皇后](https://leetcode.cn/problems/n-queens/)

N 皇后：一行放一个，用 `cols`、`diag1(r-c)`、`diag2(r+c)` 三个占用表剪枝。放到第 n 行就把棋盘（或 Q 位置）记入答案。画 n=4 走一遍剪枝会清晰很多。

复杂度：指数级

```typescript
class Solution {
  solveNQueens(n: number): string[][] {
    const ans: string[][] = []
    const board = Array.from({ length: n }, () => new Array(n).fill('.'))
    const cols = new Set<number>(), d1 = new Set<number>(), d2 = new Set<number>()
    const dfs = (r: number) => {
      if (r === n) {
        ans.push(board.map(row => row.join('')))
        return
      }
      for (let c = 0; c < n; c++) {
        if (cols.has(c) || d1.has(r - c) || d2.has(r + c)) continue
        board[r][c] = 'Q'
        cols.add(c); d1.add(r - c); d2.add(r + c)
        dfs(r + 1)
        board[r][c] = '.'
        cols.delete(c); d1.delete(r - c); d2.delete(r + c)
      }
    }
    dfs(0)
    return ans
  }
}
```

# N 皇后 II

[52. N 皇后 II](https://leetcode.cn/problems/n-queens-ii/)

N 皇后 II 只要求个数，回溯结构和 51 一样，用列/对角占用数组剪枝，放到第 n 行 `ans++` 即可。不必拼字符串棋盘；位运算版把占用压进三个 int 会更快。

复杂度：指数级

```typescript
class Solution {
  totalNQueens(n: number): number {
    let ans = 0
    const cols = new Set<number>(), d1 = new Set<number>(), d2 = new Set<number>()
    const dfs = (r: number) => {
      if (r === n) { ans++; return }
      for (let c = 0; c < n; c++) {
        if (cols.has(c) || d1.has(r - c) || d2.has(r + c)) continue
        cols.add(c); d1.add(r - c); d2.add(r + c)
        dfs(r + 1)
        cols.delete(c); d1.delete(r - c); d2.delete(r + c)
      }
    }
    dfs(0)
    return ans
  }
}
```

# 排列序列

[60. 排列序列](https://leetcode.cn/problems/permutation-sequence/)

第 k 个排列：用阶乘定每一位——剩余数字里第 `k/fact` 个就是当前位，然后 `k%=fact`。比回溯数到第 k 个快，也更稳。注意 k 要先减成 0-based。

复杂度：时间 O(n²)，空间 O(n)

```typescript
class Solution {
  getPermutation(n: number, k: number): string {
    const fact = [1]
    for (let i = 1; i <= n; i++) fact[i] = fact[i - 1] * i
    const nums = Array.from({ length: n }, (_, i) => String(i + 1))
    k--
    let ans = ''
    for (let i = n; i >= 1; i--) {
      const idx = Math.floor(k / fact[i - 1])
      ans += nums.splice(idx, 1)[0]
      k %= fact[i - 1]
    }
    return ans
  }
}
```

# 组合

[77. 组合](https://leetcode.cn/problems/combinations/)

组合 C(n,k)：回溯从 start 选到 n，路径长度到 k 收。剪枝：若剩下数字不够凑满 k 个可以直接 return。

复杂度：时间 O(C(n,k)·k)，空间 O(k)

```typescript
class Solution {
  combine(n: number, k: number): number[][] {
    const ans: number[][] = [], path: number[] = []
    const dfs = (start: number) => {
      if (path.length === k) { ans.push([...path]); return }
      for (let i = start; i <= n - (k - path.length) + 1; i++) {
        path.push(i)
        dfs(i + 1)
        path.pop()
      }
    }
    dfs(1)
    return ans
  }
}
```

# 子集 II

[90. 子集 II](https://leetcode.cn/problems/subsets-ii/)

子集 II：有重复元素时，排序 + 同层跳过相同值，避免重复子集。旧笔记用 Set 去重能过但慢，剪枝才是正道。

复杂度：时间 O(n·2^n)，空间 O(n)

```typescript
class Solution {
  subsetsWithDup(nums: number[]): number[][] {
    nums.sort((a, b) => a - b)
    const ans: number[][] = [], path: number[] = []
    const dfs = (start: number) => {
      ans.push([...path])
      for (let i = start; i < nums.length; i++) {
        if (i > start && nums[i] === nums[i - 1]) continue
        path.push(nums[i])
        dfs(i + 1)
        path.pop()
      }
    }
    dfs(0)
    return ans
  }
}
```
