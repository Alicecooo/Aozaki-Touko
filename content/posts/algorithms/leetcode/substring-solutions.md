---
title: "子串与子数组题解"
tab_title: "Substring Solutions"
date: "2026-11-10T00:41:46+08:00"
draft: false
topics: ["algorithms"]
tags: ["字符串", "前缀和"]
summary: "前缀和、单调队列、覆盖子串与字符串匹配问题。"
---

# 和为 K 的子数组

[560. 和为 K 的子数组](https://leetcode.cn/problems/subarray-sum-equals-k/)

和为 k 的子数组个数：前缀和 + 哈希。扫到前缀 sum 时，查之前出现过多少次 `sum-k`。初始化 `map.set(0,1)`，表示空前缀。有负数，别想滑窗。

复杂度：时间 O(n)，空间 O(n)

```typescript
class Solution {
  subarraySum(nums: number[], k: number): number {
    const map = new Map<number, number>([[0, 1]])
    let pre = 0, ans = 0
    for (const x of nums) {
      pre += x
      ans += map.get(pre - k) ?? 0
      map.set(pre, (map.get(pre) ?? 0) + 1)
    }
    return ans
  }
}
```

# 滑动窗口最大值

[239. 滑动窗口最大值](https://leetcode.cn/problems/sliding-window-maximum/)

滑动窗口最大值：单调双端队列，队内下标对应值严格递减。新元素挤掉队尾更小的，队头滑出窗口就弹。每个下标进出一次，整体 O(n)。

复杂度：时间 O(n)，空间 O(k)

```typescript
class Solution {
  maxSlidingWindow(nums: number[], k: number): number[] {
    const q: number[] = []
    const ans: number[] = []
    for (let i = 0; i < nums.length; i++) {
      while (q.length && nums[q[q.length - 1]] <= nums[i]) q.pop()
      q.push(i)
      if (q[0] <= i - k) q.shift()
      if (i >= k - 1) ans.push(nums[q[0]])
    }
    return ans
  }
}
```

# 最小覆盖子串

[76. 最小覆盖子串](https://leetcode.cn/problems/minimum-window-substring/)

最小覆盖子串：先右扩到覆盖 t，再尽量左缩并更新最短窗。用「还欠几种字符」计数，比每次比整个 Map 轻。没有合法窗口返回空串，答案记起止下标。

复杂度：时间 O(|s|+|t|)，空间 O(字符集)

```typescript
class Solution {
  minWindow(s: string, t: string): string {
    const need = new Map<string, number>()
    for (const c of t) need.set(c, (need.get(c) ?? 0) + 1)
    const window = new Map<string, number>()
    let valid = 0, left = 0
    let start = 0, len = Infinity
    for (let right = 0; right < s.length; right++) {
      const c = s[right]
      if (need.has(c)) {
        window.set(c, (window.get(c) ?? 0) + 1)
        if (window.get(c) === need.get(c)) valid++
      }
      while (valid === need.size) {
        if (right - left + 1 < len) {
          start = left
          len = right - left + 1
        }
        const d = s[left++]
        if (need.has(d)) {
          if (window.get(d) === need.get(d)) valid--
          window.set(d, window.get(d)! - 1)
        }
      }
    }
    return len === Infinity ? '' : s.slice(start, start + len)
  }
}
```

# 找出字符串中第一个匹配项的下标

[28. 找出字符串中第一个匹配项的下标](https://leetcode.cn/problems/find-the-index-of-the-first-occurrence-in-a-string/)

实现 strStr / 找出针在干草堆第一次出现的位置。暴力双指针能过小数据；正经写法是 KMP，先为 needle 建 next 数组，匹配失败时模式串跳到 `next[j]`。

旧笔记当字符串基础题；面试若允许直接调库另说，手写至少要会暴力和 KMP 思路。

复杂度：暴力 O(nm)；KMP O(n+m)

```typescript
class Solution {
  strStr(haystack: string, needle: string): number {
    if (needle.length === 0) return 0
    const n = haystack.length, m = needle.length
    for (let i = 0; i + m <= n; i++) {
      let j = 0
      while (j < m && haystack[i + j] === needle[j]) j++
      if (j === m) return i
    }
    return -1
  }
}
```

# 重复的子字符串

[459. 重复的子字符串](https://leetcode.cn/problems/repeated-substring-pattern/)

判断字符串是否由子串重复构成：一个技巧是 `(s+s).slice(1,-1).includes(s)`——若由周期串组成，加倍后去掉首尾仍能找到原串。也可以枚举周期长度（整除 n 的因子）逐段比较。

空串、单字符按题意处理；注意周期至少重复两次。

复杂度：时间 O(n)，空间 O(n)（加倍法）

```typescript
class Solution {
  repeatedSubstringPattern(s: string): boolean {
    return (s + s).slice(1, -1).includes(s)
  }
}
```
