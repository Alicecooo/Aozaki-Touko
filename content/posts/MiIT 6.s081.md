---
title: "MIT 6.s081 2025 Fall 实验记录"
date: 2025-10-26T23:47:00+08:00 
tags: ["OS"]                  
draft: false                      
categories: ["操作系统"]          # 可选：补充分类（也可留空）
summary: "MIT 6.s081 2025秋季操作系统实验记录"  
---

# 环境配置

- 我的环境是虚拟机，ubuntu系统25.10版本
- 虚拟机和 ubuntu 系统可以看下面
-  [实验第1周：Linux基本操作 - 飞书云文档](https://ycnw11in464y.feishu.cn/docx/AIuBdWKgsoFYngxZAwJchzc7npf)

- 具体流程是安装虚拟机，根据课程页表的tools页面，输入前面

```Plain
sudo apt-get install git build-essential gdb-multiarch qemu-system-misc gcc-riscv64-linux-gnu binutils-riscv64-linux-gnu 
```

- 然后git仓库，cd 文件 make qemu
- 
- 这是可能会卡住不动，可能需要补充一下
```Bash
 sudo apt install gcc-riscv64-unknown-elf-gcc
```

# Lab 1  Utilities 
## Sleep
- 十分简单的一个实验，提醒的就是关于测试环境的运行，不要在 make qemu 中运行，是在 git 下来那个仓库中运行。
- 关于 qemu 的退出，注意是先同时按下 Ctrl + A ，然后松开，按下 X。

## Sixfive
- 需要先根据给 kernel 和 User 中的一些文件（比如 stat  fstat），先学会如何打开和读写文件。（得看之前在sleep 中提示的一些文件）
- 记得看看他们 include 的文件，可以跳转看看，你会得到一些帮助（AI 很有用）
- 网络上也可以查找一些有关读写文件的函数，他们也很有用。
- Sixfive 的简单来说是从-\r\t\n./这些字符中提取数字。
- 你可以使用一个缓冲区存储数字（如果它不是字符的话），逐步遍历从文件中读取的内容（数字的拼凑涉及一些智力游戏）

##  Memdump

- 关于 %d  %c （或者更多）与 printf 相关的内容，或许你可以问问 AI ，他会给你更多内容，大概会得到想要的。
- 需要注意的是，给你的内容不一定需要完全照搬，可能你需要一些调整（比如，你看看他给的 uint 定义）
- 注意 char * data 的相关用法，你可以一些简单的方法得到其中的数据并解析出来。

## Find 
- 注意他给你的关于要读东西提示，大概率能获得一些东西。
- 利用好 User 中的一些函数，他们会给出帮助。
- 如果你完成了Sixfive ，你会有一些想法。
- 想想递归的操作，想想如何用读出来的文件名字拼凑一个文件目录（ai 可以给出一些想法）
- 不要忘记字符串的结尾'\0'，它值得注意和判断。

## Exec
- 如果你完成了上述内容，相信你从命令行中读取参数已经是得心应手，你在 find 只需要另加一个函数拆分它们而已，提取你需要的那一部分而已。
- 注意 Fork 与 Exec 与 Wait 的用法

## 碎碎念
- 周末周日两天写完 Lab 1 ，用时 4+3+4 合计 11 小时
- 先说下我写的时候的整体思路
	- 首先会看提示，如果不明白就问 AI，具体来说，比如 Memdump 中给的示例输出结果，我就是问了 AI，这很有帮助。
	- 然后就是找相关的文件读，找自己需要那些部分的内容，需要用到那些函数，看看整个过程需要那些调用什么，不行还是问 AI
	- 下来阶段就是自己写了，自己写的时候就是经常卡住。我的自己回想了下，大概分为两个方面，一个是==不知道该做些什么==，另一个是==知道该干啥但不会==，解决办法还是问 AI ，一步一步的，不知道思路就让 ==AI 提示思路==，不知道方法就问==如果我想要什么什么该怎么做==
	- 走到这一部分应该可以写出来一个差不多的框架了，剩下时间就是调试了，当然如果你在这里还是可以让 ai 帮你修改。
- 写的时间并没有很多，在读代码和调试花费的时间最多，我在 find 里面了犯了一个错误，当时想着提示 ls 函数，当时读完看着里面有函数好像用上，救把想着复用了里面的函数，结果最后还是大改了，看了其他人的代码，我的显得更加麻烦了。
- 我觉得关键不是如何完成这个实验，而从这一个个实验中查找和问 AI的过程更加令人珍贵的，
- 这里引用一下

> Note
>   对于用户态程序，只需将对应系统调用编号 (SYS_sleep) 存入 a7 寄存器，随后执行 ecall 指令即可进入内核执行 sleep 系统调用。
> 
>   站在用户的视角，系统调用宛如一个黑匣，只需把对应参数存入对应内存或寄存器，执行 ecall 后便能得到一个我们期望的状态。jyy ：”操作系统中没有任何魔法。” —— 那我们便会有疑问，**ecall 后执行了什么代码？ecall 又是如何定位到对应代码？** 
>  
>   然而面对庞大的内核代码，一行行的检索代码显然是不优雅的，曾经最为普遍的解决方式大概是阅读 xv6 book —— Chapter 4 Traps and system calls，然而当今更为推荐利用 AI 帮助我们检索代码，例如：
> 
>**QA**: 在 xv6 中，当用户进程执行 `ecall` 指令（RISC-V 平台）后，处理器会触发一个 **陷入（trap）**，从用户态（U-mode）切换到内核态（S-mode），并执行相应的内核代码。以下是 `sleep` 系统调用的执行流程： 123balabala… **总结：** 整个 `sleep` 系统调用流程：
> 
> 1. 用户进程执行 `sleep(n)`，触发 `ecall`。
>     
> 2. `usertrap()` 处理 `ecall`，调用 `syscall()`。
>     
> 3. `syscall()` 调用 `sys_sleep()`，进入 `sleep()`。
>     
> 4. `sleep()` 使进程睡眠，调用 `sched()` 进行调度。
>     
> 5. 时钟中断 `clockintr()` 增加 `ticks`，调用 `wakeup()` 唤醒进程。
>     
> 6. `scheduler()` 重新调度 `sleep` 进程，恢复执行。
> 

- AI 是很好的老师，我们应该会它们。

# Lab 2  System calls
## Using gdb
- 教你如何使用 gdb 的教程（不过我不太喜欢用），我在做的时候运行 gdb并没有自动连接 qemu，得 target 一下端口。

## Sandbox a command / Sandbox with allowed pathnames
- 我先说下容易做到的想法，就是直接用 mask &（1 << system calls）进行判断可以了（如果按照他的那些要求把前置工作理顺了
- 当然，问题显而易见的，整个程序的颗粒度不够，更详细的测试样例就不会通过（比如后续关于访问路径的问题就不能解决）
- 你需要对这些输入的路径文件进行更详细的判断
- 我先说下我错误的思路，尽量不要在 open 和 exec 中进行判断路径是否合法（我是这样做了，当但最后还是没有弄明白，但仔细看题目，他好像也不要求在其中更改内容），在 syscall 中初始化的进行判断（记得在 sys_interpose() 完成参数获取），如果是 open 和 exec 类的调用，单独抽出来就行了路径合法判断就行了。
- 可能需要的某些函数没有（你可能需要手搓一下）

## Attack xv6
- 用最简单的方法就行
- 注意 sprk 函数的用法和给你 data 数组
- 撞“页”就是了

## 碎碎念
- 本次耗时 3+3+1
- 说起来也是写了不少公开课了，体感上是题目给的要求更容易读懂了，第一次开始学的时期，“知识的诅咒”总是留在身上，写完了才完完全全清楚了。
- 快到 11 月份了，时间真是过的飞快，按照之前的计划我应该在 11 月上旬把 lab 写完的，可惜按照现在一周两个的进度是完不成了，转完专业后要补的课太麻烦了，这学期要比正常情况多上4 门，不然时间还是相当充裕的。
- 计网本来打算在 11 月开的，这下也是遥遥无期了，刷题也是少的可怜，学不完啊，学不完啊
- 世事悠悠浑未了，年光冉冉今如许



# Lab  3  Page tables
## Inspect a user-process page table

- 不需要写任何代码，理解用户进程页表就行了
- 可以从测试中看看是如何打印的，下面需要用到

## Speed up system calls
- 先看要求，他需要我们加速 getpid 系统调用，通过用户空间与内核共享只读区域避免内核陷入，减少用户态与内核态的转化
- 函数的完成需要在 proc.c 中
- 你在看文件内容的时候应该会看到类似内容
```c
 #ifdef LAB_PGTBL 
 .....
 #endif
```
- 在这个实验中会稍微用到一点（它的作用是隔离代码，尽在实验环境中运行）
```c
pagetable_t proc_pagetable(struct proc *p)
```
- 这个是你需要修改的代码
- 每当创建一个进程时，在 USYSCALL（在 memlayout.h 中定义的虚拟地址）映射一个只读页面。在这个页面的起始处存储一个 struct usyscall （也在 memlayout.h 中定义），并将其初始化为存储当前进程的 PID
- 所以我们可以在文件开头定义一个 usycall，并为其分配只读页表就行
```c
....
struct usyscall *usys;
char *usys_page; 


....

usys_page = kalloc();  

usys = (struct usyscall *)usys_page;  // 转换为struct指针
usys->pid = p->pid; 

//使用mappage分配物理页并设置权限即可
mappages(pagetable, USYSCALL, PGSIZE,  (uint64)usys_page,  PTE_R | PTE_U) 
// 当然其中如果分配失败的话，你需要一定的处理
```

##  Print a page table
- 代码在 vm.c 中完成
- 按照一定的结构打印它需要的内容
- 可用先用一个结构储存他的标志符，然后递归遍历所有页表即可，打印页表内容即可，pte  pa 的获取可以在头文件中找到，有宏定义供使用
- 这个比较容易想到和纠错，网上其他年份也有这个作业，比较容易实现

## Use superpages
- 弄了相当相当相当一段时间，这里给出正确的想法
- 先看 sbrk 函数，跟着内容一步一步走
```c
int
growproc(int n)
{
  uint64 sz;
  struct proc *p = myproc();

  sz = p->sz;
  if(n > 0){
    if((sz = uvmalloc(p->pagetable, sz, sz + n, PTE_W)) == 0) {
      return -1;
    }
  } else if(n < 0){
    sz = uvmdealloc(p->pagetable, sz, sz + n);
  }
  p->sz = sz;
  return 0;
}
```
- 可以看到uvmalloc 和uvmdealloc 两个函数，我们需要修改内容就是主要关于它们
- 需要先理解这两个函数干了啥（可以直接让 ai 读）
- 简而言之，uvmalloc 函数涉及页表的分配，我们需要的是对进行处理让其可以实行超级页的分配

- 看题目要求 *这个物理地址必须是两兆字节对齐的（即，是两兆字节的倍数）*
- *具体来说，如果用户程序调用 sbrk()的参数为 2 兆字节或更多，并且新创建的地址范围包含一个或多个以 2 兆字节对齐且至少为 2 兆字节的区域，内核应使用单个超级页（而不是数百个普通页）*
- 传进来的有 oldz 和 newz 以及 pagetable
- 需要先对 oldz 和 newz 进行页对齐，判断范围，看是否能在其中分配超级页，不能的话分配普通页
```c

... //最开始的newz和oldz不需要修改

oldsz = PGROUNDUP(oldsz); //对齐普通页
uint64 a = oldsz;
uint64 superbegin = SUPERPGROUNDUP(oldsz)； //宏定义里面有，向上与向下对齐超级页
uint64 superend = SUPERPGROUNDDOWN(newsz);

 if (superbegin < superend) {//代表存在分配超级页的空间
 
   
   for (; a < superbegin; a += PGSIZE)//用普通页填充直到与超级页对齐
     if (pagemalloc(pagetable, a, PGSIZE, xperm) != 0) goto err;
   for (; a < superend; a += SUPERPGSIZE) {开始分配超级页
   // 分配完超级页以后
     if (pagemalloc(pagetable, a, SUPERPGSIZE, xperm | PTE_S) != 0) {
       goto err;
... 
//分配剩下空间给普通页
  for (; a < newsz; a += PGSIZE)
    if (pagemalloc(pagetable, a, PGSIZE, xperm) != 0) goto err;
  return newsz;
  
err:
  // 分配页失败，则从oldsz开始释放页直到地址a的位置，返回0
  uvmdealloc(pagetable, a, oldsz);
  return 0;
}
```


- 然后我们来看其中的 pagemalloc 函数
- 其实这个函数就是对 mappage 的封装，我们只不过是抽出来了而已
```c
uint64 pagemalloc(pagetable_t pagetable, uint64 a, uint64 pgsz, int xperm) {
  char *mem;
  if (pgsz == SUPERPGSIZE) { //判断
    if ((mem = superalloc()) == 0) { // 想起这个了吗 usys_page = kalloc();
    //superalloc 
      return 1;
    }
    memset(mem, 0, pgsz);
    if (mappages(pagetable, a, pgsz, (uint64)mem, PTE_R | PTE_U | xperm) != 0) {
    //mappages(pagetable, USYSCALL, PGSIZE,  (uint64)usys_page,  PTE_R | PTE_U)  还是你在第一个实验中写的，进行物理映射
      superfree(mem);
      uvmdealloc(pagetable, a + pgsz, a); 
      return 1;
    }
  } else {
    if ((mem = kalloc()) == 0) {
      return 1;
    }
    memset(mem, 0, pgsz);
    if (mappages(pagetable, a, pgsz, (uint64)mem, PTE_R | PTE_U | xperm) != 0) {
      kfree(mem);
      uvmdealloc(pagetable, a + pgsz, a);
      return 1;
    }
  }
  return 0;
}
```

- 简单来说就是判断给的页表大小，是普通页还是超级页，然后分配物理内存，利用 mappage 进行映射页表，中间涉及一些失败判断

- 接下来，让我们来看 mappages，原本的是不支持映射超级页的，我们需要修改它
```c
int mappages(pagetable_t pagetable, uint64 va, uint64 size, uint64 pa, int perm) {
  uint64 a, pgsz;
  pte_t *pte;

  if ((va % PGSIZE) != 0) panic("mappages: va not aligned");

  if ((size % PGSIZE) != 0) panic("mappages: size not aligned");

  if (size == 0) panic("mappages: size");
  a = va;
  
  while (a < va + size) { //循环要分配的物理地址范围
    if (perm & PTE_S) {    //判断是否为超级页，这个标识符需要自己设置
      pgsz = SUPERPGSIZE;
                                                              
      if ((pte = superwalk(pagetable, a, 1)) == 0) return -1;
      //走页表，可以看walk函数，仿写一个类似的
    } else {
      pgsz = PGSIZE;
      if ((pte = walk(pagetable, a, 1)) == 0) return -1;
    }
    if (*pte & PTE_V) { //检查是否重复映射
      panic("mappages: remap");
    }
    *pte = PA2PTE(pa) | perm | PTE_V; //完成页映射
    a += pgsz;
    pa += pgsz;//递增
  }
  return 0;
}
```
- 我们来看 walk 函数
```c
// Return the address of the PTE in page table pagetable
// that corresponds to virtual address va.  If alloc!=0,
// create any required page-table pages.
//
// The risc-v Sv39 scheme has three levels of page-table
// pages. A page-table page contains 512 64-bit PTEs.
// A 64-bit virtual address is split into five fields:
//   39..63 -- must be zero.
//   30..38 -- 9 bits of level-2 index.
//   21..29 -- 9 bits of level-1 index.
//   12..20 -- 9 bits of level-0 index.
//    0..11 -- 12 bits of byte offset within the page.
pte_t *walk(pagetable_t pagetable, uint64 va, int alloc) {
  if (va >= MAXVA) panic("walk");

  for (int level = 2; level > 0; level--) {
    pte_t *pte = &pagetable[PX(level, va)];
    if (*pte & PTE_V) {
      pagetable = (pagetable_t)PTE2PA(*pte);
#ifdef LAB_PGTBL
      if (PTE_LEAF(*pte)) {
        return pte;
      }
#endif
    } else {
      if (!alloc || (pagetable = (pde_t *)kalloc()) == 0) return 0;
      memset(pagetable, 0, PGSIZE);
      *pte = PA2PTE(pagetable) | PTE_V;
    }
  }
  return &pagetable[PX(0, va)];
}
```
- 我们需要给超级页写一个类似的内容，他不需要走三级页表。*操作系统通过在一级页表项（PTE）中设置 PTE_V 和 PTE_R 位，并将物理页号设置为指向物理内存两兆字节区域的起始位置来创建超级页*
```c
pte_t *superwalk(pagetable_t pagetable, uint64 va, int alloc) {
  if (va >= MAXVA) panic("superwalk");
  pte_t *pte = &pagetable[PX(2, va)]; 
  if (*pte & PTE_V) {
    pagetable = (pagetable_t)PTE2PA(*pte);
  } else {
    if (!alloc || (pagetable = (pde_t *)kalloc()) == 0) return 0;
    memset(pagetable, 0, PGSIZE);
    *pte = PA2PTE(pagetable) | PTE_V;
  }
  return &pagetable[PX(1, va)];
}

```

- 我们还需要修改uvmunmap，使其可以取消映射超级页并释放物理内存
```c
.....

if (*pte & PTE_S) {
    sz = SUPERPGSIZE; 
    uint64 begin = SUPERPGROUNDDOWN(a + 1);  
    if (begin < va && begin + SUPERPGSIZE > va) {
      superpagedown(pagetable, begin); //最关键是这里，当我们取消映射页的时候，如果它是超级页部分，我们需要对他进行降级处理，保留其他部分，单单释放需要取消的部分
      pte = walk(pagetable, a, 0); //走页表重新获取新分配的pte
      sz = PGSIZE;
    }
  } else
    sz = PGSIZE;

  if (PTE_FLAGS(*pte) == PTE_V) panic("uvmunmap: not a leaf");
  if (do_free) {
    uint64 pa = PTE2PA(*pte); //进行物理释放
    if (sz == SUPERPGSIZE)
      superfree((void *)pa);
    else
      kfree((void *)pa);
  }
.....
```

```c
void superpagedown(pagetable_t pagetable, uint64 va) {
  char *mem;
  pte_t *pte = walk(pagetable, va, 0);
  uint perms = PTE_FLAGS(*pte) & (~(PTE_S)); //取消超级页的标志
  
  uint64 pa = PTE2PA(*pte);
  uint64 base = pa; //超级页的物理内存中是单独的一部分
  //大致如下 a.....a 分配的普通页都在这里 b......b 超级页
  //看上去 page superpage page ，实际上在映射不同的物理地址
  *pte = 0;
  for (uint64 a = va; a < SUPERPGSIZE + va; a += PGSIZE, pa += PGSIZE) {
    mem = kalloc();
    memmove(mem, (char *)pa, PGSIZE);
    mappages(pagetable, a, PGSIZE, (uint64)mem, perms); //重新分配
  }
  superfree((void *)base); //置空原来的物理地址
}

```

- 下面是涉及 fork 的 uvcopy 函数

```c
int uvmcopy(pagetable_t old, pagetable_t new, uint64 sz) {
  pte_t *pte;
  uint64 pa, i;
  uint flags;
  char *mem;
  int szinc = PGSIZE;

  for (i = 0; i < sz; i += szinc) {
    if ((pte = walk(old, i, 0)) == 0) continue;
    if ((*pte & PTE_V) == 0) {
      continue;
    }
    if (((*pte) & PTE_S) == PTE_S) { //判断，是的话也进行超级位设置
      szinc = SUPERPGSIZE;
      flags |= PTE_S;
    } else
      szinc = PGSIZE;
    pa = PTE2PA(*pte);
    flags = PTE_FLAGS(*pte);
    if (szinc == SUPERPGSIZE) {
      if ((mem = superalloc()) == 0) goto err;
      memmove(mem, (char *)pa, SUPERPGSIZE);
      if (mappages(new, i, SUPERPGSIZE, (uint64)mem, flags) != 0) {
        superfree(mem);
      }
    } else {
      if ((mem = kalloc()) == 0) goto err;
      memmove(mem, (char *)pa, PGSIZE);
      if (mappages(new, i, PGSIZE, (uint64)mem, flags) != 0) {
        kfree(mem);
        goto err;
      }
    }
  }
  return 0;

err:
  uvmunmap(new, 0, i / PGSIZE, 1);
  return -1;
}

```

- 最后是关于开始时的分配

```c
void * 
superalloc(void)  //基本与kalloc一样
{
  struct run *r;

  acquire(&superkmem.lock);
  r = superkmem.freelist;
  if (r)
    superkmem.freelist = r->next;
  release(&superkmem.lock);

  if(r)
    memset((char*)r, 5, SUPERPGSIZE); 
  return (void*)r;
}

void *
kalloc(void)
{
  struct run *r;

  acquire(&kmem.lock);
  r = kmem.freelist;
  if(r)
    kmem.freelist = r->next;
  release(&kmem.lock);

  if(r)
    memset((char*)r, 5, PGSIZE); 
  return (void*)r;
}


void superfree(void *pa) 
{
  struct run *r;

  if((char*)pa < end || (uint64)pa >= PHYSTOP)
    panic("superfree");

  // Fill with junk to catch dangling refs.
  memset(pa, 1, SUPERPGSIZE);

  r = (struct run*)pa;

  acquire(&superkmem.lock);
  r->next = superkmem.freelist;
  superkmem.freelist = r;
  release(&superkmem.lock);
}

void
kfree(void *pa)
{
  struct run *r;

  if(((uint64)pa % PGSIZE) != 0 || (char*)pa < end || (uint64)pa >= PHYSTOP)
    panic("kfree");

  memset(pa, 1, PGSIZE);

  r = (struct run*)pa;

  acquire(&kmem.lock);
  r->next = kmem.freelist;
  kmem.freelist = r;
  release(&kmem.lock);
}
```

```c
struct {
  struct spinlock lock;
  struct run *freelist;
} superkmem; //增加超级页结构


void
kinit()
{
  initlock(&kmem.lock, "kmem");
  initlock(&superkmem.lock, "superkmem");
  freerange(end, (void*)PHYSTOP);
}

void
freerange(void *pa_start, void *pa_end)
{
  char *p;
  p = (char*)SUPERPGROUNDUP((uint64)pa_start);
  for(; p + SUPERPGSIZE <=(char*)PHYSTOP - 16*SUPERPGSIZE;p += SUPERPGSIZE)
    superfree(p);
  p = (char*)PGROUNDUP((uint64)p);
  for(; p + PGSIZE <= (char*)pa_end; p += PGSIZE)
    kfree(p);
}

```

## 碎碎念
- 整个实验流程写了 20 多个小时，大部分都是在最后部分的 use 部分了
- 涉及思路也是改改写写，最失败的就是关于页标志那部分，一开始我没有用，打算把 walk 改一下直接从是否还有三级页表来判断，最后还是老实了



# Lab 4 Trap

## RISC-V assembly
- 读汇编，比较容易，跟着走就行了

## Backtrace
- 需要把栈帧的结构弄明白
- 获取 ra 和 fp  然后利用这个*返回地址位于栈帧指针的一个固定偏移量（-8）处，而保存的栈帧指针位于另一个固定偏移量（-16）处*
- 最后用 PGROUNDDOWN(fp)（或者 UP）用来确定遍历的范围就行了

##  Alarm
- 前期的工作跟一开始的 sleep 一样，跟着添加函数内容就行了
- sigalarm 和 sigreturn 系统调用实现很简单，sigalarm 中用 argint 或类似的获取参数，然后读取到你在 proc 中新定义的 field 就行
- sigreturn 同样参数进行处理返回就行
- Trap 中对 usertrap 中 if(which_dev == 2) .... 部分处理，保存简而言之，需要存储计数时钟滴答并处理相关 trapframe 和其他内容

## 碎碎念
- 这个相比 Lab 3 容易许多了，只用写很少的代码，理解整个流程就可以
- 当然不要犯一些弱智的错误（比如我，写的时候先改了返回值，后保留了 trapframe，傻傻没看出来）
- 耗时 8 小时


# Lab 5  Copy-on-Write Fork
##  Copy-on-Write
- 与 page tables 旗鼓相当，需要对整个系统流程十分清楚
- 先看要求吧
- *COW fork() 仅为主进程创建一个页表，其中用户内存的 PTE 指向父进程的物理页。COW fork() 将父进程和子进程中的所有用户 PTE 标记为只读。当任一进程尝试写入这些 COW 页时，CPU 将强制触发页错误。内核页错误处理程序检测到此情况，为出错进程分配一页物理内存，将原始页复制到新页中，并修改出错进程中的相关 PTE 以指向新页，这次将 PTE 标记为可写。当页错误处理程序返回时，用户进程将能够写入其页面的副本*

```c 
.....
uvmcopy.c

pa = PTE2PA(*pte);
flags = PTE_FLAGS(*pte);

   if (flags & PTE_W) {
     *pte = (*pte) & (~PTE_W);   //取消了原先在这里的页分配，调整了页面权限
     *pte = (*pte) | (PTE_C); 
      flags = PTE_FLAGS(*pte);
   } 

   if (mappages(new, i, PGSIZE, pa, flags) != 0) { //子进程与父进程映射同一地址
    //因为没有分配，所有自然不用kfree
     goto err;
   }
icow(pa); //根据提示增加的引用计数

......
```

- Kalloc 中设置引用计数部分
```c

struct {
  struct spinlock cowlock;  //需要考虑并发了，直接用一个全局变量出现问题
  int index[num];
} indexcow;


void kinit() {
  initlock(&kmem.lock, "kmem");
  initlock(&indexcow.cowlock, "indexcow");  //获取锁
  freerange(end, (void*)PHYSTOP);
}

void freerange(void* pa_start, void* pa_end) {
  char* p;
  p = (char*)PGROUNDUP((uint64)pa_start);
  for (int i = 0; i < num; i++) {
    indexcow.index[i] = 1;  //初始化
  }
  for (; p + PGSIZE <= (char*)pa_end; p += PGSIZE) {
    kfree(p);
  }
}

//kfree.c


 acquire(&indexcow.cowlock);  // 涉及加减操作都有获取锁
 --indexcow.index[idx];       // 引用计数-1，若减为0，释放 不为零返回
 if (indexcow.index[idx] > 0) {  //其实可以一开始的时候直接初始化为零，然后释放这片的
                                 //物理内存，额外抽取一个dcow函数，每次释放内存的时
                                 //候时 先对引用计数减一
   release(&indexcow.cowlock);
   return;
 }
 release(&indexcow.cowlock);


//kallc.c

uint64 idx;
 if (r) {
   idx = (uint64)r / PGSIZE;
   acquire(&indexcow.cowlock);  //分配页面的时候 初始化引用计数
   indexcow.index[idx] = 1;
   release(&indexcow.cowlock);
 } else
   return 0;
 memset((char*)r, 5, PGSIZE);  // fill with junk
 return (void*)r;

```


- 我们看一下 vmfault 函数以及调用它的时机
- 在 trap. c 中
```c
else if(r_scause() == 15){
// 这里原先是对15（写错误） 13（读错误） 进行判断 然后再进行调用vmfault函数处理的
//按照题目的内容，我们应该是对vmfault  copyout 修改 这里应该不需要修改
//但这里我没有弄出来了，参考了别人的想法


//首先就是为什么会发生读写错误，xv6启用了懒分配的功能，它进行了映射，却具体没有分配页
//最初的vmfault 就是为其分配页的

//然后，从本质上，读错误是可以被包含（没有读的地方，你需要先分配，才能能读，读权限错误，不大可能）
//我们可以只用处理写错误
//也就是说，碰到写错误

....
uint64 va = r_stval();
   if (va >= p->sz) {
     setkilled(p);  //判断给定的地址空间是否有问题
     goto err;     //跳转结束
   }   

   pte_t* pte = walk(p->pagetable, va, 1); //为1 很特殊 与懒加载有关
   

   // 判断是否是缺页错误，即未分配页，未设置pte
   if (!(*pte)) {
     // 分配页
     char* mem = kalloc();
     if (mem == 0) {
       setkilled(p);
     }
     if (mappages(p->pagetable, va, PGSIZE, (uint64)mem, PTE_U | PTE_R | PTE_W) != 0) {
       kfree((void*)mem);
       setkilled(p);
     }
   }
   // 写时遇到错误，判断是否是cow页
   else if (*pte & PTE_C) {    
     if (cowalloc(p->pagetable, va) == 0) {
       setkilled(p);
       goto err;
     }
   } else {

     setkilled(p);
   }
......
```
- Cowalloc
```c

uint64 cowalloc(pagetable_t pagetable, uint64 va) {
  pte_t* pte = walk(pagetable, va, 0);
  uint flags = (PTE_FLAGS(*pte) & ~PTE_C) | PTE_W;

  if (!(*pte & PTE_C)) {
    panic("cowalloc fail : not a cow");
  }
  uint64 pa = PTE2PA(*pte);
  uint64 mem;
  uint64 ref = getsubindex(pa);   //先减 在获取引用计数

  if (ref == 0) {   //判断是引用技术，是否为最后一个
    *pte = PA2PTE(pa) | flags;  
    icow(pa);   //避免并发错误 
    return pa;
  }

  // 若并非最后进程，分配
  if ((mem = (uint64)kalloc()) == 0) {
    panic("cowalloc : kalloc fail");
  }

  memmove((void*)mem, (char*)pa, PGSIZE);
  *pte = PA2PTE(mem) | flags;
  return mem;
}
```

 - Copyout
```c

   // 判断写入的页是否为cow
    if ((*pte&PTE_C)) {
      pa0 = cowalloc(pagetable, va0);
      pte = walk(pagetable, va0, 0);
    }
    // 判断有无写权限，并写入
    if (!(PTE_FLAGS(*pte) & PTE_W)) return -1;
```

## 碎碎念
- 耗时 15 小时以上
- 自己还是太笨了，按照最初的思路 Vmfault 应该在不影响原来的功能前提下，增添 cowalloc 的功能，同时适配 trap 那里的错误调用处理，但没弄出来了。


# Lab 6  Networking

## Part One: NIC 
- 关键是把那一段要求读懂，我自己是用 AI，用大白话讲解整个流程。

- 发数据
	- 操作系统（比如你在浏览器输入网址）会把要发送的数据（比如网页请求）按照网络协议（如以太网、IP、TCP）打包成 “标准包裹”（网络帧），每个包裹有目标地址（对方 MAC/IP）、内容、校验码等。
	    
	- 驱动程序会在内存中开辟一块 “待发区域”（发送缓冲区，即 `tx_ring` 环形队列），把包裹的地址和长度写进 “发货单”（发送描述符 `struct tx_desc`），然后把发货单放进待发区域，通知网卡（收发站）：“这里有包裹要发”。
	    
	- 网卡硬件会自动读取待发区域的发货单，根据地址从内存中取包裹（DMA 传输，不占用 CPU），然后通过网线发送到目标地址。发送完成后，网卡会在发货单上打个 “已发送” 的标记（`E1000_TXD_STAT_DD` 标志）。
	    
	- 驱动程序定期检查待发区域，发现 “已发送” 的发货单后，回收对应的内存（包裹已发，不需要再存了），腾出空间给新的包裹。
	    
- 收数据
	- 驱动程序预先在内存中开辟多个 “收货柜”（接收缓冲区，即 `rx_ring` 环形队列），每个柜子对应一张 “收货单”（接收描述符 `struct rx_desc`），收货单上写着柜子的地址（内存地址），告诉网卡：“收到包裹就放这些柜子里”。
	    
	- 网卡从网线收到包裹后，会检查包裹的目标地址（是否是自己的 MAC 地址，即初始化时设置的 `52:54:00:12:34:56`），如果匹配，就通过 DMA 把包裹放进某个收货柜，然后在对应的收货单上打 “已签收” 标记（`E1000_RXD_STAT_DD` 标志），同时触发一个中断：“有新包裹到了！”。
	    
	- 操作系统收到中断后，通知驱动程序（管理员）处理。驱动程序找到 “已签收” 的收货单，从对应的柜子（内存）中取出包裹，按照网络协议解析（拆包，去掉以太网头、IP 头、TCP 头等），把里面的有效数据（比如网页内容）交给上层应用（比如浏览器）。
	    
	- 驱动程序回收已处理完的收货柜，重新分配新的内存（空柜子），更新收货单的地址，告诉网卡：“这个柜子又可以用了”。
	    
- 明白了整个流程之后代码就十分好些了，我们从 regs 中获取 idx，判断是否 tx_ring[idx] 中E1000_TXD_STAT_DD  , 后续查看有 addr 是否还有内存，有的释放，后续再分配就行。
- 记得最后处理 id ，使其再循环列表中递增。

- Recv 中处理也是类似先获取 regs 中的 idx，注意这里的 E1000_RDT 与之前的 E 1000_TDT 不同需要处理，之后调用net_rx 分配就行
- 由于我们需要把整个数据都处理完，所有可以使用一个 while 循环包裹一下。


## UDP Receive

- 根据提示我们可以给出，这个结构体，包含 16 个数据包的数组（对应缓存最大 16 个数据包限制）、head/tail 指针（指示数据包位置）、count（记录数据个数）、锁（保障线程安全）、is_bind（标记端口是否绑定）。
- 定义全局结构体数组：以最大端口数 65536（16 位端口范围）为大小，存储每个端口对应的上述基础结构体，实现端口与数据包的绑定跟踪。

- Bind 函数我们进行辨别是否它可以被绑定，被绑定直接返回，没有绑定进行设置并返回就行。
- Rx_ip 从以太网帧中解析 IP 数据，校验协议类型是否为 UDP（协议号 17）。然后我们可以解析 UDP 数据，通过大小端转换函数（如 ntohs）处理目标端口（网络字节序转主机字节序）。

- 查询目标端口对应的结构体是否绑定，若已绑定则获取 UDP 数据，通过队列函数将数据包传入全局数组对应的端口结构体中，同时进行数据深度拷贝。

- 通过参数获取目标端口，从全局数组中定位对应结构体并获取锁。循环检查端口绑定状态，若未绑定数据超载，则让线程进入睡眠状态，等待唤醒。唤醒后从端口结构体中读取队列中的数据包并处理就行。

## 碎碎念
- 其实难度不大，关键是把那很长很长的题目看明白就行。
- 耗时 10 小时

#  Lab 7  locks
## Memory allocator 
- 把原先的空闲列表改成数组就行，初始化的时候针对每一个核都进行初始化。
- Freerange 和Kfree 中用 push_off 和 pop_on 获取当前的 cpuid ，然后跟之前进行一样的处理就行。
- Kalloc 中先获取本次 cpuid，进行判断是否有空闲的页，有的直接分配，没有用一个循环找到其他 cpuid 的列表，如果有空闲的，偷页就行了，可以偷一页，也可以多投几页（如果很多的话）

## Read-write lock
- 人傻了.................
- 进行实验之前你应该看，你给你分配的 cpu 内核数，这个实验测试和上一个会到至少四个，请不要像我一样，几天时间白白浪费
- 这几天真是被他折磨疯了..........
- 下面是我的设计.............
```C

void
initrwlock(struct rwspinlock *rwlk)
{
  rwlk->reader = 0;
  rwlk->writer_wait = 0;
  rwlk->writer_hold = 0;
  initlock(&rwlk->l,"rwlk");
}

static void
read_acquire_inner(struct rwspinlock *rwlk)
{
 
    acquire(&rwlk->l);
     while(__atomic_load_n(&rwlk->writer_hold ,__ATOMIC_SEQ_CST) != 0 
      || __atomic_load_n(&rwlk->writer_wait,__ATOMIC_SEQ_CST) > 0){
    
     }
     __atomic_fetch_add(&rwlk->reader,1,__ATOMIC_SEQ_CST);
    release(&rwlk->l);
}

static void
read_release_inner(struct rwspinlock *rwlk)
{

  __atomic_fetch_sub(&rwlk->reader,1,__ATOMIC_SEQ_CST);
}

static void
write_acquire_inner(struct rwspinlock *rwlk)
{
  acquire(&rwlk->l);
 
  __atomic_fetch_add(&rwlk->writer_hold,1,__ATOMIC_SEQ_CST);

  while(__atomic_load_n(&rwlk->reader,__ATOMIC_SEQ_CST) > 0 || 
  __atomic_load_n(&rwlk->writer_wait,__ATOMIC_SEQ_CST) > 0){

  }
  __atomic_fetch_add(&rwlk->writer_wait,1,__ATOMIC_SEQ_CST);
  __atomic_fetch_sub(&rwlk->writer_hold,1,__ATOMIC_SEQ_CST);
  
  release(&rwlk->l);
}

static void
write_release_inner(struct rwspinlock *rwlk)
{  
  __atomic_fetch_sub(&rwlk->writer_wait,1, __ATOMIC_SEQ_CST);
}


struct rwspinlock {
   volatile int reader;
   volatile int writer_hold;
   volatile int writer_wait;
   struct spinlock l;
};


```

## 碎碎念
- 公开课，请找一个有很多人尝试的版本，这样你能尽量避免许多奇奇怪怪错误
- 耗时 20 小时以上，我有至少 15 个小时都卡在那个最后的测试，我以为是我的设计有问题，他的测试很严格，其实是虚拟机分配内核时不足够.............



#  Lab 8  file system

## Large files
- 这个测试我没有跑完，被（take at least a minute and a half to run.）吓到了，不过对找了别人，大体上是没有问题的。
- 设计上就是对照原来的 bmp 函数，原先是有间接块的设计的，按图索骥，写出二级块就行了
- 一开始看是可能有点蒙，感觉重点是把 bmp 原本的函数调用过程看明白

## Symbolic links 
- 前期工作如先前的一样，完善 user.h  / user. pl 等一些列东西
- 这个难度不大，还是得明白整个流程怎么样子的
- Namei/ Nname 可以帮助获取路径上的 inode
- Sys_symlink 中用之前的方法读取参数，利用 create 和 writei 可以完成
- Open 函数中是一个递归调用，可以用循环转化，这样会更简单一些，具体操作就是用 readi 读获取的 inode 分别文件类型并且是否为O_NOFOLLOW，如果需要继续递归获取
- 中间有一些设计锁和日志的内容，需要注意。


## 碎碎念
- 耗时 10小时
- 大部分时间在读参数，熟悉代码，写的很少

# Lab 9  mmap

## mmap
- 困难的地方有两个，针对 2025 年的版本来说，一个是设计的部分，另一个是 munmap 的页面协会问题。
- 网上的有直接在堆之上进行分配空间的设计，但这样后续调用 sbrk 时可能会出现问题，会覆盖之前的内容，这意味着这样需要修改 sbrk 和其他相关函数，加上新版的测试是更加的严格了，因此不建议这样设计
- 采用的设计是从是从 trapframe 的底部向下生长，也就是从 MAXVA 往下

```c

struct vma
{     
    struct file *f; 
    uint64 addr;
    uint64 len;  
    int npage; 
    int valid;  
    int prot;     
    int flag;    
    int offset; // 其实不用处理 题目已经说了 假设一直为0
};



struct proc {
  .......
  struct vma vmas[16];
  uint64 maxaddr;  //堆的上限
};



//proc.c  allocproc中初始化
for( int i=0 ; i< 16 ; i++ )
{
  p->vmas[i].valid = 0;
  p->vmas[i].npage = 0;
}
p->maxaddr = MAXVA - 2*PGSIZE;

```

- 前期工作一样，我们补充系统调用的内容

```c
//mmap
uint64 sys_mmap(void)
{
    int flag, fd, prot,len,offset;
    uint64 addr;
    argaddr(0, &addr); 
    argint(1, &len);
    argint(2, &prot);
    argint(3, &flag);
    argint(4, &fd);
    argint(5, &offset);

    if (fd < 0 || fd >= NOFILE) return 0xffffffffffffffff;
    struct proc *p = myproc();
    struct file *f = p->ofile[fd];
    if (!f) return 0xffffffffffffffff;

    if ((prot & PROT_READ) && !f->readable) return 0xffffffffffffffff;
    if ((flag & MAP_SHARED) && (prot & PROT_WRITE) && !f->writable) return 0xffffffffffffffff;

    int idx = -1;
    for (int i = 0; i < 16; ++i) {
        if (!p->vmas[i].valid) { idx = i; break; }
    }
    if (idx == -1) return 0xffffffffffffffff;


    len = PGROUNDUP(len);
    p->maxaddr = PGROUNDDOWN(p->maxaddr - len);

    struct vma* vma = &p->vmas[idx];
    vma->valid = 1;
    vma->f = f;
    filedup(f);
    vma->addr = p->maxaddr; 
    vma->flag = flag;
    vma->offset = offset;
    vma->prot = prot;
    vma->len = len;
    vma->npage = len / PGSIZE; 
    return vma->addr;
}

```

- Trap. C
```c

else if(r_scause() == 15 || r_scause() == 13){
  uint64 va = r_stval();
  va = PGROUNDDOWN(va);

  if(va >= MAXVA){
    setkilled(p);
    kexit(-1);
  }
  int found =0;
  for(int i = 0 ;i < 16; i++){
    struct vma* vma = &p->vmas[i];
    if(va >= vma->addr && va < vma->addr + vma->len && vma->valid ){
      uint64 pa = (uint64)kalloc();
      if (pa == 0) { 
        setkilled(p);
        kexit(-1);
      }
      memset((void*)pa,0,PGSIZE);

   
      ilock(vma->f->ip);
      if(readi(vma->f->ip, 0, pa, vma->offset + va - vma->addr, PGSIZE) < 0) {
        iunlock(vma->f->ip);
        kfree((void*)pa);
        break;
      }
      iunlock(vma->f->ip);

    int perm = PTE_U | PTE_V;
    if (vma->prot & PROT_READ) perm |= PTE_R;
    if (vma->prot & PROT_WRITE) {
        perm |= PTE_W; 
        }
    if (vma->prot & PROT_EXEC) perm |= PTE_X;
      

    if(mappages(p->pagetable, va, PGSIZE, pa, perm) < 0){
          kfree((void*)pa);
          setkilled(p);
          kexit(-1);
      }
      found = 1;
      break; 
    }     
  }
  if(!found){
     setkilled(p);
     kexit(-1);
  }
```


```c

uint64 sys_munmap(void) {
    uint64 addr;
    int len;
    argaddr(0, &addr);
    argint(1, &len);

    if (len <= 0 || addr >= MAXVA) {
        return -1;
    }

    struct proc *p = myproc();
    struct vma *vma = 0;
    int found = 0;
    for (int i = 0; i < 16; i++) {
        vma = &p->vmas[i];
        if (vma->valid &&
            addr >= vma->addr &&
            addr + len <= vma->addr + vma->len) {
            found = 1;
            break;
        }
    }
    if (!found) {
        return -1;
    }

    
    munmap(p, vma, addr, len); 
    return 0;
}

```

- Munmap 的核心部分。
```c
 void munmap(struct proc *p, struct vma *vma, uint64 addr, int len) {
    int do_free = 1; 
    uint64 va = addr;
    int npages = PGROUNDUP(len) / PGSIZE;
    struct file *f = vma->f;
    uint fizesize = f->ip->size; 

    int can_write = (vma->flag & MAP_SHARED) && (vma->prot & PROT_WRITE) && f->writable; //判断是否需要写回

    for (int j = 0; j < npages; j++) {
        if (walkaddr(p->pagetable, va) != 0) { 
        //检查虚拟地址va是否存在页表映射
            if (can_write) {
                int off = va - addr;
               //offset其实为零，不用计算，本质就是判断文件的大小是否超过一个页，并判断
               //若整页都在文件范围内 → 写 4096 字节；
               // 若页跨越文件末尾 → 只写文件剩余的字节数
              	//若页完全超出文件 → 写 0 字节
                int n = (vma->offset + off + PGSIZE > fizesize) ? fizesize - (vma->offset + off) : PGSIZE;  
                if (n > 0) {
                    filewriteoff(f, va, n, vma->offset + off);
                    //这里是不能使用filewrite，需要针对修改
                }
            }
            uvmunmap(p->pagetable, va, 1, do_free);
        }
        va += PGSIZE;
    }
    
   if (addr == vma->addr) { //完成释放
        vma->addr = va;
        vma->offset += npages * PGSIZE;
    }
    vma->npage -= npages;
    vma->len -= len;

    if (vma->npage == 0) {
        fileclose(vma->f);
        vma->valid = 0;
        vma->f = 0;
    }
}
```

- Filewriteoff
```c

int
filewrite(struct file *f, uint64 addr, int n)
{
  int r, ret = 0;

  if(f->writable == 0)
    return -1;

  if(f->type == FD_PIPE){
    ret = pipewrite(f->pipe, addr, n);
  } else if(f->type == FD_DEVICE){
    if(f->major < 0 || f->major >= NDEV || !devsw[f->major].write)
      return -1;
    ret = devsw[f->major].write(1, addr, n);
  } else if(f->type == FD_INODE){
    // write a few blocks at a time to avoid exceeding
    // the maximum log transaction size, including
    // i-node, indirect block, allocation blocks,
    // and 2 blocks of slop for non-aligned writes.
    int max = ((MAXOPBLOCKS-1-1-2) / 2) * BSIZE;
    int i = 0;
    while(i < n){
      int n1 = n - i;
      if(n1 > max)
        n1 = max;

      begin_op();
      ilock(f->ip);
      if ((r = writei(f->ip, 1, addr + i, f->off, n1)) > 0)
        f->off += r;
      iunlock(f->ip);
      end_op();

      if(r != n1){
        // error from writei
        break;
      }
      i += r;
    }
    ret = (i == n ? n : -1);
  } else {
    panic("filewrite");
  }

  return ret;
}



//增加 off
 int filewriteoff(struct file *f, uint64 addr, int n , int off)
 {
   int r, ret = 0;
 
   if(f->writable == 0)
     return -1;
 
   if(f->type == FD_INODE){
   int max = ((MAXOPBLOCKS-1-1-2) / 2) * BSIZE;
   int i = 0;
   while(i < n){
     int n1 = n - i;
     if(n1 > max)
       n1 = max;
 
     begin_op();
     ilock(f->ip);
     if ((r = writei(f->ip, 1, addr + i, off, n1)) > 0)
       off += r;
     iunlock(f->ip);
     end_op();
 
     if(r != n1){
       break;
     }
     i += r;
   }
   ret = (i == n ? n : -1);
 } else {
   panic("my filewrite");
 }
   return ret;
 }
```


## 碎碎念
- 花费 11 小时
- 没有完成所有的测试，有些 option 不能通过，整个核心就是一开始的设计问题和后续的 munmap 写回设计，但即使这样，设计其实还是有问题的，不过就这样把，要复习备考了。