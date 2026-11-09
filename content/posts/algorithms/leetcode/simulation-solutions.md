---
title: "模拟题解"
tab_title: "Simulation Solutions"
date: "2026-11-10T00:41:39+08:00"
draft: false
topics: ["algorithms"]
tags: ["模拟"]
summary: "按题目规则维护状态，处理方向、坐标与边界。"
---

## 模拟题怎么记

模拟不靠炫技数据结构，靠的是把题意拆成状态和转移：坐标、方向、进位、边界……一步步改，写清楚不变量。热身可以先做走格子、报数、螺旋填充；后面矩阵螺旋、字符串解析其实也是模拟味道。

目前这分类里先放回原点这道，当作「维护状态 → 判定结束条件」的最小例子。

---


# 机器人能否返回原点

[657. 机器人能否返回原点](https://leetcode.cn/problems/robot-return-to-origin/)

机器人从原点按 U/D/L/R 走，问最后能不能回来。维护坐标 `(x,y)`，U/D 改 y、L/R 改 x，走完看是不是还在 (0,0)。也可以分别数垂直、水平方向的净位移是否为 0。

题很简单，放在「模拟」里当热身：按题意一步步改状态就行，别想复杂。若以后遇到带障碍、带转向指令的走格子，也是同一套——状态怎么定义、每一步怎么转移。

复杂度：时间 O(n)，空间 O(1)

```typescript
class Solution {
  judgeCircle(moves: string): boolean {
    let x = 0, y = 0
    for (const c of moves) {
      if (c === 'U') y++
      else if (c === 'D') y--
      else if (c === 'L') x--
      else if (c === 'R') x++
    }
    return x === 0 && y === 0
  }
}
```
