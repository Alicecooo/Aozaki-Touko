---
title: "二分查找题解"
tab_title: "Binary Search Solutions"
date: "2026-11-10T00:41:55+08:00"
draft: false
topics: ["algorithms"]
series: ["LeetCode"]
tags: ["二分查找"]
summary: "二分边界、旋转数组、矩阵查找与中位数等题目的思路和实现。"
---

## 二分模板（红蓝染色）

做二分题之前先把模板钉死：左闭右闭 `[left, right]`，循环条件 `left <= right`。把下标区间想成「红 | 蓝」两段——左边不满足条件（红），右边满足（蓝）。`check(mid)` 为真就说明 mid 已经进蓝区，答案还可能在更左边，于是 `right = mid - 1`；否则答案在右边，`left = mid + 1`。循环结束时 `left` 正好落在第一条蓝的位置。

常见变形：
- 第一个 ≥ x（lower_bound）：`check = nums[mid] >= x`
- 第一个 > x（upper_bound）：`check = nums[mid] > x`
- 最后一个 < x / ≤ x：分别是 lower_bound-1、upper_bound-1

```typescript
// 找第一个使 check(mid) 为 true 的下标（蓝区起点）；若全红则返回 n
function lowerBound(nums: number[], check: (mid: number) => boolean): number {
  let left = 0, right = nums.length - 1
  while (left <= right) {
    const mid = (left + right) >> 1
    if (check(mid)) right = mid - 1
    else left = mid + 1
  }
  return left
}
```

旋转数组、峰值、求最小满足条件的值……本质都是在定义「什么叫蓝」。下面几题就是在练这件事。

---


# 搜索插入位置

[35. 搜索插入位置](https://leetcode.cn/problems/search-insert-position/)

搜索插入位置就是 lower_bound：第一个 ≥ target 的下标；若都比它小，返回 n。直接套红蓝模板，`nums[mid] >= target` 为蓝。

复杂度：时间 O(log n)，空间 O(1)

```typescript
class Solution {
  searchInsert(nums: number[], target: number): number {
    let left = 0, right = nums.length - 1
    while (left <= right) {
      const mid = (left + right) >> 1
      if (nums[mid] >= target) right = mid - 1
      else left = mid + 1
    }
    return left
  }
}
```

# 搜索二维矩阵

[74. 搜索二维矩阵](https://leetcode.cn/problems/search-a-2d-matrix/)

矩阵每行从左到右、每行首大于上行末，可看成一维有序。`mid` 映射成 `matrix[mid/m][mid%m]`，和普通二分一样。也可以先二分定行再定列。

复杂度：时间 O(log(mn))，空间 O(1)

```typescript
class Solution {
  searchMatrix(matrix: number[][], target: number): boolean {
    const m = matrix.length, n = matrix[0].length
    let left = 0, right = m * n - 1
    while (left <= right) {
      const mid = (left + right) >> 1
      const val = matrix[Math.floor(mid / n)][mid % n]
      if (val === target) return true
      if (val < target) left = mid + 1
      else right = mid - 1
    }
    return false
  }
}
```

# 在排序数组中查找元素的第一个和最后一个位置

[34. 在排序数组中查找元素的第一个和最后一个位置](https://leetcode.cn/problems/find-first-and-last-position-of-element-in-sorted-array/)

找元素起止：分别做 lower_bound(target) 和 lower_bound(target+1)-1（或 upper_bound-1）。找不到时左边界越界或对不上 target，返回 [-1,-1]。

复杂度：时间 O(log n)，空间 O(1)

```typescript
class Solution {
  searchRange(nums: number[], target: number): number[] {
    const lower = (x: number): number => {
      let left = 0, right = nums.length - 1
      while (left <= right) {
        const mid = (left + right) >> 1
        if (nums[mid] >= x) right = mid - 1
        else left = mid + 1
      }
      return left
    }
    const L = lower(target)
    if (L === nums.length || nums[L] !== target) return [-1, -1]
    return [L, lower(target + 1) - 1]
  }
}
```

# 搜索旋转排序数组

[33. 搜索旋转排序数组](https://leetcode.cn/problems/search-in-rotated-sorted-array/)

旋转有序数组里找目标：mid 落在左半有序或右半有序。判断 target 是否落在有序那一侧的值域内，决定往哪边缩。每次仍丢掉一半，整体 log n。

复杂度：时间 O(log n)，空间 O(1)

```typescript
class Solution {
  search(nums: number[], target: number): number {
    let left = 0, right = nums.length - 1
    while (left <= right) {
      const mid = (left + right) >> 1
      if (nums[mid] === target) return mid
      if (nums[left] <= nums[mid]) { // 左半有序
        if (nums[left] <= target && target < nums[mid]) right = mid - 1
        else left = mid + 1
      } else { // 右半有序
        if (nums[mid] < target && target <= nums[right]) left = mid + 1
        else right = mid - 1
      }
    }
    return -1
  }
}
```

# 寻找旋转排序数组中的最小值

[153. 寻找旋转排序数组中的最小值](https://leetcode.cn/problems/find-minimum-in-rotated-sorted-array/)

旋转数组找最小值：比较 `nums[mid]` 与 `nums[right]`，判断 mid 在左段还是右段，从而丢掉没有最小值的一半。本题无重复；有重复时右端需要 `right--` 收敛。

复杂度：时间 O(log n)，空间 O(1)

```typescript
class Solution {
  findMin(nums: number[]): number {
    let left = 0, right = nums.length - 1
    while (left < right) {
      const mid = (left + right) >> 1
      if (nums[mid] < nums[right]) right = mid
      else left = mid + 1
    }
    return nums[left]
  }
}
```

# 寻找两个正序数组的中位数

[4. 寻找两个正序数组的中位数](https://leetcode.cn/problems/median-of-two-sorted-arrays/)

两有序数组中位数，要 log 级：在较短数组上二分切一刀，使左半总个数正确，且左半最大 ≤ 右半最小。切在两端时用 ±∞ 补齐。分支多，建议按「划分」而不是「归并」来理解。

复杂度：时间 O(log(min(m,n)))，空间 O(1)

```typescript
class Solution {
  findMedianSortedArrays(nums1: number[], nums2: number[]): number {
    if (nums1.length > nums2.length) return this.findMedianSortedArrays(nums2, nums1)
    const m = nums1.length, n = nums2.length
    let left = 0, right = m
    const half = Math.floor((m + n + 1) / 2)
    while (left <= right) {
      const i = (left + right) >> 1
      const j = half - i
      const L1 = i === 0 ? -Infinity : nums1[i - 1]
      const R1 = i === m ? Infinity : nums1[i]
      const L2 = j === 0 ? -Infinity : nums2[j - 1]
      const R2 = j === n ? Infinity : nums2[j]
      if (L1 <= R2 && L2 <= R1) {
        if ((m + n) % 2 === 1) return Math.max(L1, L2)
        return (Math.max(L1, L2) + Math.min(R1, R2)) / 2
      }
      if (L1 > R2) right = i - 1
      else left = i + 1
    }
    return 0
  }
}
```

# Pow(x, n)

[50. Pow(x, n)](https://leetcode.cn/problems/powx-n/)

Pow(x,n)：快速幂，n 二进制拆分，底数不断平方，对应位为 1 就乘进答案。n 为负先取倒数；注意 INT_MIN 取负会溢出，先转 long。旧笔记：一开始就想到快速幂，但没想到边算边乘。

复杂度：时间 O(log n)，空间 O(1)

```typescript
class Solution {
  myPow(x: number, n: number): number {
    if (n === 0) return 1
    let N = BigInt(n)
    if (N < 0n) { x = 1 / x; N = -N }
    let ans = 1
    while (N > 0n) {
      if (N & 1n) ans *= x
      x *= x
      N >>= 1n
    }
    return ans
  }
}
```

# x 的平方根

[69. x 的平方根](https://leetcode.cn/problems/sqrtx/)

x 的平方根取整：二分答案 1..x，找最大的 mid 使 mid*mid ≤ x。乘法用 long 防溢出——旧笔记专门提醒过，不然判断翻车循环不结束。

复杂度：时间 O(log x)，空间 O(1)

```typescript
class Solution {
  mySqrt(x: number): number {
    if (x < 2) return x
    let l = 1, r = Math.floor(x / 2), ans = 0
    while (l <= r) {
      const mid = (l + r) >> 1
      if (mid <= Math.floor(x / mid)) { ans = mid; l = mid + 1 }
      else r = mid - 1
    }
    return ans
  }
}
```
