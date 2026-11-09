---
title: "链表题解"
tab_title: "Linked List Solutions"
date: "2026-11-10T00:41:35+08:00"
draft: false
topics: ["algorithms"]
tags: ["链表"]
summary: "反转、合并、环检测、排序与指针重连的常见题型。"
---

# 相交链表

[160. 相交链表](https://leetcode.cn/problems/intersection-of-two-linked-lists/)

相交链表：A 走完接到 B 头、B 走完接到 A 头，两指针路程一样长，相遇点即交点（不相交则同时到 null）。不用先量长度。

复杂度：时间 O(m+n)，空间 O(1)

```typescript
class ListNode {
  val: number
  next: ListNode | null
  constructor(val?: number, next?: ListNode | null) {
    this.val = val === undefined ? 0 : val
    this.next = next === undefined ? null : next
  }
}
class Solution {
  getIntersectionNode(headA: ListNode | null, headB: ListNode | null): ListNode | null {
    let a = headA, b = headB
    while (a !== b) {
      a = a ? a.next : headB
      b = b ? b.next : headA
    }
    return a
  }
}
```

# 反转链表

[206. 反转链表](https://leetcode.cn/problems/reverse-linked-list/)

反转链表迭代三件套：`prev, cur, next`。写递归时要想清「子问题返回新头，当前 head 变成尾」。

复杂度：时间 O(n)，空间 O(1) 迭代

```typescript
class ListNode {
  val: number
  next: ListNode | null
  constructor(val?: number, next?: ListNode | null) {
    this.val = val === undefined ? 0 : val
    this.next = next === undefined ? null : next
  }
}
class Solution {
  reverseList(head: ListNode | null): ListNode | null {
    let prev: ListNode | null = null
    let cur = head
    while (cur) {
      const next = cur.next
      cur.next = prev
      prev = cur
      cur = next
    }
    return prev
  }
}
```

# 回文链表

[234. 回文链表](https://leetcode.cn/problems/palindrome-linked-list/)

回文链：慢指针走中点、反转后半、两端比较；空间 O(1)。比较完可再反转回去保持原结构。奇数长度时中点跳过即可。

复杂度：时间 O(n)，空间 O(1)

```typescript
class ListNode {
  val: number
  next: ListNode | null
  constructor(val?: number, next?: ListNode | null) {
    this.val = val === undefined ? 0 : val
    this.next = next === undefined ? null : next
  }
}
class Solution {
  isPalindrome(head: ListNode | null): boolean {
    if (!head || !head.next) return true
    let slow: ListNode | null = head, fast: ListNode | null = head
    while (fast.next && fast.next.next) {
      slow = slow!.next
      fast = fast.next.next
    }
    let prev: ListNode | null = null, cur = slow!.next
    while (cur) {
      const next = cur.next
      cur.next = prev
      prev = cur
      cur = next
    }
    let p1: ListNode | null = head, p2 = prev
    while (p2) {
      if (p1!.val !== p2.val) return false
      p1 = p1!.next
      p2 = p2.next
    }
    return true
  }
}
```

# 环形链表

[141. 环形链表](https://leetcode.cn/problems/linked-list-cycle/)

判环用快慢指针：快的一次两步、慢的一步，能相遇就有环；快指针走到 null 则无环。只问「有没有」用这题；要入口位置看 142。

复杂度：时间 O(n)，空间 O(1)

```typescript
class ListNode {
  val: number
  next: ListNode | null
  constructor(val?: number, next?: ListNode | null) {
    this.val = val === undefined ? 0 : val
    this.next = next === undefined ? null : next
  }
}
class Solution {
  hasCycle(head: ListNode | null): boolean {
    let slow = head, fast = head
    while (fast && fast.next) {
      slow = slow!.next
      fast = fast.next.next
      if (slow === fast) return true
    }
    return false
  }
}
```

# 合并两个有序链表

[21. 合并两个有序链表](https://leetcode.cn/problems/merge-two-sorted-lists/)

合并两条有序链：哑节点 + 尾指针，比较谁小接谁。递归版 `merge(l1,l2)` 也常写。这是 23、148 的零件。

复杂度：时间 O(m+n)，空间 O(1) 迭代

```typescript
class ListNode {
  val: number
  next: ListNode | null
  constructor(val?: number, next?: ListNode | null) {
    this.val = val === undefined ? 0 : val
    this.next = next === undefined ? null : next
  }
}
class Solution {
  mergeTwoLists(list1: ListNode | null, list2: ListNode | null): ListNode | null {
    const dummy = new ListNode(0)
    let cur = dummy
    while (list1 && list2) {
      if (list1.val <= list2.val) { cur.next = list1; list1 = list1.next }
      else { cur.next = list2; list2 = list2.next }
      cur = cur.next
    }
    cur.next = list1 ?? list2
    return dummy.next
  }
}
```

# 环形链表 II

[142. 环形链表 II](https://leetcode.cn/problems/linked-list-cycle-ii/)

先快慢相遇证明有环，再把一个指针移回起点同步走，再次相遇就是入口。推导记不住就先背结论，有空再补「相遇点到入口 = 起点到入口」。

复杂度：时间 O(n)，空间 O(1)

```typescript
class ListNode {
  val: number
  next: ListNode | null
  constructor(val?: number, next?: ListNode | null) {
    this.val = val === undefined ? 0 : val
    this.next = next === undefined ? null : next
  }
}
class Solution {
  detectCycle(head: ListNode | null): ListNode | null {
    let slow = head, fast = head
    while (fast && fast.next) {
      slow = slow!.next
      fast = fast.next.next
      if (slow === fast) {
        let p = head
        while (p !== slow) {
          p = p!.next
          slow = slow!.next
        }
        return p
      }
    }
    return null
  }
}
```

# 两数相加

[2. 两数相加](https://leetcode.cn/problems/add-two-numbers/)

链表存的是逆序个位，对齐相加带进位即可。循环条件是 `l1 || l2 || carry`，三者任一还在就要继续。别忘最后进位。

复杂度：时间 O(max(m,n))，空间 O(1) 额外

```typescript
class ListNode {
  val: number
  next: ListNode | null
  constructor(val?: number, next?: ListNode | null) {
    this.val = val === undefined ? 0 : val
    this.next = next === undefined ? null : next
  }
}
class Solution {
  addTwoNumbers(l1: ListNode | null, l2: ListNode | null): ListNode | null {
    const dummy = new ListNode(0)
    let cur = dummy, carry = 0
    while (l1 || l2 || carry) {
      const sum = (l1?.val ?? 0) + (l2?.val ?? 0) + carry
      carry = Math.floor(sum / 10)
      cur.next = new ListNode(sum % 10)
      cur = cur.next
      l1 = l1?.next ?? null
      l2 = l2?.next ?? null
    }
    return dummy.next
  }
}
```

# 删除链表的倒数第 N 个结点

[19. 删除链表的倒数第 N 个结点](https://leetcode.cn/problems/remove-nth-node-from-end-of-list/)

删倒数第 n：快指针先走 n 步，再快慢同步，慢停在待删前驱。哑节点让删头和删中间统一。注意 n 等于链长时正好删头。

复杂度：时间 O(L)，空间 O(1)

```typescript
class ListNode {
  val: number
  next: ListNode | null
  constructor(val?: number, next?: ListNode | null) {
    this.val = val === undefined ? 0 : val
    this.next = next === undefined ? null : next
  }
}
class Solution {
  removeNthFromEnd(head: ListNode | null, n: number): ListNode | null {
    const dummy = new ListNode(0, head)
    let fast: ListNode | null = dummy, slow: ListNode | null = dummy
    for (let i = 0; i < n; i++) fast = fast!.next
    while (fast!.next) { fast = fast!.next; slow = slow!.next }
    slow!.next = slow!.next!.next
    return dummy.next
  }
}
```

# 两两交换链表中的节点

[24. 两两交换链表中的节点](https://leetcode.cn/problems/swap-nodes-in-pairs/)

两两交换要画图：哑节点接住，`a=prev.next, b=a.next`，然后 `prev.next=b; a.next=b.next; b.next=a`，再把 prev 挪到 a。丢一次指针就整段断链。

复杂度：时间 O(n)，空间 O(1)

```typescript
class ListNode {
  val: number
  next: ListNode | null
  constructor(val?: number, next?: ListNode | null) {
    this.val = val === undefined ? 0 : val
    this.next = next === undefined ? null : next
  }
}
class Solution {
  swapPairs(head: ListNode | null): ListNode | null {
    const dummy = new ListNode(0, head)
    let prev = dummy
    while (prev.next && prev.next.next) {
      const a = prev.next
      const b = a.next!
      a.next = b.next
      b.next = a
      prev.next = b
      prev = a
    }
    return dummy.next
  }
}
```

# K 个一组翻转链表

[25. K 个一组翻转链表](https://leetcode.cn/problems/reverse-nodes-in-k-group/)

K 个一组反转：先数一下后面够不够 k 个，不够就原样返回；够就反转这一段，再递归/迭代处理后续，最后把段与段接起来。段头段尾四个指针建议命名清楚。

复杂度：时间 O(n)，空间 O(1)

```typescript
class ListNode {
  val: number
  next: ListNode | null
  constructor(val?: number, next?: ListNode | null) {
    this.val = val === undefined ? 0 : val
    this.next = next === undefined ? null : next
  }
}
class Solution {
  reverseKGroup(head: ListNode | null, k: number): ListNode | null {
    const dummy = new ListNode(0, head)
    let groupPrev = dummy
    while (true) {
      let kth: ListNode | null = groupPrev
      for (let i = 0; i < k && kth; i++) kth = kth.next
      if (!kth) break
      const groupNext = kth.next
      let prev = groupNext
      let cur = groupPrev.next
      while (cur !== groupNext) {
        const next = cur!.next
        cur!.next = prev
        prev = cur
        cur = next
      }
      const newGroupEnd = groupPrev.next!
      groupPrev.next = kth
      groupPrev = newGroupEnd
    }
    return dummy.next
  }
}
```

# 随机链表的复制

[138. 随机链表的复制](https://leetcode.cn/problems/copy-list-with-random-pointer/)

带 random 的拷贝：最省事是 HashMap 旧→新，第一遍建节点，第二遍连 next/random。进阶 O(1) 空间：把新节点插在旧节点后面，复制 random，再拆分两链。

复杂度：哈希 O(n) 空间；交错法 O(1) 额外

```typescript
class Node {
  val: number
  next: Node | null
  random: Node | null
  constructor(val?: number, next?: Node | null, random?: Node | null) {
    this.val = val === undefined ? 0 : val
    this.next = next === undefined ? null : next
    this.random = random === undefined ? null : random
  }
}
class Solution {
  copyRandomList(head: Node | null): Node | null {
    if (!head) return null
    const map = new Map<Node, Node>()
    let cur: Node | null = head
    while (cur) { map.set(cur, new Node(cur.val)); cur = cur.next }
    cur = head
    while (cur) {
      const copy = map.get(cur)!
      copy.next = cur.next ? map.get(cur.next)! : null
      copy.random = cur.random ? map.get(cur.random)! : null
      cur = cur.next
    }
    return map.get(head)!
  }
}
```

# 排序链表

[148. 排序链表](https://leetcode.cn/problems/sort-list/)

链表排序用归并最合适：快慢指针拆半（注意断开 mid 前驱），两边递归排序，再按 21 的方式合并。相对堆排序更贴链表结构，相对快排不用随机访问。

复杂度：时间 O(n log n)，空间 O(log n) 递归栈

```typescript
class ListNode {
  val: number
  next: ListNode | null
  constructor(val?: number, next?: ListNode | null) {
    this.val = val === undefined ? 0 : val
    this.next = next === undefined ? null : next
  }
}
class Solution {
  sortList(head: ListNode | null): ListNode | null {
    if (!head || !head.next) return head
    let slow: ListNode | null = head, fast: ListNode | null = head.next
    while (fast && fast.next) { slow = slow!.next; fast = fast.next.next }
    const mid = slow!.next
    slow!.next = null
    return this.merge(this.sortList(head), this.sortList(mid))
  }
  private merge(a: ListNode | null, b: ListNode | null): ListNode | null {
    const dummy = new ListNode(0)
    let cur = dummy
    while (a && b) {
      if (a.val <= b.val) { cur.next = a; a = a.next }
      else { cur.next = b; b = b.next }
      cur = cur.next
    }
    cur.next = a ?? b
    return dummy.next
  }
}
```

# 合并 K 个升序链表

[23. 合并 K 个升序链表](https://leetcode.cn/problems/merge-k-sorted-lists/)

K 路归并：小根堆（优先队列）每次弹出最小的头节点，若它还有 next 就再丢进堆。分治两两合并也行，代码量和 21 合并两条链一脉相承。

复杂度：时间 O(N log k)，空间 O(k)

```typescript
class ListNode {
  val: number
  next: ListNode | null
  constructor(val?: number, next?: ListNode | null) {
    this.val = val === undefined ? 0 : val
    this.next = next === undefined ? null : next
  }
}
class Solution {
  mergeKLists(lists: Array<ListNode | null>): ListNode | null {
    if (!lists.length) return null
    const mergeTwo = (a: ListNode | null, b: ListNode | null): ListNode | null => {
      const dummy = new ListNode(0)
      let cur = dummy
      while (a && b) {
        if (a.val <= b.val) { cur.next = a; a = a.next }
        else { cur.next = b; b = b.next }
        cur = cur.next
      }
      cur.next = a ?? b
      return dummy.next
    }
    const merge = (l: number, r: number): ListNode | null => {
      if (l === r) return lists[l]
      if (l > r) return null
      const mid = (l + r) >> 1
      return mergeTwo(merge(l, mid), merge(mid + 1, r))
    }
    return merge(0, lists.length - 1)
  }
}
```

# LRU 缓存

[146. LRU 缓存](https://leetcode.cn/problems/lru-cache/)

LRU：哈希表 O(1) 查节点，双向链表 O(1) 挪到头部/删尾。get 命中要刷新到最新；put 更新已有 key 也要挪动；超容量删链表尾并删哈希项。边界是容量为 1、反复 put 同一 key。

复杂度：各操作 O(1)

```typescript
class DLinkedNode {
  key: number
  val: number
  prev: DLinkedNode | null = null
  next: DLinkedNode | null = null
  constructor(key = 0, val = 0) { this.key = key; this.val = val }
}
class LRUCache {
  private capacity: number
  private map = new Map<number, DLinkedNode>()
  private head = new DLinkedNode()
  private tail = new DLinkedNode()
  constructor(capacity: number) {
    this.capacity = capacity
    this.head.next = this.tail
    this.tail.prev = this.head
  }
  get(key: number): number {
    const node = this.map.get(key)
    if (!node) return -1
    this.moveToHead(node)
    return node.val
  }
  put(key: number, value: number): void {
    let node = this.map.get(key)
    if (node) { node.val = value; this.moveToHead(node); return }
    node = new DLinkedNode(key, value)
    this.map.set(key, node)
    this.addToHead(node)
    if (this.map.size > this.capacity) {
      const removed = this.removeTail()
      this.map.delete(removed.key)
    }
  }
  private addToHead(node: DLinkedNode) {
    node.prev = this.head
    node.next = this.head.next
    this.head.next!.prev = node
    this.head.next = node
  }
  private removeNode(node: DLinkedNode) {
    node.prev!.next = node.next
    node.next!.prev = node.prev
  }
  private moveToHead(node: DLinkedNode) {
    this.removeNode(node)
    this.addToHead(node)
  }
  private removeTail(): DLinkedNode {
    const node = this.tail.prev!
    this.removeNode(node)
    return node
  }
}
```

# 旋转链表

[61. 旋转链表](https://leetcode.cn/problems/rotate-list/)

旋转链表 k 步：先走一遍得到长度并连成环，再在断点 `len - k%len` 处断开。k 可能很大，一定先取模。

复杂度：时间 O(n)，空间 O(1)

```typescript
class ListNode {
  val: number
  next: ListNode | null
  constructor(val?: number, next?: ListNode | null) {
    this.val = val === undefined ? 0 : val
    this.next = next === undefined ? null : next
  }
}
class Solution {
  rotateRight(head: ListNode | null, k: number): ListNode | null {
    if (!head || !head.next || k === 0) return head
    let len = 1, tail = head
    while (tail.next) { tail = tail.next; len++ }
    k %= len
    if (k === 0) return head
    tail.next = head
    let steps = len - k
    let newTail = head
    for (let i = 1; i < steps; i++) newTail = newTail.next!
    const newHead = newTail.next
    newTail.next = null
    return newHead
  }
}
```

# 删除排序链表中的重复元素 II

[82. 删除排序链表中的重复元素 II](https://leetcode.cn/problems/remove-duplicates-from-sorted-list-ii/)

有序链删除所有重复值（一个不留）：哑节点，观察 `cur.next` 与 `cur.next.next`，相同则记下 val 一路跳过。和 83「留一个」别混。

复杂度：时间 O(n)，空间 O(1)

```typescript
class ListNode {
  val: number
  next: ListNode | null
  constructor(val?: number, next?: ListNode | null) {
    this.val = val === undefined ? 0 : val
    this.next = next === undefined ? null : next
  }
}
class Solution {
  deleteDuplicates(head: ListNode | null): ListNode | null {
    const dummy = new ListNode(0, head)
    let prev = dummy
    while (prev.next) {
      let cur = prev.next
      if (cur.next && cur.val === cur.next.val) {
        const v = cur.val
        while (cur && cur.val === v) cur = cur.next
        prev.next = cur
      } else {
        prev = prev.next
      }
    }
    return dummy.next
  }
}
```

# 删除排序链表中的重复元素

[83. 删除排序链表中的重复元素](https://leetcode.cn/problems/remove-duplicates-from-sorted-list/)

有序去重留一个：`cur.val==cur.next.val` 就跳过 next。指针一个就够，旧笔记变量太多纯属自己吓自己。

复杂度：时间 O(n)，空间 O(1)

```typescript
class ListNode {
  val: number
  next: ListNode | null
  constructor(val?: number, next?: ListNode | null) {
    this.val = val === undefined ? 0 : val
    this.next = next === undefined ? null : next
  }
}
class Solution {
  deleteDuplicates(head: ListNode | null): ListNode | null {
    let cur = head
    while (cur && cur.next) {
      if (cur.val === cur.next.val) cur.next = cur.next.next
      else cur = cur.next
    }
    return head
  }
}
```

# 反转链表 II

[92. 反转链表 II](https://leetcode.cn/problems/reverse-linked-list-ii/)

区间反转：走到 left 的前驱，然后对后面 right-left+1 个节点做头插法，最后接回 right 之后的部分。left=1 时靠哑节点统一。

复杂度：时间 O(n)，空间 O(1)

```typescript
class ListNode {
  val: number
  next: ListNode | null
  constructor(val?: number, next?: ListNode | null) {
    this.val = val === undefined ? 0 : val
    this.next = next === undefined ? null : next
  }
}
class Solution {
  reverseBetween(head: ListNode | null, left: number, right: number): ListNode | null {
    const dummy = new ListNode(0, head)
    let pre = dummy
    for (let i = 0; i < left - 1; i++) pre = pre.next!
    const start = pre.next!
    let cur = start.next
    for (let i = 0; i < right - left; i++) {
      start.next = cur!.next
      cur!.next = pre.next
      pre.next = cur
      cur = start.next
    }
    return dummy.next
  }
}
```

# 有序链表转换二叉搜索树

[109. 有序链表转换二叉搜索树](https://leetcode.cn/problems/convert-sorted-list-to-binary-search-tree/)

有序链转平衡 BST：快慢找中点做根，断开左半再递归。注意把 mid 前驱的 next 置空，不然链表还连着。

复杂度：时间 O(n log n) 或配合中序 O(n)，空间 O(log n)

```typescript
class ListNode {
  val: number
  next: ListNode | null
  constructor(val?: number, next?: ListNode | null) {
    this.val = val === undefined ? 0 : val
    this.next = next === undefined ? null : next
  }
}
class TreeNode {
  val: number
  left: TreeNode | null
  right: TreeNode | null
  constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null) {
    this.val = val === undefined ? 0 : val
    this.left = left === undefined ? null : left
    this.right = right === undefined ? null : right
  }
}
class Solution {
  sortedListToBST(head: ListNode | null): TreeNode | null {
    if (!head) return null
    if (!head.next) return new TreeNode(head.val)
    let slow = head, fast = head, prev: ListNode | null = null
    while (fast && fast.next) {
      prev = slow
      slow = slow!.next!
      fast = fast.next.next
    }
    prev!.next = null
    const root = new TreeNode(slow!.val)
    root.left = this.sortedListToBST(head)
    root.right = this.sortedListToBST(slow!.next)
    return root
  }
}
```
