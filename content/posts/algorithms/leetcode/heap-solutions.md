---
title: "堆与优先队列题解"
tab_title: "Heap Solutions"
date: "2026-11-10T00:41:48+08:00"
draft: false
topics: ["algorithms"]
series: ["LeetCode"]
tags: ["堆", "优先队列"]
summary: "第 K 大元素、高频元素与数据流中位数。"
---

# 数组中的第K个最大元素

[215. 数组中的第K个最大元素](https://leetcode.cn/problems/kth-largest-element-in-an-array/)

第 k 大：维护大小为 k 的小根堆，比堆顶大就替换，扫完堆顶即答案；也可以快速选择。数据量不大时直接排序取下标，面试说明取舍即可。

复杂度：时间 O(n log k)，空间 O(k)

```typescript
class Solution {
  findKthLargest(nums: number[], k: number): number {
    const partition = (l: number, r: number): number => {
      const pivot = nums[r]
      let i = l
      for (let j = l; j < r; j++) {
        if (nums[j] >= pivot) { // 大的放左边（第 k 大）
          ;[nums[i], nums[j]] = [nums[j], nums[i]]
          i++
        }
      }
      ;[nums[i], nums[r]] = [nums[r], nums[i]]
      return i
    }
    let l = 0, r = nums.length - 1
    const target = k - 1
    while (true) {
      const p = partition(l, r)
      if (p === target) return nums[p]
      if (p < target) l = p + 1
      else r = p - 1
    }
  }
}
```

# 前 K 个高频元素

[347. 前 K 个高频元素](https://leetcode.cn/problems/top-k-frequent-elements/)

先哈希计数词频，再按频次取前 k。可以用大小为 k 的小根堆（频次最小的在堆顶，不够格就踢掉），也可以桶排序：频次当桶下标，从高往低收集。桶排序在「频次 ≤ n」时是线性的，挺漂亮。

复杂度：堆：O(n log k)；桶：O(n)

```typescript
class Solution {
  topKFrequent(nums: number[], k: number): number[] {
    const freq = new Map<number, number>()
    for (const x of nums) freq.set(x, (freq.get(x) ?? 0) + 1)
    const buckets: number[][] = Array.from({ length: nums.length + 1 }, () => [])
    for (const [num, f] of freq) buckets[f].push(num)
    const ans: number[] = []
    for (let i = buckets.length - 1; i >= 0 && ans.length < k; i--) {
      for (const num of buckets[i]) {
        ans.push(num)
        if (ans.length === k) return ans
      }
    }
    return ans
  }
}
```

# 数据流的中位数

[295. 数据流的中位数](https://leetcode.cn/problems/find-median-from-data-stream/)

数据流中位数：小数半边进大根堆，大数半边进小根堆，保持两边数量差 ≤1。奇数取较多一边堆顶，偶数两顶平均。每次插入后要 rebalance。

复杂度：插入 O(log n)，查询 O(1)

```typescript
class MedianFinder {
  private lo: number[] = [] // max-heap：较小的一半
  private hi: number[] = [] // min-heap：较大的一半

  private pushMax(h: number[], x: number) {
    h.push(x)
    let i = h.length - 1
    while (i > 0) {
      const p = (i - 1) >> 1
      if (h[p] >= h[i]) break
      ;[h[p], h[i]] = [h[i], h[p]]
      i = p
    }
  }
  private popMax(h: number[]): number {
    const top = h[0]
    const last = h.pop()!
    if (h.length) {
      h[0] = last
      let i = 0
      while (true) {
        let best = i, l = i * 2 + 1, r = l + 1
        if (l < h.length && h[l] > h[best]) best = l
        if (r < h.length && h[r] > h[best]) best = r
        if (best === i) break
        ;[h[i], h[best]] = [h[best], h[i]]
        i = best
      }
    }
    return top
  }
  private pushMin(h: number[], x: number) {
    h.push(x)
    let i = h.length - 1
    while (i > 0) {
      const p = (i - 1) >> 1
      if (h[p] <= h[i]) break
      ;[h[p], h[i]] = [h[i], h[p]]
      i = p
    }
  }
  private popMin(h: number[]): number {
    const top = h[0]
    const last = h.pop()!
    if (h.length) {
      h[0] = last
      let i = 0
      while (true) {
        let best = i, l = i * 2 + 1, r = l + 1
        if (l < h.length && h[l] < h[best]) best = l
        if (r < h.length && h[r] < h[best]) best = r
        if (best === i) break
        ;[h[i], h[best]] = [h[best], h[i]]
        i = best
      }
    }
    return top
  }

  addNum(num: number): void {
    this.pushMax(this.lo, num)
    this.pushMin(this.hi, this.popMax(this.lo))
    if (this.lo.length < this.hi.length) this.pushMax(this.lo, this.popMin(this.hi))
  }

  findMedian(): number {
    if (this.lo.length > this.hi.length) return this.lo[0]
    return (this.lo[0] + this.hi[0]) / 2
  }
}
```
