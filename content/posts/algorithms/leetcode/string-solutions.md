---
title: "字符串题解"
tab_title: "String Solutions"
date: "2026-11-10T00:41:45+08:00"
draft: false
topics: ["algorithms"]
series: ["LeetCode"]
tags: ["字符串"]
summary: "字符串转换、匹配、模拟运算与格式处理的题解。"
---

# Z 字形变换

[6. Z 字形变换](https://leetcode.cn/problems/zigzag-conversion/)

Z 字形变换：用 `numRows` 个桶，向下走再拐弯向上（方向 flag），字符依次丢进当前行。最后把各行拼起来。行数为 1 时直接返回原串。

复杂度：时间 O(n)，空间 O(n)

```typescript
class Solution {
  convert(s: string, numRows: number): string {
    if (numRows === 1 || numRows >= s.length) return s
    const rows = Array.from({ length: numRows }, () => '')
    let r = 0, dir = 1
    for (const ch of s) {
      rows[r] += ch
      if (r === 0) dir = 1
      else if (r === numRows - 1) dir = -1
      r += dir
    }
    return rows.join('')
  }
}
```

# 字符串转换整数 (atoi)

[8. 字符串转换整数 (atoi)](https://leetcode.cn/problems/string-to-integer-atoi/)

字符串转整数（atoi）：去前导空格 → 读符号 → 读数字并处理溢出（和题 7 类似，乘 10 加之前判断）→ 遇非数字停。旧笔记提醒空串、只有符号、一堆 0 再跟数字这些用例。

复杂度：时间 O(n)，空间 O(1)

```typescript
class Solution {
  myAtoi(s: string): number {
    let i = 0, n = s.length
    while (i < n && s[i] === ' ') i++
    let sign = 1
    if (i < n && (s[i] === '+' || s[i] === '-')) { sign = s[i] === '-' ? -1 : 1; i++ }
    let num = 0
    const INT_MAX = 2 ** 31 - 1, INT_MIN = -(2 ** 31)
    while (i < n && s[i] >= '0' && s[i] <= '9') {
      const d = s.charCodeAt(i) - 48
      if (num > Math.floor(INT_MAX / 10) || (num === Math.floor(INT_MAX / 10) && d > 7)) {
        return sign === 1 ? INT_MAX : INT_MIN
      }
      num = num * 10 + d
      i++
    }
    return sign * num
  }
}
```

# 整数转罗马数字

[12. 整数转罗马数字](https://leetcode.cn/problems/integer-to-roman/)

整数转罗马：贪心从表（1000,900,500,...）从大到小减。旧笔记：StringBuilder/数组拼接比反复字符串 + 高效。

复杂度：时间 O(1)（数字范围有限），空间 O(1)

```typescript
class Solution {
  intToRoman(num: number): string {
    const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1]
    const syms = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I']
    let ans = ''
    for (let i = 0; i < vals.length; i++) {
      while (num >= vals[i]) { num -= vals[i]; ans += syms[i] }
    }
    return ans
  }
}
```

# 罗马数字转整数

[13. 罗马数字转整数](https://leetcode.cn/problems/roman-to-integer/)

罗马转整数：从左扫，若当前比下一位小则减去（IV、IX 这种），否则加上。旧笔记参考评论区写法：也可以统一处理「先加后对特殊减法修正」。

复杂度：时间 O(n)，空间 O(1)

```typescript
class Solution {
  romanToInt(s: string): number {
    const map: Record<string, number> = { I:1, V:5, X:10, L:50, C:100, D:500, M:1000 }
    let ans = 0
    for (let i = 0; i < s.length; i++) {
      const v = map[s[i]], next = map[s[i + 1]] ?? 0
      ans += v < next ? -v : v
    }
    return ans
  }
}
```

# 最长公共前缀

[14. 最长公共前缀](https://leetcode.cn/problems/longest-common-prefix/)

最长公共前缀：以第一个串为基准，逐字符和其他串比较，对不上就截断。旧笔记觉得暴力就够，不必上 Trie。空数组返回空串。

复杂度：时间 O(总字符)，空间 O(1)

```typescript
class Solution {
  longestCommonPrefix(strs: string[]): string {
    if (!strs.length) return ''
    for (let i = 0; i < strs[0].length; i++) {
      const c = strs[0][i]
      for (let j = 1; j < strs.length; j++) {
        if (i === strs[j].length || strs[j][i] !== c) return strs[0].slice(0, i)
      }
    }
    return strs[0]
  }
}
```

# 外观数列

[38. 外观数列](https://leetcode.cn/problems/count-and-say/)

外观数列：从「1」起迭代 n-1 次，每次数连续相同字符，输出「个数+该字符」。纯模拟，注意段的起止下标别写飞。

复杂度：时间与项长度有关

```typescript
class Solution {
  countAndSay(n: number): string {
    let s = '1'
    for (let k = 1; k < n; k++) {
      let next = '', i = 0
      while (i < s.length) {
        let j = i
        while (j < s.length && s[j] === s[i]) j++
        next += String(j - i) + s[i]
        i = j
      }
      s = next
    }
    return s
  }
}
```

# 字符串相乘

[43. 字符串相乘](https://leetcode.cn/problems/multiply-strings/)

字符串相乘：模拟竖式，`num1[i]*num2[j]` 落在结果数组位置 `i+j、i+j+1`，处理进位。最后去掉前导零。别转成数字——会爆精度。

复杂度：时间 O(mn)，空间 O(m+n)

```typescript
class Solution {
  multiply(num1: string, num2: string): string {
    if (num1 === '0' || num2 === '0') return '0'
    const m = num1.length, n = num2.length
    const ans = new Array(m + n).fill(0)
    for (let i = m - 1; i >= 0; i--) {
      for (let j = n - 1; j >= 0; j--) {
        const mul = (num1.charCodeAt(i) - 48) * (num2.charCodeAt(j) - 48)
        const p1 = i + j, p2 = i + j + 1
        const sum = mul + ans[p2]
        ans[p2] = sum % 10
        ans[p1] += Math.floor(sum / 10)
      }
    }
    let i = 0
    while (i < ans.length && ans[i] === 0) i++
    return ans.slice(i).join('')
  }
}
```

# 最后一个单词的长度

[58. 最后一个单词的长度](https://leetcode.cn/problems/length-of-last-word/)

最后一个单词长度：从尾部跳过空格，再数连续非空格。也可以 trim 后 split 取最后一个，但双指针更贴「不借库」的练手。

复杂度：时间 O(n)，空间 O(1)

```typescript
class Solution {
  lengthOfLastWord(s: string): number {
    let i = s.length - 1
    while (i >= 0 && s[i] === ' ') i--
    let len = 0
    while (i >= 0 && s[i] !== ' ') { len++; i-- }
    return len
  }
}
```

# 二进制求和

[67. 二进制求和](https://leetcode.cn/problems/add-binary/)

二进制字符串相加，从尾部往前，`bit = a + b + carry`，当前位 `bit%2`，进位 `bit>>1`。和链表两数相加、字符串大数加都是同一套。最后记得处理剩余进位，结果反转。

复杂度：时间 O(max(m,n))，空间 O(max(m,n))

```typescript
class Solution {
  addBinary(a: string, b: string): string {
    let i = a.length - 1, j = b.length - 1, carry = 0
    const res: number[] = []
    while (i >= 0 || j >= 0 || carry) {
      const x = i >= 0 ? a.charCodeAt(i--) - 48 : 0
      const y = j >= 0 ? b.charCodeAt(j--) - 48 : 0
      const sum = x + y + carry
      res.push(sum % 2)
      carry = Math.floor(sum / 2)
    }
    return res.reverse().join('')
  }
}
```

# 文本左右对齐

[68. 文本左右对齐](https://leetcode.cn/problems/text-justification/)

文本左右对齐：贪心凑每行最多单词，再算空格分配；中间行两侧对齐（空格均分，多的靠左），最后一行左对齐且单词间单空格。旧笔记觉得不难但第一次漏了「最后一行特殊」。

复杂度：时间 O(总字符)，空间 O(输出)

```typescript
class Solution {
  fullJustify(words: string[], maxWidth: number): string[] {
    const ans: string[] = []
    let i = 0
    while (i < words.length) {
      let j = i, len = 0
      while (j < words.length && len + words[j].length + (j - i) <= maxWidth) {
        len += words[j].length; j++
      }
      const count = j - i
      let line = ''
      if (j === words.length || count === 1) {
        line = words.slice(i, j).join(' ')
        line += ' '.repeat(maxWidth - line.length)
      } else {
        const spaces = maxWidth - len
        const gap = Math.floor(spaces / (count - 1))
        let extra = spaces % (count - 1)
        for (let k = i; k < j; k++) {
          line += words[k]
          if (k < j - 1) {
            line += ' '.repeat(gap + (extra > 0 ? 1 : 0))
            if (extra > 0) extra--
          }
        }
      }
      ans.push(line)
      i = j
    }
    return ans
  }
}
```

# 验证 IP 地址

[468. 验证 IP 地址](https://leetcode.cn/problems/validate-ip-address/)

验证 IP：按 `.` / `:` 判断候选 IPv4/IPv6。IPv4：四段、无前导零、0-255；IPv6：八段、每段 1-4 位十六进制。分段后逐条校验，不合返回 Neither。

复杂度：时间 O(n)，空间 O(1)

```typescript
class Solution {
  validIPAddress(queryIP: string): string {
    const isIPv4 = (s: string) => {
      const parts = s.split('.')
      if (parts.length !== 4) return false
      for (const p of parts) {
        if (!/^\d+$/.test(p) || (p.length > 1 && p[0] === '0')) return false
        const n = Number(p)
        if (n < 0 || n > 255) return false
      }
      return true
    }
    const isIPv6 = (s: string) => {
      const parts = s.split(':')
      if (parts.length !== 8) return false
      for (const p of parts) {
        if (!/^[0-9a-fA-F]{1,4}$/.test(p)) return false
      }
      return true
    }
    if (isIPv4(queryIP)) return 'IPv4'
    if (isIPv6(queryIP)) return 'IPv6'
    return 'Neither'
  }
}
```
