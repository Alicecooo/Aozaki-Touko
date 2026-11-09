---
title: "二叉树题解"
tab_title: "Binary Tree Solutions"
date: "2026-11-10T00:41:54+08:00"
draft: false
topics: ["algorithms"]
tags: ["二叉树", "递归"]
summary: "二叉树遍历、搜索树、路径与构造问题的题解。"
---

# 二叉树的中序遍历

[94. 二叉树的中序遍历](https://leetcode.cn/problems/binary-tree-inorder-traversal/)

中序是左-根-右，BST 里中序正好是升序，后面验证 BST、第 K 小都靠它。递归三行写完；面试常追问迭代：一路把左孩子压栈，弹出来访问，再转向右子树，等价地模拟了递归过程。

复杂度：时间 O(n)，空间 O(h)

```typescript
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
  inorderTraversal(root: TreeNode | null): number[] {
    const ans: number[] = []
    const dfs = (node: TreeNode | null) => {
      if (!node) return
      dfs(node.left)
      ans.push(node.val)
      dfs(node.right)
    }
    dfs(root)
    return ans
  }
}
```

# 二叉树的最大深度

[104. 二叉树的最大深度](https://leetcode.cn/problems/maximum-depth-of-binary-tree/)

树的高度/深度：空节点算 0，否则 `1 + max(左, 右)`。这是后面直径、平衡树的底座。也可以 BFS 数层数，层序结束时的层数即最大深度。

复杂度：时间 O(n)，空间 O(h)

```typescript
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
  maxDepth(root: TreeNode | null): number {
    if (!root) return 0
    return Math.max(this.maxDepth(root.left), this.maxDepth(root.right)) + 1
  }
}
```

# 翻转二叉树

[226. 翻转二叉树](https://leetcode.cn/problems/invert-binary-tree/)

翻转就是交换每个节点的左右孩子，再递归处理两边（后序、前序都行）。也可以 BFS 一层层交换。和镜像判断（101）是一对：一个改树，一个只比。

复杂度：时间 O(n)，空间 O(h)

```typescript
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
  invertTree(root: TreeNode | null): TreeNode | null {
    if (!root) return null
    ;[root.left, root.right] = [root.right, root.left]
    this.invertTree(root.left)
    this.invertTree(root.right)
    return root
  }
}
```

# 对称二叉树

[101. 对称二叉树](https://leetcode.cn/problems/symmetric-tree/)

对称不是「左右值相等」就完了，而是整棵树互为镜像：左子树的左对右子树的右，左子树的右对右子树的左。写成递归函数 `mirror(a,b)`，或队列里成对塞节点。

复杂度：时间 O(n)，空间 O(h)

```typescript
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
  isSymmetric(root: TreeNode | null): boolean {
    const check = (a: TreeNode | null, b: TreeNode | null): boolean => {
      if (!a && !b) return true
      if (!a || !b || a.val !== b.val) return false
      return check(a.left, b.right) && check(a.right, b.left)
    }
    return check(root, root)
  }
}
```

# 二叉树的直径

[543. 二叉树的直径](https://leetcode.cn/problems/diameter-of-binary-tree/)

直径不一定过根：对每个节点，经它的最长路径是「左深度 + 右深度」，全局取 max；函数本身返回的是深度给父节点用。第一次写很容易只算了根上的那条。

复杂度：时间 O(n)，空间 O(h)

```typescript
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
  diameterOfBinaryTree(root: TreeNode | null): number {
    let ans = 0
    const depth = (node: TreeNode | null): number => {
      if (!node) return 0
      const L = depth(node.left), R = depth(node.right)
      ans = Math.max(ans, L + R)
      return Math.max(L, R) + 1
    }
    depth(root)
    return ans
  }
}
```

# 二叉树的层序遍历

[102. 二叉树的层序遍历](https://leetcode.cn/problems/binary-tree-level-order-traversal/)

层序用队列：开始把根入队，每一层先记下当前队列长度 size，只弹出这么多个，组成这一层的数组。size 这一招后面锯齿、右视图都会用到。

复杂度：时间 O(n)，空间 O(n)

```typescript
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
  levelOrder(root: TreeNode | null): number[][] {
    if (!root) return []
    const ans: number[][] = []
    const q: TreeNode[] = [root]
    while (q.length) {
      const size = q.length
      const level: number[] = []
      for (let i = 0; i < size; i++) {
        const node = q.shift()!
        level.push(node.val)
        if (node.left) q.push(node.left)
        if (node.right) q.push(node.right)
      }
      ans.push(level)
    }
    return ans
  }
}
```

# 将有序数组转换为二叉搜索树

[108. 将有序数组转换为二叉搜索树](https://leetcode.cn/problems/convert-sorted-array-to-binary-search-tree/)

有序数组建平衡 BST：每次取中点当根，左半建左子树、右半建右子树。中点选择保证左右高度差不多，和「有序链表转 BST」是同一思路。

复杂度：时间 O(n)，空间 O(log n)

```typescript
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
  sortedArrayToBST(nums: number[]): TreeNode | null {
    const build = (l: number, r: number): TreeNode | null => {
      if (l > r) return null
      const mid = (l + r) >> 1
      return new TreeNode(nums[mid], build(l, mid - 1), build(mid + 1, r))
    }
    return build(0, nums.length - 1)
  }
}
```

# 验证二叉搜索树

[98. 验证二叉搜索树](https://leetcode.cn/problems/validate-binary-search-tree/)

验证 BST 不能只看「左 < 根 < 右」这一层——左子树里所有值都得 < 根。递归时把允许的开区间 (low, high) 传下去；或者中序遍历检查严格递增。

复杂度：时间 O(n)，空间 O(h)

```typescript
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
  isValidBST(root: TreeNode | null): boolean {
    const dfs = (node: TreeNode | null, lo: number, hi: number): boolean => {
      if (!node) return true
      if (node.val <= lo || node.val >= hi) return false
      return dfs(node.left, lo, node.val) && dfs(node.right, node.val, hi)
    }
    return dfs(root, -Infinity, Infinity)
  }
}
```

# 二叉搜索树中第 K 小的元素

[230. 二叉搜索树中第 K 小的元素](https://leetcode.cn/problems/kth-smallest-element-in-a-bst/)

BST 中序是升序，走到第 k 个停下就是答案。迭代栈版可以精确控制早停；Morris 能做到 O(1) 额外空间，一般写栈就够。

复杂度：时间 O(h+k)，空间 O(h)

```typescript
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
  kthSmallest(root: TreeNode | null, k: number): number {
    let ans = 0
    const dfs = (node: TreeNode | null) => {
      if (!node || k === 0) return
      dfs(node.left)
      if (--k === 0) { ans = node.val; return }
      dfs(node.right)
    }
    dfs(root)
    return ans
  }
}
```

# 二叉树的右视图

[199. 二叉树的右视图](https://leetcode.cn/problems/binary-tree-right-side-view/)

右视图是「每一层最右边那个」。层序时取每层最后一个；DFS 的话先走右再走左，并记录「这个深度是不是第一次碰到」。

复杂度：时间 O(n)，空间 O(n)

```typescript
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
  rightSideView(root: TreeNode | null): number[] {
    const ans: number[] = []
    const dfs = (node: TreeNode | null, depth: number) => {
      if (!node) return
      if (depth === ans.length) ans.push(node.val)
      dfs(node.right, depth + 1)
      dfs(node.left, depth + 1)
    }
    dfs(root, 0)
    return ans
  }
}
```

# 二叉树展开为链表

[114. 二叉树展开为链表](https://leetcode.cn/problems/flatten-binary-tree-to-linked-list/)

展开成先序链表（右指针当 next）。一种写法：先 flatten 左右，把左子树接到根的右边，原右子树接到左子树末尾，再清空 left。改指针时画图不容易丢。

复杂度：时间 O(n)，空间 O(h)

```typescript
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
  flatten(root: TreeNode | null): void {
    if (!root) return
    this.flatten(root.left)
    this.flatten(root.right)
    const left = root.left, right = root.right
    root.left = null
    root.right = left
    let cur = root
    while (cur.right) cur = cur.right
    cur.right = right
  }
}
```

# 从前序与中序遍历序列构造二叉树

[105. 从前序与中序遍历序列构造二叉树](https://leetcode.cn/problems/construct-binary-tree-from-preorder-and-inorder-traversal/)

前序第一个是根，中序里找到根就能切开左右子树，前序也按同样大小切开继续递归。哈希表存中序值→下标，避免每次线性找。

复杂度：时间 O(n)，空间 O(n)

```typescript
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
  buildTree(preorder: number[], inorder: number[]): TreeNode | null {
    const idx = new Map(inorder.map((v, i) => [v, i]))
    const build = (pl: number, pr: number, il: number, ir: number): TreeNode | null => {
      if (pl > pr) return null
      const rootVal = preorder[pl]
      const k = idx.get(rootVal)!
      const leftLen = k - il
      return new TreeNode(
        rootVal,
        build(pl + 1, pl + leftLen, il, k - 1),
        build(pl + leftLen + 1, pr, k + 1, ir),
      )
    }
    return build(0, preorder.length - 1, 0, inorder.length - 1)
  }
}
```

# 路径总和 III

[437. 路径总和 III](https://leetcode.cn/problems/path-sum-iii/)

路径不必从根开始、不必到叶子。前缀和 + 哈希：记录根到当前的前缀和次数，查有多少前缀等于 `curSum - target`；回溯返回时把当前前缀次数减掉，避免串到另一支。

复杂度：时间 O(n)，空间 O(n) 前缀法

```typescript
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
  pathSum(root: TreeNode | null, targetSum: number): number {
    const map = new Map<number, number>([[0, 1]])
    let ans = 0
    const dfs = (node: TreeNode | null, cur: number) => {
      if (!node) return
      cur += node.val
      ans += map.get(cur - targetSum) ?? 0
      map.set(cur, (map.get(cur) ?? 0) + 1)
      dfs(node.left, cur)
      dfs(node.right, cur)
      map.set(cur, map.get(cur)! - 1)
    }
    dfs(root, 0)
    return ans
  }
}
```

# 二叉树的最近公共祖先

[236. 二叉树的最近公共祖先](https://leetcode.cn/problems/lowest-common-ancestor-of-a-binary-tree/)

LCA：递归左右，若当前节点是 p 或 q 或空就返回；左右都找到说明当前就是分叉点；只在一侧找到就返回那一侧。不用先存父指针。

复杂度：时间 O(n)，空间 O(h)

```typescript
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
  lowestCommonAncestor(root: TreeNode | null, p: TreeNode | null, q: TreeNode | null): TreeNode | null {
    if (!root || root === p || root === q) return root
    const L = this.lowestCommonAncestor(root.left, p, q)
    const R = this.lowestCommonAncestor(root.right, p, q)
    if (L && R) return root
    return L ?? R
  }
}
```

# 二叉树中的最大路径和

[124. 二叉树中的最大路径和](https://leetcode.cn/problems/binary-tree-maximum-path-sum/)

任意路径最大和（可两端伸）。递归返回「只能单边延伸的贡献」= 节点值 + max(0, 左贡献, 右贡献)；同时用「节点 + 左 + 右」更新全局答案。负贡献直接砍掉，不然越加越小。

复杂度：时间 O(n)，空间 O(h)

```typescript
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
  maxPathSum(root: TreeNode | null): number {
    let ans = -Infinity
    const gain = (node: TreeNode | null): number => {
      if (!node) return 0
      const L = Math.max(0, gain(node.left))
      const R = Math.max(0, gain(node.right))
      ans = Math.max(ans, node.val + L + R)
      return node.val + Math.max(L, R)
    }
    gain(root)
    return ans
  }
}
```

# 不同的二叉搜索树

[96. 不同的二叉搜索树](https://leetcode.cn/problems/unique-binary-search-trees/)

互不相同的 BST 个数是卡特兰数：枚举根 i，左 1..i-1、右 i+1..n，方案数相乘再求和。DP 数组从小到大填即可，和生成所有 BST 那题同源。

复杂度：时间 O(n²)，空间 O(n)

```typescript
class Solution {
  numTrees(n: number): number {
    const dp = new Array(n + 1).fill(0)
    dp[0] = dp[1] = 1
    for (let i = 2; i <= n; i++) {
      for (let j = 1; j <= i; j++) dp[i] += dp[j - 1] * dp[i - j]
    }
    return dp[n]
  }
}
```

# 相同的树

[100. 相同的树](https://leetcode.cn/problems/same-tree/)

两棵树相同：都空为真，一个空一个不空为假，根值相等且左右分别相同。写的时候别漏「结构也要一样」。

复杂度：时间 O(n)，空间 O(h)

```typescript
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
  isSameTree(p: TreeNode | null, q: TreeNode | null): boolean {
    if (!p && !q) return true
    if (!p || !q || p.val !== q.val) return false
    return this.isSameTree(p.left, q.left) && this.isSameTree(p.right, q.right)
  }
}
```

# 二叉树的锯齿形层序遍历

[103. 二叉树的锯齿形层序遍历](https://leetcode.cn/problems/binary-tree-zigzag-level-order-traversal/)

锯齿层序：在 102 的基础上，奇数层把这一层 reverse，或用双端队列一端进一端出切换方向。旧笔记说「新三年旧三年」——100/101/102 的代码改到现在。

复杂度：时间 O(n)，空间 O(n)

```typescript
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
  zigzagLevelOrder(root: TreeNode | null): number[][] {
    if (!root) return []
    const ans: number[][] = []
    const q: TreeNode[] = [root]
    let left = true
    while (q.length) {
      const size = q.length, level: number[] = []
      for (let i = 0; i < size; i++) {
        const node = q.shift()!
        level.push(node.val)
        if (node.left) q.push(node.left)
        if (node.right) q.push(node.right)
      }
      ans.push(left ? level : level.reverse())
      left = !left
    }
    return ans
  }
}
```

# 从中序与后序遍历序列构造二叉树

[106. 从中序与后序遍历序列构造二叉树](https://leetcode.cn/problems/construct-binary-tree-from-inorder-and-postorder-traversal/)

后序最后一个是根，中序里根把左右切开；后序序列也要按左子树大小切开再递归。和 105 对称，别把区间算错。用哈希存中序下标会快很多。

复杂度：时间 O(n)，空间 O(n)

```typescript
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
  buildTree(inorder: number[], postorder: number[]): TreeNode | null {
    const idx = new Map(inorder.map((v, i) => [v, i]))
    const build = (il: number, ir: number, pl: number, pr: number): TreeNode | null => {
      if (il > ir) return null
      const root = new TreeNode(postorder[pr])
      const k = idx.get(root.val)!
      const leftSize = k - il
      root.left = build(il, k - 1, pl, pl + leftSize - 1)
      root.right = build(k + 1, ir, pl + leftSize, pr - 1)
      return root
    }
    return build(0, inorder.length - 1, 0, postorder.length - 1)
  }
}
```

# 二叉树的层序遍历 II

[107. 二叉树的层序遍历 II](https://leetcode.cn/problems/binary-tree-level-order-traversal-ii/)

自底向上的层序：先正常 BFS 得到从上到下的结果，最后 `reverse` 一下最省事；也可以每层往结果链表头插。

复杂度：时间 O(n)，空间 O(n)

```typescript
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
  levelOrderBottom(root: TreeNode | null): number[][] {
    if (!root) return []
    const ans: number[][] = []
    const q: TreeNode[] = [root]
    while (q.length) {
      const size = q.length, level: number[] = []
      for (let i = 0; i < size; i++) {
        const node = q.shift()!
        level.push(node.val)
        if (node.left) q.push(node.left)
        if (node.right) q.push(node.right)
      }
      ans.push(level)
    }
    return ans.reverse()
  }
}
```

# 平衡二叉树

[110. 平衡二叉树](https://leetcode.cn/problems/balanced-binary-tree/)

平衡：任意节点左右高度差 ≤1。后序一次返回高度，若发现不平衡返回 -1 向上传播，避免每个节点再暴力算深。旧笔记懒得优化也能过，正式写还是一次遍历干净。

复杂度：时间 O(n)，空间 O(h)

```typescript
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
  isBalanced(root: TreeNode | null): boolean {
    const height = (node: TreeNode | null): number => {
      if (!node) return 0
      const lh = height(node.left)
      if (lh < 0) return -1
      const rh = height(node.right)
      if (rh < 0 || Math.abs(lh - rh) > 1) return -1
      return Math.max(lh, rh) + 1
    }
    return height(root) >= 0
  }
}
```

# 二叉树的最小深度

[111. 二叉树的最小深度](https://leetcode.cn/problems/minimum-depth-of-binary-tree/)

最小深度要到叶子。只有左或只有右时，必须走有孩子的那边，不能对空孩子取 min 得到 1。BFS 遇到第一个叶子返回层数最贴「最短」含义。

复杂度：时间 O(n)，空间 O(h)

```typescript
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
  minDepth(root: TreeNode | null): number {
    if (!root) return 0
    const q: [TreeNode, number][] = [[root, 1]]
    while (q.length) {
      const [node, d] = q.shift()!
      if (!node.left && !node.right) return d
      if (node.left) q.push([node.left, d + 1])
      if (node.right) q.push([node.right, d + 1])
    }
    return 0
  }
}
```

# 路径总和

[112. 路径总和](https://leetcode.cn/problems/path-sum/)

从根往下减 `targetSum`，到叶子（左右皆空）时看剩余是不是 0。注意：只有一边孩子的节点不是叶子，别在那儿误判。

复杂度：时间 O(n)，空间 O(h)

```typescript
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
  hasPathSum(root: TreeNode | null, targetSum: number): boolean {
    if (!root) return false
    if (!root.left && !root.right) return root.val === targetSum
    const next = targetSum - root.val
    return this.hasPathSum(root.left, next) || this.hasPathSum(root.right, next)
  }
}
```

# 路径总和 II

[113. 路径总和 II](https://leetcode.cn/problems/path-sum-ii/)

在 112 基础上多一条路径回溯：推进时 push，到合法叶子就拷贝一份进答案，返回前 pop。记得拷贝，不然后面会被改掉。

复杂度：时间 O(n²) 最坏拷贝，空间 O(h)

```typescript
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
  pathSum(root: TreeNode | null, targetSum: number): number[][] {
    const ans: number[][] = [], path: number[] = []
    const dfs = (node: TreeNode | null, remain: number) => {
      if (!node) return
      path.push(node.val)
      if (!node.left && !node.right && remain === node.val) ans.push([...path])
      dfs(node.left, remain - node.val)
      dfs(node.right, remain - node.val)
      path.pop()
    }
    dfs(root, targetSum)
    return ans
  }
}
```

# 填充每个节点的下一个右侧节点指针

[116. 填充每个节点的下一个右侧节点指针](https://leetcode.cn/problems/populating-next-right-pointers-in-each-node/)

完美二叉树填 next。可用层序；更好是 O(1) 空间：利用上一层已经串好的 next，把 `left.next=right`，`right.next=父.next.left`。旧笔记提过完美二叉树结束条件更好写。

复杂度：时间 O(n)，空间 O(1) 用 next 指针法

```typescript
class Node {
  val: number
  left: Node | null
  right: Node | null
  next: Node | null
  constructor(val?: number, left?: Node | null, right?: Node | null, next?: Node | null) {
    this.val = val === undefined ? 0 : val
    this.left = left === undefined ? null : left
    this.right = right === undefined ? null : right
    this.next = next === undefined ? null : next
  }
}
class Solution {
  connect(root: Node | null): Node | null {
    if (!root) return null
    let leftmost: Node | null = root
    while (leftmost!.left) {
      let head: Node | null = leftmost
      while (head) {
        head.left!.next = head.right
        if (head.next) head.right!.next = head.next.left
        head = head.next
      }
      leftmost = leftmost!.left
    }
    return root
  }
}
```

# 填充每个节点的下一个右侧节点指针 II

[117. 填充每个节点的下一个右侧节点指针 II](https://leetcode.cn/problems/populating-next-right-pointers-in-each-node-ii/)

非完美版：下一层可能缺左或右孩子。用当前层的 next 遍历，另开哑节点串起下一层真实存在的孩子，一层层推进。

复杂度：时间 O(n)，空间 O(1)

```typescript
class Node {
  val: number
  left: Node | null
  right: Node | null
  next: Node | null
  constructor(val?: number, left?: Node | null, right?: Node | null, next?: Node | null) {
    this.val = val === undefined ? 0 : val
    this.left = left === undefined ? null : left
    this.right = right === undefined ? null : right
    this.next = next === undefined ? null : next
  }
}
class Solution {
  connect(root: Node | null): Node | null {
    let cur = root
    while (cur) {
      const dummy = new Node(0)
      let tail: Node = dummy
      while (cur) {
        if (cur.left) { tail.next = cur.left; tail = tail.next }
        if (cur.right) { tail.next = cur.right; tail = tail.next }
        cur = cur.next
      }
      cur = dummy.next
    }
    return root
  }
}
```

# 找树左下角的值

[513. 找树左下角的值](https://leetcode.cn/problems/find-bottom-left-tree-value/)

找最底层最左边的值。层序从右往左入队，最后一个弹出的就是；或 DFS 带深度，深度刷新时更新答案（先左后右）。

复杂度：时间 O(n)，空间 O(n)

```typescript
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
  findBottomLeftValue(root: TreeNode | null): number {
    const q: TreeNode[] = [root!]
    let ans = root!.val
    while (q.length) {
      const size = q.length
      ans = q[0].val
      for (let i = 0; i < size; i++) {
        const node = q.shift()!
        if (node.left) q.push(node.left)
        if (node.right) q.push(node.right)
      }
    }
    return ans
  }
}
```
