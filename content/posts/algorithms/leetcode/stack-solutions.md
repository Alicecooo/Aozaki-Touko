---
title: "栈题解"
tab_title: "Stack Solutions"
date: "2026-11-10T00:41:40+08:00"
draft: false
topics: ["algorithms"]
series: ["LeetCode"]
tags: ["栈", "单调栈"]
summary: "括号、表达式、单调栈与栈队列转换的题解。"
---

# 有效的括号

[20. 有效的括号](https://leetcode.cn/problems/valid-parentheses/)

括号匹配：左括号入栈，右括号看栈顶是否对应；栈空来了右括号、或结束时栈非空，都不合法。用 Map 记右→左对应关系，空串算合法。

复杂度：时间 O(n)，空间 O(n)

```typescript
class Solution {
  isValid(s: string): boolean {
    const pair: Record<string, string> = { ')':'(', ']':'[', '}':'{' }
    const st: string[] = []
    for (const c of s) {
      if (c === '(' || c === '[' || c === '{') st.push(c)
      else {
        if (!st.length || st.pop() !== pair[c]) return false
      }
    }
    return st.length === 0
  }
}
```

# 最小栈

[155. 最小栈](https://leetcode.cn/problems/min-stack/)

MinStack：每次入栈同时压入当前最小值（或另开同步 min 栈），getMin 直接看顶。pop 时两个一起弹，保证各操作 O(1)。

复杂度：各操作 O(1)

```typescript
class MinStack {
  private st: number[] = []
  private minSt: number[] = []
  push(val: number): void {
    this.st.push(val)
    const m = this.minSt.length ? Math.min(val, this.minSt[this.minSt.length - 1]) : val
    this.minSt.push(m)
  }
  pop(): void {
    this.st.pop()
    this.minSt.pop()
  }
  top(): number {
    return this.st[this.st.length - 1]
  }
  getMin(): number {
    return this.minSt[this.minSt.length - 1]
  }
}
```

# 字符串解码

[394. 字符串解码](https://leetcode.cn/problems/decode-string/)

解码 `3[a2[c]]` 这种：数字可能多位要累读；遇 `[` 把当前串和倍数压栈清零；遇 `]` 弹出拼接 `pre + cur.repeat(num)`。嵌套靠栈自然解决。

复杂度：时间 O(解码后长度)，空间 O(嵌套深度)

```typescript
class Solution {
  decodeString(s: string): string {
    const numSt: number[] = []
    const strSt: string[] = []
    let num = 0, cur = ''
    for (const c of s) {
      if (c >= '0' && c <= '9') num = num * 10 + Number(c)
      else if (c === '[') {
        numSt.push(num)
        strSt.push(cur)
        num = 0
        cur = ''
      } else if (c === ']') {
        const k = numSt.pop()!
        const prev = strSt.pop()!
        cur = prev + cur.repeat(k)
      } else cur += c
    }
    return cur
  }
}
```

# 每日温度

[739. 每日温度](https://leetcode.cn/problems/daily-temperatures/)

每日温度：单调栈存还没等到更高温度的下标。今天更暖就把栈里弹出来，差值即等待天数。典型「下一个更大元素」。

复杂度：时间 O(n)，空间 O(n)

```typescript
class Solution {
  dailyTemperatures(temperatures: number[]): number[] {
    const n = temperatures.length
    const ans = new Array(n).fill(0)
    const st: number[] = []
    for (let i = 0; i < n; i++) {
      while (st.length && temperatures[st[st.length - 1]] < temperatures[i]) {
        const j = st.pop()!
        ans[j] = i - j
      }
      st.push(i)
    }
    return ans
  }
}
```

# 柱状图中最大的矩形

[84. 柱状图中最大的矩形](https://leetcode.cn/problems/largest-rectangle-in-histogram/)

柱状图最大矩形：对每根柱找左右第一个更矮的边界，宽 = right-left-1。单调递增栈一次扫完；两端加高度 0 的哨兵可少写空栈判断。和每日温度同属单调栈。

复杂度：时间 O(n)，空间 O(n)

```typescript
class Solution {
  largestRectangleArea(heights: number[]): number {
    const h = [0, ...heights, 0]
    const st: number[] = []
    let ans = 0
    for (let i = 0; i < h.length; i++) {
      while (st.length && h[st[st.length - 1]] > h[i]) {
        const mid = st.pop()!
        const left = st[st.length - 1]
        ans = Math.max(ans, h[mid] * (i - left - 1))
      }
      st.push(i)
    }
    return ans
  }
}
```

# 简化路径

[71. 简化路径](https://leetcode.cn/problems/simplify-path/)

简化路径：按 `/` 切开，`.` 忽略，`..` 弹栈（有的话），普通段压栈；最后用 `/` 拼回去。根目录、连续斜杠、末尾斜杠按题意处理。

复杂度：时间 O(n)，空间 O(n)

```typescript
class Solution {
  simplifyPath(path: string): string {
    const stack: string[] = []
    for (const part of path.split('/')) {
      if (part === '' || part === '.') continue
      if (part === '..') { if (stack.length) stack.pop() }
      else stack.push(part)
    }
    return '/' + stack.join('/')
  }
}
```

# 逆波兰表达式求值

[150. 逆波兰表达式求值](https://leetcode.cn/problems/evaluate-reverse-polish-notation/)

逆波兰：遇数字入栈，遇运算符弹出两个算完再压回去。减法和除法注意顺序——后弹的是左操作数。旧感想：栈的经典应用，学过数据结构就不难；符号用 switch 清爽。

复杂度：时间 O(n)，空间 O(n)

```typescript
class Solution {
  evalRPN(tokens: string[]): number {
    const st: number[] = []
    for (const t of tokens) {
      if (t === '+' || t === '-' || t === '*' || t === '/') {
        const b = st.pop()!, a = st.pop()!
        if (t === '+') st.push(a + b)
        else if (t === '-') st.push(a - b)
        else if (t === '*') st.push(a * b)
        else st.push(Math.trunc(a / b))
      } else st.push(Number(t))
    }
    return st[0]
  }
}
```

# 用栈实现队列

[232. 用栈实现队列](https://leetcode.cn/problems/implement-queue-using-stacks/)

两个栈实现队列：`in` 负责 push，`out` 负责 pop/peek；`out` 空时把 `in` 全部倒过去，摊还 O(1)。别每次操作都倒，否则退化。

复杂度：摊还 O(1)

```typescript
class MyQueue {
  private inStack: number[] = []
  private outStack: number[] = []
  push(x: number): void { this.inStack.push(x) }
  private move(): void {
    if (this.outStack.length) return
    while (this.inStack.length) this.outStack.push(this.inStack.pop()!)
  }
  pop(): number { this.move(); return this.outStack.pop()! }
  peek(): number { this.move(); return this.outStack[this.outStack.length - 1] }
  empty(): boolean { return this.inStack.length === 0 && this.outStack.length === 0 }
}
```
