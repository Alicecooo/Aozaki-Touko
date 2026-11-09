---
title: "数学题解"
tab_title: "Math Solutions"
date: "2026-11-10T00:41:43+08:00"
draft: false
topics: ["algorithms"]
tags: ["数学"]
summary: "整数反转、回文数、除法与随机数生成问题。"
---

# 整数反转

[7. 整数反转](https://leetcode.cn/problems/reverse-integer/)

翻转整数要注意溢出：按题意在「再乘 10 加下一位」前判断会不会超出 32 位有符号范围，越界返回 0。末尾 0 翻完自然没了；符号可以单独处理。

复杂度：时间 O(位数)，空间 O(1)

```typescript
class Solution {
  reverse(x: number): number {
    const INT_MAX = 2 ** 31 - 1, INT_MIN = -(2 ** 31)
    let ans = 0
    while (x !== 0) {
      const dig = x % 10
      x = Math.trunc(x / 10)
      if (ans > Math.floor(INT_MAX / 10) || (ans === Math.floor(INT_MAX / 10) && dig > 7)) return 0
      if (ans < Math.ceil(INT_MIN / 10) || (ans === Math.ceil(INT_MIN / 10) && dig < -8)) return 0
      ans = ans * 10 + dig
    }
    return ans
  }
}
```

# 回文数

[9. 回文数](https://leetcode.cn/problems/palindrome-number/)

回文数别转字符串也行：反转一半数字，直到原数 ≤ 反转值。偶数位直接相等，奇数位去掉反转值的个位再比。负数直接 false；以 0 结尾且非 0 的也不可能是回文。

复杂度：时间 O(位数)，空间 O(1)

```typescript
class Solution {
  isPalindrome(x: number): boolean {
    if (x < 0 || (x % 10 === 0 && x !== 0)) return false
    let rev = 0
    while (x > rev) {
      rev = rev * 10 + x % 10
      x = Math.floor(x / 10)
    }
    return x === rev || x === Math.floor(rev / 10)
  }
}
```

# 两数相除

[29. 两数相除](https://leetcode.cn/problems/divide-two-integers/)

不能用乘除模，就用倍增减法：被除数能减去除数的 2^k 倍就减，并累加对应商。符号单独处理；INT_MIN / -1 会溢出，要按题意钳到 INT_MAX。旧笔记卡在边界挺久。

复杂度：时间 O(log² 量级)，空间 O(1)

```typescript
class Solution {
  divide(dividend: number, divisor: number): number {
    const INT_MAX = 2 ** 31 - 1, INT_MIN = -(2 ** 31)
    if (dividend === INT_MIN && divisor === -1) return INT_MAX
    const neg = (dividend > 0) !== (divisor > 0)
    let a = Math.abs(dividend), b = Math.abs(divisor), ans = 0
    for (let i = 31; i >= 0; i--) {
      if (Math.floor(a / b) >= 2 ** i) {
        ans += 2 ** i
        a -= b * (2 ** i)
      }
    }
    return neg ? -ans : ans
  }
}
```

# 用 Rand7() 实现 Rand10()

[470. 用 Rand7() 实现 Rand10()](https://leetcode.cn/problems/implement-rand10-using-rand7/)

用 rand7 构造 rand10：两次 rand7 得到 1..49 的均匀值，只收 1..40 映射到 1..10，41..49 拒绝重来。关键是截一段能被 10 整除的区间，别随便取模破坏均匀性。

复杂度：期望时间 O(1)，空间 O(1)

```typescript
/**
 * The rand7() API is already defined.
 * function rand7(): number {} // @return a random integer in the range 1 to 7
 */
function rand10(): number {
  while (true) {
    const num = (rand7() - 1) * 7 + rand7()
    if (num <= 40) return ((num - 1) % 10) + 1
  }
}
```
