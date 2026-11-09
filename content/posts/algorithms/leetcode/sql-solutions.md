---
title: "SQL 题解"
tab_title: "SQL Solutions"
date: "2026-11-10T00:41:42+08:00"
draft: false
topics: ["algorithms"]
series: ["LeetCode"]
tags: ["SQL"]
summary: "连接、聚合、排序与窗口函数的数据库练习。"
---

# 组合两个表

[175. 组合两个表](https://leetcode.cn/problems/combine-two-tables/)

组合两个表：Person 左连 Address，没有地址的人也要出来，地址字段为 null。标准 `LEFT JOIN ... ON Person.PersonId = Address.PersonId`，选出 FirstName、LastName、City、State。

SQL 热身题，分清 LEFT / INNER 就行。

```sql
SELECT p.FirstName, p.LastName, a.City, a.State
FROM Person p
LEFT JOIN Address a ON p.PersonId = a.PersonId;
```

# 第二高的薪水

[176. 第二高的薪水](https://leetcode.cn/problems/second-highest-salary/)

第二高薪水：`DISTINCT Salary ORDER BY DESC LIMIT 1 OFFSET 1` 看起来对，但只有一行时会空结果集，OJ 要的是一个 null 单元格。包一层子查询（或 `IFNULL`）把空变成 null。

也可以 `MAX(Salary) WHERE Salary < (SELECT MAX(Salary) ...)`，没有第二高时自然 null。

```sql
SELECT (
  SELECT DISTINCT Salary
  FROM Employee
  ORDER BY Salary DESC
  LIMIT 1 OFFSET 1
) AS SecondHighestSalary;
```

# 第N高的薪水

[177. 第N高的薪水](https://leetcode.cn/problems/nth-highest-salary/)

第 N 高：和 176 类似，写成函数，`LIMIT 1 OFFSET N-1`。注意函数里不能直接用表达式当 OFFSET，要先把 N-1 赋给变量。同样用子查询包一下，保证不够 N 个不同薪水时返回 null。

```sql
CREATE FUNCTION getNthHighestSalary(N INT) RETURNS INT
BEGIN
  DECLARE M INT;
  SET M = N - 1;
  RETURN (
    SELECT DISTINCT Salary
    FROM Employee
    ORDER BY Salary DESC
    LIMIT 1 OFFSET M
  );
END
```

# 分数排名

[178. 分数排名](https://leetcode.cn/problems/rank-scores/)

分数排名：同分同名次、下一名次不跳号 → `DENSE_RANK()`；若要跳号用 `RANK()`，连续名次用 `ROW_NUMBER()`。窗口函数一句话搞定，比变量模拟清爽多了。

```sql
SELECT score,
       DENSE_RANK() OVER (ORDER BY score DESC) AS `rank`
FROM Scores
ORDER BY score DESC;
```

# 连续出现的数字

[180. 连续出现的数字](https://leetcode.cn/problems/consecutive-numbers/)

连续出现至少三次的数字：自连三次，`l1.Id+1=l2.Id AND l2.Id+1=l3.Id` 且三个 Num 相等，再 `DISTINCT`。也可用窗口 `LAG`/`LEAD` 比前后。

```sql
SELECT DISTINCT l1.Num AS ConsecutiveNums
FROM Logs l1
JOIN Logs l2 ON l1.Id = l2.Id - 1 AND l1.Num = l2.Num
JOIN Logs l3 ON l2.Id = l3.Id - 1 AND l2.Num = l3.Num;
```

# 超过经理收入的员工

[181. 超过经理收入的员工](https://leetcode.cn/problems/employees-earning-more-than-their-managers/)

员工薪水超过经理：Employee 自连，`e.ManagerId = m.Id AND e.Salary > m.Salary`。表结构里经理也是员工，自连是常规操作。

```sql
SELECT e.Name AS Employee
FROM Employee e
JOIN Employee m ON e.ManagerId = m.Id
WHERE e.Salary > m.Salary;
```

# 查找重复的电子邮箱

[182. 查找重复的电子邮箱](https://leetcode.cn/problems/duplicate-emails/)

重复邮箱：`GROUP BY Email HAVING COUNT(*) > 1`。简单聚合题，别写成两层子查询。

```sql
SELECT Email
FROM Person
GROUP BY Email
HAVING COUNT(*) > 1;
```

# 从不订购的客户

[183. 从不订购的客户](https://leetcode.cn/problems/customers-who-never-order/)

从不订购的客户：Customers 左连 Orders，`Order.Id IS NULL` 的就是没下过单的；或 `NOT IN` / `NOT EXISTS`。注意 `NOT IN` 遇上 NULL 会踩坑，左连或 `NOT EXISTS` 更稳。

```sql
SELECT c.Name AS Customers
FROM Customers c
LEFT JOIN Orders o ON c.Id = o.CustomerId
WHERE o.Id IS NULL;
```

# 部门工资最高的员工

[184. 部门工资最高的员工](https://leetcode.cn/problems/department-highest-salary/)

部门工资最高：按部门找 MAX(Salary)，再和员工表、部门表连接把名字取出来。旧笔记踩过：同部门多人同最高薪都要保留，所以不能只 `GROUP BY` 拿一行员工名，应先算出各部门最高薪再回表过滤。

```sql
SELECT d.Name AS Department, e.Name AS Employee, e.Salary
FROM Employee e
JOIN Department d ON e.DepartmentId = d.Id
WHERE (e.DepartmentId, e.Salary) IN (
  SELECT DepartmentId, MAX(Salary)
  FROM Employee
  GROUP BY DepartmentId
);
```

# 部门工资前三高的员工

[185. 部门工资前三高的员工](https://leetcode.cn/problems/department-top-three-salaries/)

部门前三高薪水：每人薪水和同部门「严格更高的不同薪水个数」比，小于 3 就留下（即前三档）。窗口函数可用 `DENSE_RANK() OVER (PARTITION BY DepartmentId ORDER BY Salary DESC)`，`WHERE rk <= 3`。

和 184 一样，同薪多人算同一档。

```sql
SELECT Department, Employee, Salary
FROM (
  SELECT d.Name AS Department,
         e.Name AS Employee,
         e.Salary,
         DENSE_RANK() OVER (PARTITION BY e.DepartmentId ORDER BY e.Salary DESC) AS rk
  FROM Employee e
  JOIN Department d ON e.DepartmentId = d.Id
) t
WHERE rk <= 3;
```
