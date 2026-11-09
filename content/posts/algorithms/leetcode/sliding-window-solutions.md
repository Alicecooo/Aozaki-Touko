---
title: "滑动窗口题解"
tab_title: "Sliding Window Solutions"
date: "2026-11-10T00:41:38+08:00"
draft: false
topics: ["algorithms"]
series: ["LeetCode"]
tags: ["滑动窗口"]
summary: "定长与变长窗口的写法，以及字符串窗口题的实现。"
---

## 滑动窗口怎么写

窗口题我一般按三步走：右端点 `right` 先吃进来并更新状态 → 看当前窗口合不合法 → 不合法就左端点 `left` 吐出去，直到重新合法。答案在「合法时」更新还是「即将不合法前」更新，取决于题型：

- **最长**：合法时更新长度（比如无重复子串）
- **最短**：合法时先记答案，再尽量收缩左边
- **计数**：每个右端点对应若干合法左端，累加窗口个数

定长窗口更简单：大小固定为 k，右进一个左出一个。真正容易写乱的是「什么时候算合法」和「计数何时加减」，下面几题把这点抠清楚。

---


# 无重复字符的最长子串

[3. 无重复字符的最长子串](https://leetcode.cn/problems/longest-substring-without-repeating-characters/)

最长无重复子串：右指针扩张，窗口内用 Map 计数（或记上次下标）。字符重复就把左指针右移到合法，过程中更新最大长度。用上次下标可以把 left 一次跳到 `last+1`（只能增大）。

复杂度：时间 O(n)，空间 O(字符集)

```typescript
class Solution {
  lengthOfLongestSubstring(s: string): number {
    const cnt = new Map<string, number>()
    let left = 0, ans = 0
    for (let right = 0; right < s.length; right++) {
      const c = s[right]
      cnt.set(c, (cnt.get(c) ?? 0) + 1)
      while ((cnt.get(c) ?? 0) > 1) {
        const d = s[left++]
        cnt.set(d, cnt.get(d)! - 1)
      }
      ans = Math.max(ans, right - left + 1)
    }
    return ans
  }
}
```

# 找到字符串中所有字母异位词

[438. 找到字符串中所有字母异位词](https://leetcode.cn/problems/find-all-anagrams-in-a-string/)

找异位词子串：相当于定长窗口，窗口大小 = p 的长度。统计 p 的字母计数，滑动 s 时右进左出，计数完全一致就记录起始下标。

可以用「差额种类数」优化判断：维护尚有多少字母计数不对，为 0 时即匹配，避免每次比较整个 26 数组。

复杂度：时间 O(|s|+|p|)，空间 O(字符集)

```typescript
class Solution {
  findAnagrams(s: string, p: string): number[] {
    const n = s.length, m = p.length
    if (n < m) return []
    const cnt = new Array(26).fill(0)
    for (let i = 0; i < m; i++) {
      cnt[p.charCodeAt(i) - 97]++
      cnt[s.charCodeAt(i) - 97]--
    }
    let diff = 0
    for (const v of cnt) if (v !== 0) diff++
    const ans: number[] = []
    if (diff === 0) ans.push(0)
    for (let i = m; i < n; i++) {
      const inIdx = s.charCodeAt(i) - 97
      if (cnt[inIdx] === 0) diff++
      cnt[inIdx]--
      if (cnt[inIdx] === 0) diff--
      const outIdx = s.charCodeAt(i - m) - 97
      if (cnt[outIdx] === 0) diff++
      cnt[outIdx]++
      if (cnt[outIdx] === 0) diff--
      if (diff === 0) ans.push(i - m + 1)
    }
    return ans
  }
}
```

# 串联所有单词的子串

[30. 串联所有单词的子串](https://leetcode.cn/problems/substring-with-concatenation-of-all-words/)

串联所有单词：单词等长时，可以按起点 `0..wordLen-1` 分组做滑动窗口。窗口内按单词粒度右进左出，用计数 Map 对照 words 的需求；多了或不是单词就收缩/重置。

旧笔记里维护过三个 HashMap，偏笨但能过；等长 + 分组窗口是更干净的做法。单词不等长会难很多，这题保证等长。

复杂度：时间 O(|s|·词长量级)，空间 O(单词表)

```typescript
class Solution {
  findSubstring(s: string, words: string[]): number[] {
    if (!words.length) return []
    const wlen = words[0].length, n = words.length, total = wlen * n
    const need = new Map<string, number>()
    for (const w of words) need.set(w, (need.get(w) ?? 0) + 1)
    const ans: number[] = []
    for (let offset = 0; offset < wlen; offset++) {
      let left = offset, count = 0
      const win = new Map<string, number>()
      for (let right = offset; right + wlen <= s.length; right += wlen) {
        const w = s.slice(right, right + wlen)
        if (!need.has(w)) {
          win.clear(); count = 0; left = right + wlen
          continue
        }
        win.set(w, (win.get(w) ?? 0) + 1)
        count++
        while ((win.get(w) ?? 0) > (need.get(w) ?? 0)) {
          const lw = s.slice(left, left + wlen)
          win.set(lw, win.get(lw)! - 1)
          left += wlen; count--
        }
        if (count === n) ans.push(left)
      }
    }
    return ans
  }
}
```
