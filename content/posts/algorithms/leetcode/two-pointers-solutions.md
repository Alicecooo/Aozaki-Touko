---
title: "双指针题解"
tab_title: "Two Pointers Solutions"
date: "2026-11-10T00:41:52+08:00"
draft: false
topics: ["algorithms"]
series: ["LeetCode"]
tags: ["双指针"]
summary: "数组与字符串中相向、同向指针的常见题型。"
---

# 移动零

[283. 移动零](https://leetcode.cn/problems/move-zeroes/)

移动零：慢指针写非零，快指针扫描；扫完把慢指针后面全填 0。相对顺序保持不变，一次遍历。

复杂度：时间 O(n)，空间 O(1)

```typescript
class Solution {
  moveZeroes(nums: number[]): void {
    let i = 0
    for (let j = 0; j < nums.length; j++) {
      if (nums[j] !== 0) {
        ;[nums[i], nums[j]] = [nums[j], nums[i]]
        i++
      }
    }
  }
}
```

# 盛最多水的容器

[11. 盛最多水的容器](https://leetcode.cn/problems/container-with-most-water/)

盛最多水：左右指针夹逼。面积 = min(高)×宽；每次移动较矮的那边——因为宽缩小了，只有更高才可能变大。这是贪心证明过的经典双指针。

复杂度：时间 O(n)，空间 O(1)

```typescript
class Solution {
  maxArea(height: number[]): number {
    let l = 0, r = height.length - 1, ans = 0
    while (l < r) {
      ans = Math.max(ans, Math.min(height[l], height[r]) * (r - l))
      if (height[l] < height[r]) l++
      else r--
    }
    return ans
  }
}
```

# 三数之和

[15. 三数之和](https://leetcode.cn/problems/3sum/)

三数之和：先排序，枚举第一个数，后两个左右夹逼。去重是关键——同一层相同值跳过；找到解后左右都跳到不同值。第一个数已经 >0 就可以提前结束。

复杂度：时间 O(n²)，空间 O(1) 额外

```typescript
class Solution {
  threeSum(nums: number[]): number[][] {
    nums.sort((a, b) => a - b)
    const ans: number[][] = []
    const n = nums.length
    for (let i = 0; i < n - 2; i++) {
      if (i > 0 && nums[i] === nums[i - 1]) continue
      if (nums[i] > 0) break
      let l = i + 1, r = n - 1
      while (l < r) {
        const s = nums[i] + nums[l] + nums[r]
        if (s === 0) {
          ans.push([nums[i], nums[l], nums[r]])
          while (l < r && nums[l] === nums[l + 1]) l++
          while (l < r && nums[r] === nums[r - 1]) r--
          l++; r--
        } else if (s < 0) l++
        else r--
      }
    }
    return ans
  }
}
```

# 接雨水

[42. 接雨水](https://leetcode.cn/problems/trapping-rain-water/)

接雨水：每个位置的水位由左右最高柱决定。双指针从两端往中间，矮的一侧先结算——因为另一侧已经有更高挡板。预处理左右最大数组也行，多 O(n) 空间。

复杂度：时间 O(n)，空间 O(1) 双指针

```typescript
class Solution {
  trap(height: number[]): number {
    let l = 0, r = height.length - 1
    let leftMax = 0, rightMax = 0, ans = 0
    while (l < r) {
      leftMax = Math.max(leftMax, height[l])
      rightMax = Math.max(rightMax, height[r])
      if (leftMax < rightMax) {
        ans += leftMax - height[l]
        l++
      } else {
        ans += rightMax - height[r]
        r--
      }
    }
    return ans
  }
}
```

# 最接近的三数之和

[16. 最接近的三数之和](https://leetcode.cn/problems/3sum-closest/)

最接近的三数之和：和 15 一样排序 + 枚举 + 双指针，但维护与 target 的最小差值，不必去重答案集合。旧笔记：参考 15 很容易做出来。

复杂度：时间 O(n²)，空间 O(1)

```typescript
class Solution {
  threeSumClosest(nums: number[], target: number): number {
    nums.sort((a, b) => a - b)
    const n = nums.length
    let best = nums[0] + nums[1] + nums[2]
    for (let i = 0; i < n - 2; i++) {
      let l = i + 1, r = n - 1
      while (l < r) {
        const s = nums[i] + nums[l] + nums[r]
        if (Math.abs(s - target) < Math.abs(best - target)) best = s
        if (s === target) return s
        if (s < target) l++
        else r--
      }
    }
    return best
  }
}
```

# 四数之和

[18. 四数之和](https://leetcode.cn/problems/4sum/)

四数之和：排序后两层枚举 + 内层双指针，注意每一层去重，以及剪枝（最小/最大四数和已经越界就 continue/break）。旧笔记说参考 15、16，难点更多在去重和剪枝写干净。

复杂度：时间 O(n³)，空间 O(1)

```typescript
class Solution {
  fourSum(nums: number[], target: number): number[][] {
    nums.sort((a, b) => a - b)
    const n = nums.length, ans: number[][] = []
    for (let i = 0; i < n - 3; i++) {
      if (i > 0 && nums[i] === nums[i - 1]) continue
      for (let j = i + 1; j < n - 2; j++) {
        if (j > i + 1 && nums[j] === nums[j - 1]) continue
        let l = j + 1, r = n - 1
        while (l < r) {
          const s = nums[i] + nums[j] + nums[l] + nums[r]
          if (s === target) {
            ans.push([nums[i], nums[j], nums[l], nums[r]])
            while (l < r && nums[l] === nums[l + 1]) l++
            while (l < r && nums[r] === nums[r - 1]) r--
            l++; r--
          } else if (s < target) l++
          else r--
        }
      }
    }
    return ans
  }
}
```

# 删除有序数组中的重复项

[26. 删除有序数组中的重复项](https://leetcode.cn/problems/remove-duplicates-from-sorted-array/)

删除排序数组重复项：慢指针 i 表示「已放好的末尾」，快指针 j 扫；`nums[j]!=nums[i]` 时 `i++` 再赋值。返回新长度 i+1。旧感想里这题用时很漂亮，原地 O(1) 空间。

复杂度：时间 O(n)，空间 O(1)

```typescript
class Solution {
  removeDuplicates(nums: number[]): number {
    if (nums.length === 0) return 0
    let i = 0
    for (let j = 1; j < nums.length; j++) {
      if (nums[j] !== nums[i]) nums[++i] = nums[j]
    }
    return i + 1
  }
}
```

# 移除元素

[27. 移除元素](https://leetcode.cn/problems/remove-element/)

移除元素：和 26 类似，快慢指针，不等于 val 的就写到慢指针位置。顺序可变，更随意；也可以双端交换把 val 换到后面。

复杂度：时间 O(n)，空间 O(1)

```typescript
class Solution {
  removeElement(nums: number[], val: number): number {
    let i = 0
    for (let j = 0; j < nums.length; j++) {
      if (nums[j] !== val) nums[i++] = nums[j]
    }
    return i
  }
}
```

# 删除有序数组中的重复项 II

[80. 删除有序数组中的重复项 II](https://leetcode.cn/problems/remove-duplicates-from-sorted-array-ii/)

重复项最多留两个：慢指针表示写位置，当 `nums[i] !== nums[slow-2]`（已写长度≥2）时可以写入。推广：最多留 k 个就和 `slow-k` 比。

复杂度：时间 O(n)，空间 O(1)

```typescript
class Solution {
  removeDuplicates(nums: number[]): number {
    let i = 0
    for (const x of nums) {
      if (i < 2 || x !== nums[i - 2]) nums[i++] = x
    }
    return i
  }
}
```

# 合并两个有序数组

[88. 合并两个有序数组](https://leetcode.cn/problems/merge-sorted-array/)

合并两有序数组：从尾部往前填，避免覆盖 nums1 前部。比较 nums1[i]、nums2[j]，大的放到 `k`，三指针递减；nums2 剩的再拷过去。

复杂度：时间 O(m+n)，空间 O(1)

```typescript
class Solution {
  merge(nums1: number[], m: number, nums2: number[], n: number): void {
    let i = m - 1, j = n - 1, k = m + n - 1
    while (j >= 0) {
      if (i >= 0 && nums1[i] > nums2[j]) nums1[k--] = nums1[i--]
      else nums1[k--] = nums2[j--]
    }
  }
}
```

# 验证回文串 II

[680. 验证回文串 II](https://leetcode.cn/problems/valid-palindrome-ii/)

最多删一个字符成回文：双指针两端往中间，遇到不等时尝试删左或删右，看剩下是否回文（只允许再删这一次）。旧笔记这类题注意别递归删多次。

复杂度：时间 O(n)，空间 O(1)

```typescript
class Solution {
  validPalindrome(s: string): boolean {
    const isPal = (l: number, r: number) => {
      while (l < r) {
        if (s[l] !== s[r]) return false
        l++; r--
      }
      return true
    }
    let l = 0, r = s.length - 1
    while (l < r) {
      if (s[l] !== s[r]) return isPal(l + 1, r) || isPal(l, r - 1)
      l++; r--
    }
    return true
  }
}
```
