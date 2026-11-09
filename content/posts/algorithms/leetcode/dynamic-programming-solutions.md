---
title: "动态规划题解"
tab_title: "Dynamic Programming Solutions"
date: "2026-11-10T00:41:53+08:00"
draft: false
topics: ["algorithms"]
series: ["LeetCode"]
tags: ["动态规划"]
summary: "从爬楼梯、背包到子序列问题的状态设计和转移。"
---

# 爬楼梯

[70. 爬楼梯](https://leetcode.cn/problems/climbing-stairs/)

爬楼梯：每次 1 或 2 阶，方案数 `f(n)=f(n-1)+f(n-2)`，就是斐波那契。滚动两个变量，别开长数组。

复杂度：时间 O(n)，空间 O(1)

```typescript
class Solution {
  climbStairs(n: number): number {
    let a = 1, b = 1
    for (let i = 2; i <= n; i++) {
      const c = a + b
      a = b
      b = c
    }
    return b
  }
}
```

# 杨辉三角

[118. 杨辉三角](https://leetcode.cn/problems/pascals-triangle/)

杨辉三角按行生成：每行两端是 1，中间来自上一行左右两数之和。返回前 numRows 行即可。

复杂度：时间 O(numRows²)，空间 O(结果)

```typescript
class Solution {
  generate(numRows: number): number[][] {
    const ans: number[][] = []
    for (let i = 0; i < numRows; i++) {
      const row = new Array(i + 1).fill(1)
      for (let j = 1; j < i; j++) row[j] = ans[i - 1][j - 1] + ans[i - 1][j]
      ans.push(row)
    }
    return ans
  }
}
```

# 打家劫舍

[198. 打家劫舍](https://leetcode.cn/problems/house-robber/)

打家劫舍：相邻不能同时偷。`dp[i]=max(dp[i-1], dp[i-2]+nums[i])`，滚动两个变量。空数组、单房子记得边界。

复杂度：时间 O(n)，空间 O(1)

```typescript
class Solution {
  rob(nums: number[]): number {
    let prev = 0, curr = 0
    for (const x of nums) {
      const next = Math.max(curr, prev + x)
      prev = curr
      curr = next
    }
    return curr
  }
}
```

# 完全平方数

[279. 完全平方数](https://leetcode.cn/problems/perfect-squares/)

完全平方数凑成 n 的最少个数：`dp[i]=min(dp[i-j*j]+1)`（j*j≤i）。也可以搬四平方和定理，但 DP 好写好调。

复杂度：时间 O(n√n)，空间 O(n)

```typescript
class Solution {
  numSquares(n: number): number {
    const dp = new Array(n + 1).fill(Infinity)
    dp[0] = 0
    for (let i = 1; i <= n; i++) {
      for (let j = 1; j * j <= i; j++) {
        dp[i] = Math.min(dp[i], dp[i - j * j] + 1)
      }
    }
    return dp[n]
  }
}
```

# 零钱兑换

[322. 零钱兑换](https://leetcode.cn/problems/coin-change/)

零钱兑换求最少硬币数：完全背包，`dp[x]=min(dp[x-coin]+1)`，`dp[0]=0` 其余初始化成无穷大，最后仍是无穷则返回 -1。注意硬币无序、金额为 0 的边界。

复杂度：时间 O(amount·硬币数)，空间 O(amount)

```typescript
class Solution {
  coinChange(coins: number[], amount: number): number {
    const dp = new Array(amount + 1).fill(Infinity)
    dp[0] = 0
    for (let a = 1; a <= amount; a++) {
      for (const c of coins) {
        if (a >= c) dp[a] = Math.min(dp[a], dp[a - c] + 1)
      }
    }
    return dp[amount] === Infinity ? -1 : dp[amount]
  }
}
```

# 单词拆分

[139. 单词拆分](https://leetcode.cn/problems/word-break/)

单词拆分：`dp[i]` 表示前 i 个字符能否拆成字典词；枚举分割点 j，若 `dp[j]` 且 `s[j..i)` 在字典里则可行。字典放进 Set，避免线性查找。

复杂度：时间 O(n²·词长)，空间 O(n)

```typescript
class Solution {
  wordBreak(s: string, wordDict: string[]): boolean {
    const set = new Set(wordDict)
    const n = s.length
    const dp = new Array(n + 1).fill(false)
    dp[0] = true
    for (let i = 1; i <= n; i++) {
      for (let j = 0; j < i; j++) {
        if (dp[j] && set.has(s.slice(j, i))) { dp[i] = true; break }
      }
    }
    return dp[n]
  }
}
```

# 最长递增子序列

[300. 最长递增子序列](https://leetcode.cn/problems/longest-increasing-subsequence/)

最长递增子序列：`dp[i]` 以 i 结尾的 LIS，O(n²) 好写。想 O(n log n) 就维护 tails：长度为 k 的 LIS 的最小结尾，对新来的数二分替换。tails 下标含义要想清楚。

复杂度：O(n²) 或 O(n log n)

```typescript
class Solution {
  lengthOfLIS(nums: number[]): number {
    const tails: number[] = []
    for (const x of nums) {
      let l = 0, r = tails.length - 1
      while (l <= r) {
        const mid = (l + r) >> 1
        if (tails[mid] >= x) r = mid - 1
        else l = mid + 1
      }
      if (l === tails.length) tails.push(x)
      else tails[l] = x
    }
    return tails.length
  }
}
```

# 乘积最大子数组

[152. 乘积最大子数组](https://leetcode.cn/problems/maximum-product-subarray/)

最大乘积子数组：因为有负数，要同时维护「以当前结尾的最大乘积」和「最小乘积」，碰到负数两者角色对调。每一步还要考虑从 `nums[i]` 单独重新开始。

复杂度：时间 O(n)，空间 O(1)

```typescript
class Solution {
  maxProduct(nums: number[]): number {
    let maxP = nums[0], minP = nums[0], ans = nums[0]
    for (let i = 1; i < nums.length; i++) {
      const x = nums[i]
      const a = maxP * x, b = minP * x
      maxP = Math.max(x, a, b)
      minP = Math.min(x, a, b)
      ans = Math.max(ans, maxP)
    }
    return ans
  }
}
```

# 分割等和子集

[416. 分割等和子集](https://leetcode.cn/problems/partition-equal-subset-sum/)

分割等和子集：先看总和是否偶数，目标是 sum/2。然后 0-1 背包可行性，`dp[j]|=dp[j-num]` 倒序更新，避免同一物品用两次。

复杂度：时间 O(n·sum)，空间 O(sum)

```typescript
class Solution {
  canPartition(nums: number[]): boolean {
    const sum = nums.reduce((a, b) => a + b, 0)
    if (sum % 2) return false
    const target = sum / 2
    const dp = new Array(target + 1).fill(false)
    dp[0] = true
    for (const x of nums) {
      for (let j = target; j >= x; j--) dp[j] = dp[j] || dp[j - x]
    }
    return dp[target]
  }
}
```

# 最长有效括号

[32. 最长有效括号](https://leetcode.cn/problems/longest-valid-parentheses/)

最长有效括号：栈里存下标，先压 -1 当哨兵。遇 `(` 压入；遇 `)` 弹出，栈空说明右括号多了再压当前当下个哨兵，否则用 `i-栈顶` 更新长度。DP 也能做，栈更直观。

复杂度：时间 O(n)，空间 O(n)

```typescript
class Solution {
  longestValidParentheses(s: string): number {
    const st: number[] = [-1]
    let ans = 0
    for (let i = 0; i < s.length; i++) {
      if (s[i] === '(') st.push(i)
      else {
        st.pop()
        if (!st.length) st.push(i)
        else ans = Math.max(ans, i - st[st.length - 1])
      }
    }
    return ans
  }
}
```

# 不同路径 II

[63. 不同路径 II](https://leetcode.cn/problems/unique-paths-ii/)

不同路径 II：有障碍物时障碍处路径数记 0，转移同 62。旧笔记提醒：第一行/列的循环要从下标 0 开始扫，否则起点是障碍时查不出来。

复杂度：时间 O(mn)，空间 O(mn) 或原地

```typescript
class Solution {
  uniquePathsWithObstacles(obstacleGrid: number[][]): number {
    const m = obstacleGrid.length, n = obstacleGrid[0].length
    if (obstacleGrid[0][0] === 1) return 0
    const dp = new Array(n).fill(0)
    dp[0] = 1
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        if (obstacleGrid[i][j] === 1) dp[j] = 0
        else if (j > 0) dp[j] += dp[j - 1]
      }
    }
    return dp[n - 1]
  }
}
```

# 三角形最小路径和

[120. 三角形最小路径和](https://leetcode.cn/problems/triangle/)

三角形最小路径和：自底向上推，`dp[j]=t[i][j]+min(dp[j],dp[j+1])`，最后 `dp[0]`。比从上往下少一堆边界判断，一维滚动就够。

复杂度：时间 O(n²)，空间 O(n)

```typescript
class Solution {
  minimumTotal(triangle: number[][]): number {
    const n = triangle.length
    const dp = [...triangle[n - 1]]
    for (let i = n - 2; i >= 0; i--) {
      for (let j = 0; j <= i; j++) dp[j] = triangle[i][j] + Math.min(dp[j], dp[j + 1])
    }
    return dp[0]
  }
}
```

# 石子游戏

[877. 石子游戏](https://leetcode.cn/problems/stone-game/)

石子游戏：先手总可以选择「取所有偶数堆」或「所有奇数堆」里和更大的那一种，所以先手必胜，直接返回 true。若改成算分差，才需要区间 DP。

复杂度：时间 O(1)（必胜结论）

```typescript
class Solution {
  stoneGame(piles: number[]): boolean {
    return true
  }
}
```
