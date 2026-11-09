---
title: "贪心题解"
tab_title: "Greedy Solutions"
date: "2026-11-10T00:41:36+08:00"
draft: false
topics: ["algorithms"]
tags: ["贪心"]
summary: "股票、跳跃、区间划分与删列问题的贪心思路。"
---

# 买卖股票的最佳时机

[121. 买卖股票的最佳时机](https://leetcode.cn/problems/best-time-to-buy-and-sell-stock/)

买卖一次股票：从前到后维持历史最低价，每天用「今日价 - 最低价」更新最大利润。等价于找最大的「峰减之前的谷」，一遍扫完。

复杂度：时间 O(n)，空间 O(1)

```typescript
class Solution {
  maxProfit(prices: number[]): number {
    let minPrice = Infinity, ans = 0
    for (const p of prices) {
      minPrice = Math.min(minPrice, p)
      ans = Math.max(ans, p - minPrice)
    }
    return ans
  }
}
```

# 跳跃游戏

[55. 跳跃游戏](https://leetcode.cn/problems/jump-game/)

跳跃游戏 I：维护当前能到达的最远下标 maxReach，在可到达范围内用 `i+nums[i]` 更新；若最终 ≥ n-1 就能到。中途 i 已经超过 maxReach 说明卡住。

复杂度：时间 O(n)，空间 O(1)

```typescript
class Solution {
  canJump(nums: number[]): boolean {
    let far = 0
    for (let i = 0; i < nums.length; i++) {
      if (i > far) return false
      far = Math.max(far, i + nums[i])
    }
    return true
  }
}
```

# 跳跃游戏 II

[45. 跳跃游戏 II](https://leetcode.cn/problems/jump-game-ii/)

跳跃游戏 II 求最少跳数：在「当前这一跳覆盖的右端」内，边走边记录下一跳能到的最远；走出当前覆盖就 steps++，并把覆盖更新到下一跳最远。

复杂度：时间 O(n)，空间 O(1)

```typescript
class Solution {
  jump(nums: number[]): number {
    let steps = 0, end = 0, far = 0
    for (let i = 0; i < nums.length - 1; i++) {
      far = Math.max(far, i + nums[i])
      if (i === end) {
        steps++
        end = far
      }
    }
    return steps
  }
}
```

# 划分字母区间

[763. 划分字母区间](https://leetcode.cn/problems/partition-labels/)

划分字母区间：先扫一遍记每个字母最后出现位置。再从左划段，段内不断把 end 扩到段内字母的最远出现；当 i 走到 end 就可以切一刀，保证同字母落在同一段。

复杂度：时间 O(n)，空间 O(字符集)

```typescript
class Solution {
  partitionLabels(s: string): number[] {
    const last = new Array(26).fill(0)
    for (let i = 0; i < s.length; i++) last[s.charCodeAt(i) - 97] = i
    const ans: number[] = []
    let start = 0, end = 0
    for (let i = 0; i < s.length; i++) {
      end = Math.max(end, last[s.charCodeAt(i) - 97])
      if (i === end) {
        ans.push(end - start + 1)
        start = i + 1
      }
    }
    return ans
  }
}
```

# 买卖股票的最佳时机 II

[122. 买卖股票的最佳时机 II](https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-ii/)

可多次买卖：把每一段上涨的差价累加即可——今天比昨天贵就当作昨天买今天卖。不用真模拟持仓，差价和就是最大利润。

复杂度：时间 O(n)，空间 O(1)

```typescript
class Solution {
  maxProfit(prices: number[]): number {
    let ans = 0
    for (let i = 1; i < prices.length; i++) {
      if (prices[i] > prices[i - 1]) ans += prices[i] - prices[i - 1]
    }
    return ans
  }
}
```

# 删列造序

[944. 删列造序](https://leetcode.cn/problems/delete-columns-to-make-sorted/)

删列使剩下列都非降：对每一列从上到下检查是否升序，不是就删（计数 +1）。旧笔记当简单模拟/贪心，列之间独立，没必要真的改字符串。

复杂度：时间 O(行×列)，空间 O(1)

```typescript
class Solution {
  minDeletionSize(strs: string[]): number {
    const rows = strs.length, cols = strs[0].length
    let ans = 0
    for (let c = 0; c < cols; c++) {
      for (let r = 1; r < rows; r++) {
        if (strs[r][c] < strs[r - 1][c]) { ans++; break }
      }
    }
    return ans
  }
}
```

# 删列造序 II

[955. 删列造序 II](https://leetcode.cn/problems/delete-columns-to-make-sorted-ii/)

删列造递增：要比 944 难——前面列已经能区分出大小关系的行对，后面列可以不管；还不能区分的，当前列必须非降，否则删。维护「哪些相邻行仍相等」的状态，逐列决策。

复杂度：时间 O(行×列)，空间 O(行)

```typescript
class Solution {
  minDeletionSize(strs: string[]): number {
    const n = strs.length, m = strs[0].length
    let ans = 0
    const sorted = new Array(n - 1).fill(false)
    for (let c = 0; c < m; c++) {
      let ok = true
      for (let i = 0; i < n - 1; i++) {
        if (!sorted[i] && strs[i][c] > strs[i + 1][c]) { ok = false; break }
      }
      if (!ok) { ans++; continue }
      for (let i = 0; i < n - 1; i++) {
        if (strs[i][c] < strs[i + 1][c]) sorted[i] = true
      }
    }
    return ans
  }
}
```
