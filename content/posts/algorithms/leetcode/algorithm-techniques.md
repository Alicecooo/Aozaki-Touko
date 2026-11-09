---
title: "算法技巧题解"
tab_title: "Algorithm Techniques"
date: "2026-11-10T00:41:44+08:00"
draft: false
topics: ["algorithms"]
tags: ["位运算", "数组"]
summary: "异或、投票、原地交换、排列与环检测等解题技巧。"
---

# 只出现一次的数字

[136. 只出现一次的数字](https://leetcode.cn/problems/single-number/)

数组里只有一个数出现一次，其余都两次。异或满足 `a^a=0`、`a^0=a` 且可交换，全部异或一遍，成对的消成 0，剩下就是那个单身的。别急着上哈希或排序——这题就是练位运算。

复杂度：时间 O(n)，空间 O(1)

```typescript
class Solution {
  singleNumber(nums: number[]): number {
    let x = 0
    for (const n of nums) x ^= n
    return x
  }
}
```

# 多数元素

[169. 多数元素](https://leetcode.cn/problems/majority-element/)

多数元素出现超过 ⌊n/2⌋。Boyer-Moore 投票：候选 cand，相同 +1、不同 -1，减到 0 就换人。题目保证存在多数，最后留下的就是答案。想不通可以先排序取中位数，或哈希计数。

复杂度：时间 O(n)，空间 O(1)

```typescript
class Solution {
  majorityElement(nums: number[]): number {
    let cand = 0, cnt = 0
    for (const x of nums) {
      if (cnt === 0) cand = x
      cnt += x === cand ? 1 : -1
    }
    return cand
  }
}
```

# 颜色分类

[75. 颜色分类](https://leetcode.cn/problems/sort-colors/)

颜色只有 0/1/2，原地排。荷兰国旗三指针：p0 写 0、p2 写 2、i 扫描。遇 0 和 p0 换并双进；遇 2 和 p2 换但 i 不进（换过来的还没看过）；遇 1 只 i++。

复杂度：时间 O(n)，空间 O(1)

```typescript
class Solution {
  sortColors(nums: number[]): void {
    let l = 0, i = 0, r = nums.length - 1
    while (i <= r) {
      if (nums[i] === 0) {
        ;[nums[l], nums[i]] = [nums[i], nums[l]]
        l++; i++
      } else if (nums[i] === 2) {
        ;[nums[r], nums[i]] = [nums[i], nums[r]]
        r--
      } else i++
    }
  }
}
```

# 下一个排列

[31. 下一个排列](https://leetcode.cn/problems/next-permutation/)

下一个排列：从右往左找第一个升序拐点 `nums[i]<nums[i+1]`，再在右侧找刚好比它大的最小数换过来，最后把 i 后面反转成升序。整体降序说明是最后一个排列，直接整段反转。

复杂度：时间 O(n)，空间 O(1)

```typescript
class Solution {
  nextPermutation(nums: number[]): void {
    let i = nums.length - 2
    while (i >= 0 && nums[i] >= nums[i + 1]) i--
    if (i >= 0) {
      let j = nums.length - 1
      while (nums[j] <= nums[i]) j--
      ;[nums[i], nums[j]] = [nums[j], nums[i]]
    }
    let l = i + 1, r = nums.length - 1
    while (l < r) {
      ;[nums[l], nums[r]] = [nums[r], nums[l]]
      l++; r--
    }
  }
}
```

# 寻找重复数

[287. 寻找重复数](https://leetcode.cn/problems/find-the-duplicate-number/)

`1..n` 长度 n+1 必有重复。把下标→值看成链表，重复值形成环，Floyd 找环入口即答案。也可用二分：统计 ≤mid 的个数，超过 mid 说明重复在左。

复杂度：时间 O(n)，空间 O(1)

```typescript
class Solution {
  findDuplicate(nums: number[]): number {
    let slow = nums[0], fast = nums[0]
    do {
      slow = nums[slow]
      fast = nums[nums[fast]]
    } while (slow !== fast)
    slow = nums[0]
    while (slow !== fast) {
      slow = nums[slow]
      fast = nums[fast]
    }
    return slow
  }
}
```

# 汉明距离

[461. 汉明距离](https://leetcode.cn/problems/hamming-distance/)

汉明距离：两数二进制有几位不同。先 `x^y`，再数 1 的个数；用 `n &= n-1` 消最低位 1 即可。位运算热身题。

复杂度：时间 O(位宽)，空间 O(1)

```typescript
class Solution {
  hammingDistance(x: number, y: number): number {
    let v = x ^ y, ans = 0
    while (v) { v &= v - 1; ans++ }
    return ans
  }
}
```
