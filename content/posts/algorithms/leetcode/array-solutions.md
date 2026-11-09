---
title: "数组题解"
tab_title: "Array Solutions"
date: "2026-11-10T00:41:41+08:00"
draft: false
topics: ["algorithms"]
tags: ["数组"]
summary: "区间、子数组、轮转、原地处理与数组构造问题。"
---

# 最大子数组和

[53. 最大子数组和](https://leetcode.cn/problems/maximum-subarray/)

最大子数组和：Kadane——维护「以当前结尾的最大和」`cur = max(x, cur+x)`，同时更新全局 ans。等价于：前面那段是负收益就丢掉重开。

分治也能做，面试提一下即可；写题用 Kadane。

复杂度：时间 O(n)，空间 O(1)

```typescript
class Solution {
  maxSubArray(nums: number[]): number {
    let cur = 0, ans = nums[0]
    for (const x of nums) {
      cur = Math.max(x, cur + x)
      ans = Math.max(ans, cur)
    }
    return ans
  }
}
```

# 合并区间

[56. 合并区间](https://leetcode.cn/problems/merge-intervals/)

合并区间：按左端排序，扫的时候看当前区间能否和答案末尾合并——`cur[0] <= last[1]` 就扩展右端，否则新开一段。排序是关键，漏了会乱。

复杂度：时间 O(n log n)，空间 O(n)

```typescript
class Solution {
  merge(intervals: number[][]): number[][] {
    intervals.sort((a, b) => a[0] - b[0])
    const ans: number[][] = []
    for (const [l, r] of intervals) {
      if (!ans.length || ans[ans.length - 1][1] < l) ans.push([l, r])
      else ans[ans.length - 1][1] = Math.max(ans[ans.length - 1][1], r)
    }
    return ans
  }
}
```

# 轮转数组

[189. 轮转数组](https://leetcode.cn/problems/rotate-array/)

旋转数组 k 步：`k %= n`，三次反转——整体反转，再反转前 k，再反转后面。原地 O(1) 空间，比用额外数组漂亮。

复杂度：时间 O(n)，空间 O(1)

```typescript
class Solution {
  rotate(nums: number[], k: number): void {
    const n = nums.length
    k %= n
    const rev = (l: number, r: number) => {
      while (l < r) {
        ;[nums[l], nums[r]] = [nums[r], nums[l]]
        l++; r--
      }
    }
    rev(0, n - 1)
    rev(0, k - 1)
    rev(k, n - 1)
  }
}
```

# 除自身以外数组的乘积

[238. 除自身以外数组的乘积](https://leetcode.cn/problems/product-of-array-except-self/)

除自身以外的乘积：先从左累乘进答案（前缀积），再从右累乘（后缀积）乘回去。不能用除法；注意 0 的情况前缀后缀法自动处理。

复杂度：时间 O(n)，空间 O(1) 额外（不计输出）

```typescript
class Solution {
  productExceptSelf(nums: number[]): number[] {
    const n = nums.length
    const ans = new Array(n).fill(1)
    let left = 1
    for (let i = 0; i < n; i++) {
      ans[i] = left
      left *= nums[i]
    }
    let right = 1
    for (let i = n - 1; i >= 0; i--) {
      ans[i] *= right
      right *= nums[i]
    }
    return ans
  }
}
```

# 缺失的第一个正数

[41. 缺失的第一个正数](https://leetcode.cn/problems/first-missing-positive/)

第一个缺失的正数：把每个数 x 放到下标 x-1（若在 1..n 内），交换到正确位置；再扫一遍，第一个 `nums[i] != i+1` 就是答案，都对则 n+1。

原地哈希思想，边界交换时用 while 换到位。

复杂度：时间 O(n)，空间 O(1)

```typescript
class Solution {
  firstMissingPositive(nums: number[]): number {
    const n = nums.length
    for (let i = 0; i < n; i++) {
      while (nums[i] >= 1 && nums[i] <= n && nums[nums[i] - 1] !== nums[i]) {
        const j = nums[i] - 1
        ;[nums[i], nums[j]] = [nums[j], nums[i]]
      }
    }
    for (let i = 0; i < n; i++) if (nums[i] !== i + 1) return i + 1
    return n + 1
  }
}
```

# 插入区间

[57. 插入区间](https://leetcode.cn/problems/insert-interval/)

插入区间：扫原列表，完全在新区间左边的直接放，有重叠的合并进新区间，完全在右边的再放。旧笔记这题按三段处理比较清晰。

复杂度：时间 O(n)，空间 O(n)

```typescript
class Solution {
  insert(intervals: number[][], newInterval: number[]): number[][] {
    const ans: number[][] = []
    let i = 0, n = intervals.length
    const [nl, nr] = newInterval
    while (i < n && intervals[i][1] < nl) ans.push(intervals[i++])
    let L = nl, R = nr
    while (i < n && intervals[i][0] <= R) {
      L = Math.min(L, intervals[i][0])
      R = Math.max(R, intervals[i][1])
      i++
    }
    ans.push([L, R])
    while (i < n) ans.push(intervals[i++])
    return ans
  }
}
```

# 加一

[66. 加一](https://leetcode.cn/problems/plus-one/)

加一从最后一位开始：不满 9 直接 +1 返回；是 9 就变 0 继续进位。若全是 9（如 999），循环结束还要在数组头插入 1。

复杂度：时间 O(n)，空间 O(1) 或 O(n)（全进位）

```typescript
class Solution {
  plusOne(digits: number[]): number[] {
    for (let i = digits.length - 1; i >= 0; i--) {
      if (digits[i] < 9) {
        digits[i]++
        return digits
      }
      digits[i] = 0
    }
    return [1, ...digits]
  }
}
```

# 格雷编码

[89. 格雷编码](https://leetcode.cn/problems/gray-code/)

格雷编码：直接 `i ^ (i>>1)` 生成第 i 个；或镜像反射——前半最高位补 0，后半补 1 并逆序。位运算小技巧。

复杂度：时间 O(2^n)，空间 O(1) 额外

```typescript
class Solution {
  grayCode(n: number): number[] {
    const ans = [0]
    for (let i = 0; i < n; i++) {
      const add = 1 << i
      for (let j = ans.length - 1; j >= 0; j--) ans.push(ans[j] + add)
    }
    return ans
  }
}
```

# 杨辉三角 II

[119. 杨辉三角 II](https://leetcode.cn/problems/pascals-triangle-ii/)

杨辉三角 II：只要第 rowIndex 行，用一维数组从后往前更新 `row[j] += row[j-1]`，避免覆盖未用的值。旧笔记用滚动数组就够。

复杂度：时间 O(row²)，空间 O(row)

```typescript
class Solution {
  getRow(rowIndex: number): number[] {
    const row = new Array(rowIndex + 1).fill(0)
    row[0] = 1
    for (let i = 1; i <= rowIndex; i++) {
      for (let j = i; j >= 1; j--) row[j] += row[j - 1]
    }
    return row
  }
}
```

# 最小时间差

[539. 最小时间差](https://leetcode.cn/problems/minimum-time-difference/)

最小时间差：时刻转成分钟排序，相邻做差，还要算首尾跨天（第一天 +1440 - 最后）。旧笔记提醒别忘了环状这一对。

复杂度：时间 O(n log n)，空间 O(n)

```typescript
class Solution {
  findMinDifference(timePoints: string[]): number {
    const mins = timePoints.map(t => {
      const [h, m] = t.split(':').map(Number)
      return h * 60 + m
    }).sort((a, b) => a - b)
    let ans = 1440 - mins[mins.length - 1] + mins[0]
    for (let i = 1; i < mins.length; i++) ans = Math.min(ans, mins[i] - mins[i - 1])
    return ans
  }
}
```

# 给定数字能组成的最大时间

[949. 给定数字能组成的最大时间](https://leetcode.cn/problems/largest-time-for-given-digits/)

最大时间：四个数字枚举排列，合法且最大的 `HH:MM`（小时 <24、分钟 <60）。数很小，暴力 24 种即可。

复杂度：时间 O(1)，空间 O(1)

```typescript
class Solution {
  largestTimeFromDigits(arr: number[]): string {
    let best = -1
    const dfs = (i: number) => {
      if (i === 4) {
        const h = arr[0] * 10 + arr[1], m = arr[2] * 10 + arr[3]
        if (h < 24 && m < 60) best = Math.max(best, h * 60 + m)
        return
      }
      for (let j = i; j < 4; j++) {
        ;[arr[i], arr[j]] = [arr[j], arr[i]]
        dfs(i + 1)
        ;[arr[i], arr[j]] = [arr[j], arr[i]]
      }
    }
    dfs(0)
    if (best < 0) return ""
    const h = Math.floor(best / 60), m = best % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }
}
```
