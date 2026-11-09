---
title: "哈希表题解"
tab_title: "Hash Table Solutions"
date: "2026-11-10T00:41:51+08:00"
draft: false
topics: ["algorithms"]
series: ["LeetCode"]
tags: ["哈希表"]
summary: "两数之和、异位词、连续序列与重复元素的哈希解法。"
---

# 两数之和

[1. 两数之和](https://leetcode.cn/problems/two-sum/)

暴力是两层循环找 `target - x`，O(n²)。一遍哈希的关键在于：扫到 `nums[i]` 时，只需要问「前面有没有出现过 `target - nums[i]`」。用 Map 存「值 → 下标」，边走边查，查到就返回两个下标。

注意不要先把整个数组塞进 Map 再扫第二遍——虽然也能做，但要额外处理「不能和自己配对」；一遍法天然避免了这个问题。返回的是下标不是值，题目保证恰好一对解。

复杂度：时间 O(n)，空间 O(n)

```typescript
class Solution {
  twoSum(nums: number[], target: number): number[] {
    const map = new Map<number, number>()
    for (let i = 0; i < nums.length; i++) {
      const need = target - nums[i]
      if (map.has(need)) return [map.get(need)!, i]
      map.set(nums[i], i)
    }
    return []
  }
}
```

# 字母异位词分组

[49. 字母异位词分组](https://leetcode.cn/problems/group-anagrams/)

异位词的本质是字母计数相同。最省事的 key 是把字符串排序后拼回去，同一组异位词会落到同一个桶里。串很长、只含小写时，也可以用长度为 26 的计数数组编码成 key，少一次排序。

这题没什么花活，就是哈希分组；写的时候记得 `map` 里用数组 push，最后取 `values()`。

复杂度：时间 O(n·k log k)（排序 key），空间 O(nk)

```typescript
class Solution {
  groupAnagrams(strs: string[]): string[][] {
    const map = new Map<string, string[]>()
    for (const s of strs) {
      const key = [...s].sort().join('')
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(s)
    }
    return [...map.values()]
  }
}
```

# 最长连续序列

[128. 最长连续序列](https://leetcode.cn/problems/longest-consecutive-sequence/)

如果先排序再扫连续段，是 O(n log n)。想线性的话用 Set：对每个数 x，只有当 `x-1` 不在集合里时，它才是一段连续序列的起点，再一路 `x+1, x+2...` 数下去。这样每个数最多被访问常数次，整体 O(n)。

坑点：要从 Set 里迭代而不是原数组，避免重复数把复杂度弄脏；空数组答案是 0。

复杂度：时间 O(n)，空间 O(n)

```typescript
class Solution {
  longestConsecutive(nums: number[]): number {
    const set = new Set(nums)
    let ans = 0
    for (const x of set) {
      if (set.has(x - 1)) continue
      let y = x
      while (set.has(y + 1)) y++
      ans = Math.max(ans, y - x + 1)
    }
    return ans
  }
}
```

# 存在重复元素

[217. 存在重复元素](https://leetcode.cn/problems/contains-duplicate/)

判断有没有重复，HashSet 边插边查最直观。旧笔记里吐槽过：理论 O(n) 的 Set 在 Java 里有时反而慢过先排序再比相邻——常数和缓存的事。TS 里 Set 一般够用；若在意极限性能也可以 `sort` 后扫一遍。

空数组或单元素直接 false。

复杂度：时间 O(n)，空间 O(n)；排序法则 O(n log n) / O(1) 额外空间

```typescript
class Solution {
  containsDuplicate(nums: number[]): boolean {
    const set = new Set<number>()
    for (const x of nums) {
      if (set.has(x)) return true
      set.add(x)
    }
    return false
  }
}
```

# 存在重复元素 II

[219. 存在重复元素 II](https://leetcode.cn/problems/contains-duplicate-ii/)

和 217 比多了个距离约束 `|i-j| ≤ k`。Map 记「值 → 最近一次下标」，扫到相同值时看下标差；之后把下标更新成当前的（只要最近的，更远的更不可能满足）。

也可以维护一个大小不超过 k 的滑动窗口 Set：右进左出，窗口内撞车就 true。两种写法看哪个顺手。

复杂度：时间 O(n)，空间 O(min(n, k))

```typescript
class Solution {
  containsNearbyDuplicate(nums: number[], k: number): boolean {
    const map = new Map<number, number>()
    for (let i = 0; i < nums.length; i++) {
      if (map.has(nums[i]) && i - map.get(nums[i])! <= k) return true
      map.set(nums[i], i)
    }
    return false
  }
}
```

# 缺失数字

[268. 缺失数字](https://leetcode.cn/problems/missing-number/)

`0..n` 缺一个。异或最干净：把下标 `0..n-1`、值 `nums[i]` 以及 n 全部异或，成对的消掉，剩下就是缺的那个。求和用高斯公式 `n(n+1)/2` 减数组和也行，注意溢出的话用 bigint 或边加边减。

旧笔记里写过哈希/排序也能做，但异或不占额外空间还不容易写错。

复杂度：时间 O(n)，空间 O(1)

```typescript
class Solution {
  missingNumber(nums: number[]): number {
    let xor = nums.length
    for (let i = 0; i < nums.length; i++) xor ^= i ^ nums[i]
    return xor
  }
}
```

# 砖墙

[554. 砖墙](https://leetcode.cn/problems/brick-wall/)

砖墙画一条竖线，希望穿过的砖尽可能少——等价于「缝对齐次数尽可能多」。对每一行累加前缀和（不要算到最后一块，右边界大家共用不算缝），用哈希统计每个缝位置出现几次。穿过砖数 = 行数 - 缝出现的最多次数。

当时做这题就是「前缀和 + 哈希」一下子对上了；别把最右边那条边也统计进去，否则答案会变成 0。

复杂度：时间 O(总砖数)，空间 O(不同缝位置数)

```typescript
class Solution {
  leastBricks(wall: number[][]): number {
    const map = new Map<number, number>()
    let best = 0
    for (const row of wall) {
      let sum = 0
      for (let i = 0; i < row.length - 1; i++) {
        sum += row[i]
        const c = (map.get(sum) ?? 0) + 1
        map.set(sum, c)
        best = Math.max(best, c)
      }
    }
    return wall.length - best
  }
}
```
