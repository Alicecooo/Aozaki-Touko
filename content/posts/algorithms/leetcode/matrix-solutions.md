---
title: "矩阵题解"
tab_title: "Matrix Solutions"
date: "2026-11-10T00:41:37+08:00"
draft: false
topics: ["algorithms"]
series: ["LeetCode"]
tags: ["矩阵"]
summary: "矩阵置零、旋转、螺旋遍历、数独与网格问题。"
---

# 矩阵置零

[73. 矩阵置零](https://leetcode.cn/problems/set-matrix-zeroes/)

矩阵置零：用第一行/列当标记位，先记下它们本身是否有零；再扫内部，遇零就标在边上；最后根据标记置零，再处理第一行/列。O(1) 额外空间。

复杂度：时间 O(mn)，空间 O(1)

```typescript
class Solution {
  setZeroes(matrix: number[][]): void {
    const m = matrix.length, n = matrix[0].length
    let row0 = false, col0 = false
    for (let j = 0; j < n; j++) if (matrix[0][j] === 0) row0 = true
    for (let i = 0; i < m; i++) if (matrix[i][0] === 0) col0 = true
    for (let i = 1; i < m; i++)
      for (let j = 1; j < n; j++)
        if (matrix[i][j] === 0) { matrix[i][0] = 0; matrix[0][j] = 0 }
    for (let i = 1; i < m; i++)
      for (let j = 1; j < n; j++)
        if (matrix[i][0] === 0 || matrix[0][j] === 0) matrix[i][j] = 0
    if (row0) for (let j = 0; j < n; j++) matrix[0][j] = 0
    if (col0) for (let i = 0; i < m; i++) matrix[i][0] = 0
  }
}
```

# 螺旋矩阵

[54. 螺旋矩阵](https://leetcode.cn/problems/spiral-matrix/)

螺旋遍历：维护上下左右四条边界，按右→下→左→上走一圈就缩边界。每次拐弯前检查边界是否已交叉，避免重复走同一行/列。

复杂度：时间 O(mn)，空间 O(1) 额外

```typescript
class Solution {
  spiralOrder(matrix: number[][]): number[] {
    const ans: number[] = []
    let top = 0, bottom = matrix.length - 1
    let left = 0, right = matrix[0].length - 1
    while (top <= bottom && left <= right) {
      for (let j = left; j <= right; j++) ans.push(matrix[top][j])
      top++
      for (let i = top; i <= bottom; i++) ans.push(matrix[i][right])
      right--
      if (top <= bottom) {
        for (let j = right; j >= left; j--) ans.push(matrix[bottom][j])
        bottom--
      }
      if (left <= right) {
        for (let i = bottom; i >= top; i--) ans.push(matrix[i][left])
        left++
      }
    }
    return ans
  }
}
```

# 旋转图像

[48. 旋转图像](https://leetcode.cn/problems/rotate-image/)

原地旋转 90°：我习惯「先转置，再每一行 reverse」；也可以一圈圈四元组交换。注意 n 为奇数时中心元素不用动。

复杂度：时间 O(n²)，空间 O(1)

```typescript
class Solution {
  rotate(matrix: number[][]): void {
    const n = matrix.length
    for (let i = 0; i < n; i++)
      for (let j = i + 1; j < n; j++)
        ;[matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]]
    for (let i = 0; i < n; i++) matrix[i].reverse()
  }
}
```

# 搜索二维矩阵 II

[240. 搜索二维矩阵 II](https://leetcode.cn/problems/search-a-2d-matrix-ii/)

从右上角出发搜：当前值太大就往左、太小就往下，每次排除一行或一列。比「每行再二分」好写，也是 O(m+n)。

复杂度：时间 O(m+n)，空间 O(1)

```typescript
class Solution {
  searchMatrix(matrix: number[][], target: number): boolean {
    let i = 0, j = matrix[0].length - 1
    while (i < matrix.length && j >= 0) {
      if (matrix[i][j] === target) return true
      if (matrix[i][j] > target) j--
      else i++
    }
    return false
  }
}
```

# 有效的数独

[36. 有效的数独](https://leetcode.cn/problems/valid-sudoku/)

有效数独：行、列、九宫各用 Set（或位掩码）记出现过的数字。旧笔记：空间换时间，数组下标比 HashSet 更痛快；九宫编号 `box = (r/3)*3 + c/3`。

复杂度：时间 O(1)（9×9），空间 O(1)

```typescript
class Solution {
  isValidSudoku(board: string[][]): boolean {
    const rows = Array.from({ length: 9 }, () => new Set<string>())
    const cols = Array.from({ length: 9 }, () => new Set<string>())
    const boxes = Array.from({ length: 9 }, () => new Set<string>())
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const v = board[r][c]
        if (v === '.') continue
        const b = Math.floor(r / 3) * 3 + Math.floor(c / 3)
        if (rows[r].has(v) || cols[c].has(v) || boxes[b].has(v)) return false
        rows[r].add(v); cols[c].add(v); boxes[b].add(v)
      }
    }
    return true
  }
}
```

# 解数独

[37. 解数独](https://leetcode.cn/problems/sudoku-solver/)

解数独：回溯填空格，行/列/盒用布尔或位记录占用；可先填「只有一个候选」的格剪枝。旧笔记嫌剪枝麻烦只剪了一层，效率一般——每次 attempt 更新约束会快很多。

复杂度：指数级，实际 9×9 可过

```typescript
class Solution {
  solveSudoku(board: string[][]): void {
    const row = new Array(9).fill(0)
    const col = new Array(9).fill(0)
    const box = new Array(9).fill(0)
    const empties: [number, number][] = []
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === '.') empties.push([r, c])
        else {
          const bit = 1 << (Number(board[r][c]) - 1)
          const b = Math.floor(r / 3) * 3 + Math.floor(c / 3)
          row[r] |= bit; col[c] |= bit; box[b] |= bit
        }
      }
    }
    const dfs = (k: number): boolean => {
      if (k === empties.length) return true
      const [r, c] = empties[k]
      const b = Math.floor(r / 3) * 3 + Math.floor(c / 3)
      const mask = row[r] | col[c] | box[b]
      for (let d = 0; d < 9; d++) {
        const bit = 1 << d
        if (mask & bit) continue
        board[r][c] = String(d + 1)
        row[r] |= bit; col[c] |= bit; box[b] |= bit
        if (dfs(k + 1)) return true
        row[r] ^= bit; col[c] ^= bit; box[b] ^= bit
        board[r][c] = '.'
      }
      return false
    }
    dfs(0)
  }
}
```

# 螺旋矩阵 II

[59. 螺旋矩阵 II](https://leetcode.cn/problems/spiral-matrix-ii/)

螺旋填数：和 54 一样维护上下左右边界，往空矩阵里依次写入 1..n²。拐弯前检查边界是否已经交叉，防止重复填写。

复杂度：时间 O(n²)，空间 O(1) 额外

```typescript
class Solution {
  generateMatrix(n: number): number[][] {
    const mat = Array.from({ length: n }, () => new Array(n).fill(0))
    let l = 0, r = n - 1, t = 0, b = n - 1, v = 1
    while (l <= r && t <= b) {
      for (let j = l; j <= r; j++) mat[t][j] = v++
      t++
      for (let i = t; i <= b; i++) mat[i][r] = v++
      r--
      if (t <= b) {
        for (let j = r; j >= l; j--) mat[b][j] = v++
        b--
      }
      if (l <= r) {
        for (let i = b; i >= t; i--) mat[i][l] = v++
        l++
      }
    }
    return mat
  }
}
```

# 岛屿的周长

[463. 岛屿的周长](https://leetcode.cn/problems/island-perimeter/)

岛屿周长：每块陆地先贡献 4，若右边或下边也是陆地就各减 2（共享边只算一次外轮廓）。扫一遍网格即可。

复杂度：时间 O(mn)，空间 O(1)

```typescript
class Solution {
  islandPerimeter(grid: number[][]): number {
    let ans = 0
    const m = grid.length, n = grid[0].length
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        if (grid[i][j] === 0) continue
        ans += 4
        if (i > 0 && grid[i - 1][j] === 1) ans -= 2
        if (j > 0 && grid[i][j - 1] === 1) ans -= 2
      }
    }
    return ans
  }
}
```

# 矩阵中的幻方

[840. 矩阵中的幻方](https://leetcode.cn/problems/magic-squares-in-grid/)

统计有多少个 3×3「幻方」：枚举每个左上角，检查是否 1..9 各一次且三行三列两对角和都是 15。网格不大，暴力即可。

复杂度：时间 O(mn)，空间 O(1)

```typescript
class Solution {
  numMagicSquaresInside(grid: number[][]): number {
    const m = grid.length, n = grid[0].length
    let ans = 0
    const ok = (r: number, c: number) => {
      if (grid[r + 1][c + 1] !== 5) return false
      const seen = new Array(16).fill(false)
      for (let i = r; i < r + 3; i++) {
        for (let j = c; j < c + 3; j++) {
          const v = grid[i][j]
          if (v < 1 || v > 9 || seen[v]) return false
          seen[v] = true
        }
      }
      const s = [
        grid[r][c] + grid[r][c + 1] + grid[r][c + 2],
        grid[r + 1][c] + grid[r + 1][c + 1] + grid[r + 1][c + 2],
        grid[r + 2][c] + grid[r + 2][c + 1] + grid[r + 2][c + 2],
        grid[r][c] + grid[r + 1][c] + grid[r + 2][c],
        grid[r][c + 1] + grid[r + 1][c + 1] + grid[r + 2][c + 1],
        grid[r][c + 2] + grid[r + 1][c + 2] + grid[r + 2][c + 2],
        grid[r][c] + grid[r + 1][c + 1] + grid[r + 2][c + 2],
        grid[r][c + 2] + grid[r + 1][c + 1] + grid[r + 2][c],
      ]
      return s.every(x => x === 15)
    }
    for (let i = 0; i + 2 < m; i++)
      for (let j = 0; j + 2 < n; j++) if (ok(i, j)) ans++
    return ans
  }
}
```
