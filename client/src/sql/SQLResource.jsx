import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Clipboard,
  Code2,
  Copy,
  Database,
  FileCode2,
  Gauge,
  KeyRound,
  Layers3,
  Lightbulb,
  ListFilter,
  LockKeyhole,
  Network,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  Table2,
  TerminalSquare,
  Workflow,
  Zap,
} from "lucide-react";

const SITE_URL = "https://www.targettrek.in";
const PAGE_URL = `${SITE_URL}/resources/sql`;

const readTheme = () => {
  if (typeof window === "undefined") return "light";

  const storedTheme = localStorage.getItem("theme");

  if (storedTheme === "dark" || storedTheme === "light") {
    return storedTheme;
  }

  if (
    document.documentElement.classList.contains("dark") ||
    document.documentElement.getAttribute("data-theme") === "dark"
  ) {
    return "dark";
  }

  return "light";
};

const useSyncedTheme = () => {
  const [theme, setTheme] = useState(readTheme);

  useEffect(() => {
    const syncTheme = () => {
      const nextTheme = readTheme();

      setTheme((current) =>
        current === nextTheme ? current : nextTheme
      );
    };

    window.addEventListener("storage", syncTheme);
    window.addEventListener("themechange", syncTheme);

    const observer = new MutationObserver(syncTheme);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    // storage event does not fire in the same tab that changed localStorage.
    // This keeps the page synced even if the Navbar only updates localStorage.
    const interval = window.setInterval(syncTheme, 300);

    return () => {
      window.removeEventListener("storage", syncTheme);
      window.removeEventListener("themechange", syncTheme);
      observer.disconnect();
      window.clearInterval(interval);
    };
  }, []);

  return theme;
};

const sqlSections = [
  {
    id: "database-introduction",
    short: "Database",
    title: "1. What is a Database?",
    icon: Database,
    description:
      "A database is an organized collection of data designed so applications can store, retrieve, update and manage information efficiently.",
    bullets: [
      "Stores structured information permanently.",
      "Makes searching and filtering large amounts of data efficient.",
      "Allows multiple applications and users to work with the same data.",
      "Supports relationships between different entities.",
      "Can enforce data correctness using constraints.",
      "Provides transactions, recovery, security and concurrency control.",
    ],
    codeTitle: "Example data",
    code: `Users

+----+--------+----------------------+-----+--------+
| id | name   | email                | age | city   |
+----+--------+----------------------+-----+--------+
| 1  | Rahul  | rahul@example.com    | 25  | Delhi  |
| 2  | Priya  | priya@example.com    | 24  | Pune   |
| 3  | Aman   | aman@example.com     | 28  | Noida  |
+----+--------+----------------------+-----+--------+`,
  },
  {
    id: "dbms",
    short: "DBMS",
    title: "2. What is a DBMS?",
    icon: Server,
    description:
      "A Database Management System is the software layer responsible for interacting with the physical database and providing controlled access to applications.",
    bullets: [
      "Stores and retrieves data.",
      "Executes SQL queries.",
      "Manages transactions.",
      "Controls concurrent access.",
      "Provides authentication and authorization.",
      "Maintains indexes.",
      "Supports backup and recovery.",
      "Maintains integrity constraints.",
    ],
    codeTitle: "DBMS architecture",
    code: `Client / Application
        |
        v
+--------------------+
|        DBMS        |
|--------------------|
| SQL Parser         |
| Query Optimizer    |
| Execution Engine   |
| Transaction Manager|
| Buffer Manager     |
| Storage Manager    |
+--------------------+
        |
        v
+--------------------+
| Database Storage   |
+--------------------+`,
  },
  {
    id: "rdbms",
    short: "RDBMS",
    title: "3. What is an RDBMS?",
    icon: Table2,
    description:
      "A Relational Database Management System stores data inside tables and represents relationships using keys.",
    bullets: [
      "Data is organized into tables.",
      "Each table contains rows and columns.",
      "Primary keys uniquely identify rows.",
      "Foreign keys create relationships.",
      "SQL is normally used to query relational databases.",
      "Relationships can be one-to-one, one-to-many or many-to-many.",
    ],
    codeTitle: "Relationship example",
    code: `users
+----+--------+
| id | name   |
+----+--------+
| 1  | Rahul  |
| 2  | Priya  |
+----+--------+

orders
+------+---------+--------+
| id   | user_id | amount |
+------+---------+--------+
| 1001 | 1       | 799.00 |
| 1002 | 1       | 499.00 |
| 1003 | 2       | 999.00 |
+------+---------+--------+

users.id
    |
    +----------< orders.user_id`,
  },
  {
    id: "sql-vs-database",
    short: "SQL vs DB",
    title: "4. SQL vs MySQL vs PostgreSQL",
    icon: Layers3,
    description:
      "SQL is a language. MySQL, PostgreSQL, Oracle Database and SQL Server are database management systems that implement SQL.",
    bullets: [
      "SQL = Structured Query Language.",
      "MySQL = relational database system.",
      "PostgreSQL = relational/object-relational database system.",
      "SQL Server = Microsoft's relational database system.",
      "Oracle Database = enterprise relational database system.",
      "SQLite = embedded relational database engine.",
      "Syntax and advanced features can differ slightly between database engines.",
    ],
    codeTitle: "Relationship",
    code: `SQL
 |
 +-- MySQL
 |
 +-- PostgreSQL
 |
 +-- SQL Server
 |
 +-- Oracle Database
 |
 +-- SQLite`,
  },
  {
    id: "terminology",
    short: "Terminology",
    title: "5. Important Database Terminology",
    icon: BookOpen,
    description:
      "Understanding database terminology makes schema design and SQL discussions much easier.",
    bullets: [
      "Database: organized collection of data.",
      "Schema: logical structure describing database objects.",
      "Table: collection of related rows.",
      "Row / Tuple / Record: one complete entry.",
      "Column / Attribute: one property of an entity.",
      "Constraint: rule enforced on stored data.",
      "Query: instruction for reading or manipulating data.",
      "Primary Key: uniquely identifies a row.",
      "Foreign Key: references a key in another table.",
      "Candidate Key: column or column set capable of uniquely identifying rows.",
      "Super Key: any column set capable of uniquely identifying rows.",
      "Alternate Key: candidate key not selected as primary key.",
      "Composite Key: key made from multiple columns.",
      "Natural Key: real-world value used as a key.",
      "Surrogate Key: artificial key such as an auto-generated ID.",
    ],
    codeTitle: "Example",
    code: `CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL
);`,
  },
  {
    id: "data-types",
    short: "Data Types",
    title: "6. SQL Data Types",
    icon: FileCode2,
    description:
      "Selecting appropriate data types improves storage efficiency, validation and query performance.",
    bullets: [
      "INT / INTEGER: regular integer values.",
      "BIGINT: very large integer values.",
      "SMALLINT: smaller integer range.",
      "DECIMAL / NUMERIC: exact decimal arithmetic.",
      "FLOAT / DOUBLE: approximate floating-point values.",
      "CHAR: fixed-length strings.",
      "VARCHAR: variable-length strings.",
      "TEXT: long textual content.",
      "DATE: calendar date.",
      "TIME: time of day.",
      "TIMESTAMP / DATETIME: date and time.",
      "BOOLEAN: true/false values.",
      "JSON / JSONB: semi-structured JSON data where supported.",
    ],
    codeTitle: "Data type example",
    code: `CREATE TABLE products (
    id BIGINT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`,
  },
  {
    id: "create-database-table",
    short: "CREATE",
    title: "7. Creating Databases and Tables",
    icon: Database,
    description:
      "DDL commands such as CREATE define the database structure.",
    bullets: [
      "CREATE DATABASE creates a database.",
      "CREATE TABLE creates a table.",
      "Columns require names and data types.",
      "Constraints can be defined during table creation.",
      "Defaults can automatically assign values.",
    ],
    codeTitle: "Create database and table",
    code: `CREATE DATABASE targettrek;

CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    age INT,
    city VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`,
  },
  {
    id: "sql-command-types",
    short: "SQL Types",
    title: "8. SQL Command Categories",
    icon: Workflow,
    description:
      "SQL commands are commonly categorized according to what they do.",
    bullets: [
      "DDL — Data Definition Language: CREATE, ALTER, DROP, TRUNCATE.",
      "DML — Data Manipulation Language: INSERT, UPDATE, DELETE.",
      "DQL — Data Query Language: SELECT.",
      "DCL — Data Control Language: GRANT, REVOKE.",
      "TCL — Transaction Control Language: COMMIT, ROLLBACK, SAVEPOINT.",
    ],
    codeTitle: "SQL categories",
    code: `SQL
├── DDL
│   ├── CREATE
│   ├── ALTER
│   ├── DROP
│   └── TRUNCATE
│
├── DML
│   ├── INSERT
│   ├── UPDATE
│   └── DELETE
│
├── DQL
│   └── SELECT
│
├── DCL
│   ├── GRANT
│   └── REVOKE
│
└── TCL
    ├── COMMIT
    ├── ROLLBACK
    └── SAVEPOINT`,
  },
  {
    id: "insert",
    short: "INSERT",
    title: "9. INSERT",
    icon: Code2,
    description:
      "INSERT adds new rows to a table.",
    bullets: [
      "Specify the columns explicitly whenever possible.",
      "Multiple rows can be inserted in one statement.",
      "Columns with defaults may be omitted.",
      "Required NOT NULL columns must receive values unless defaults exist.",
      "Unique constraints may reject duplicate values.",
    ],
    codeTitle: "INSERT examples",
    code: `INSERT INTO users (
    id,
    name,
    email,
    age,
    city
)
VALUES (
    1,
    'Rahul',
    'rahul@example.com',
    25,
    'Delhi'
);

INSERT INTO users (id, name, email, age, city)
VALUES
    (2, 'Priya', 'priya@example.com', 24, 'Pune'),
    (3, 'Aman', 'aman@example.com', 28, 'Noida');`,
  },
  {
    id: "select",
    short: "SELECT",
    title: "10. SELECT",
    icon: Search,
    description:
      "SELECT retrieves data from one or more tables.",
    bullets: [
      "SELECT * returns all columns.",
      "Selecting only required columns usually reduces unnecessary data transfer.",
      "Aliases make query output easier to understand.",
      "SELECT expressions can perform calculations.",
    ],
    codeTitle: "SELECT examples",
    code: `SELECT *
FROM users;

SELECT name, email
FROM users;

SELECT
    name AS user_name,
    email AS user_email
FROM users;

SELECT
    name,
    age,
    age + 1 AS age_next_year
FROM users;`,
  },
  {
    id: "where",
    short: "WHERE",
    title: "11. WHERE Clause",
    icon: ListFilter,
    description:
      "WHERE filters rows before they are returned or modified.",
    bullets: [
      "= means equal.",
      "<> or != means not equal.",
      "> and < compare values.",
      ">= and <= include equality.",
      "AND requires all conditions to be true.",
      "OR requires at least one condition to be true.",
      "NOT reverses a condition.",
    ],
    codeTitle: "Filtering data",
    code: `SELECT *
FROM users
WHERE age > 25;

SELECT *
FROM users
WHERE age >= 18
  AND city = 'Delhi';

SELECT *
FROM users
WHERE city = 'Delhi'
   OR city = 'Pune';

SELECT *
FROM users
WHERE NOT city = 'Delhi';`,
  },
  {
    id: "operator-precedence",
    short: "Precedence",
    title: "12. SQL Operator Precedence",
    icon: AlertTriangle,
    description:
      "AND normally has higher precedence than OR, which can create unexpected results.",
    bullets: [
      "Use parentheses when combining AND and OR.",
      "Do not depend on readers remembering operator precedence.",
      "Explicit conditions make production queries safer.",
    ],
    codeTitle: "Precedence example",
    code: `-- Potentially confusing
SELECT *
FROM users
WHERE city = 'Delhi'
   OR city = 'Mumbai'
  AND age > 25;

-- Clear intention
SELECT *
FROM users
WHERE (
        city = 'Delhi'
        OR city = 'Mumbai'
      )
  AND age > 25;`,
  },
  {
    id: "in-operator",
    short: "IN",
    title: "13. IN and NOT IN",
    icon: Code2,
    description:
      "IN compares a value against a list of possible values.",
    bullets: [
      "IN is cleaner than writing many OR conditions.",
      "NOT IN excludes values.",
      "NOT IN can behave unexpectedly when the subquery contains NULL.",
      "NOT EXISTS is often safer for anti-join logic.",
    ],
    codeTitle: "IN examples",
    code: `SELECT *
FROM users
WHERE city IN ('Delhi', 'Pune', 'Mumbai');

SELECT *
FROM users
WHERE city NOT IN ('Delhi', 'Pune');`,
  },
  {
    id: "between",
    short: "BETWEEN",
    title: "14. BETWEEN",
    icon: Code2,
    description:
      "BETWEEN checks whether a value falls inside an inclusive range.",
    bullets: [
      "The lower boundary is included.",
      "The upper boundary is included.",
      "Can be used with numbers, dates and comparable values.",
    ],
    codeTitle: "BETWEEN example",
    code: `SELECT *
FROM products
WHERE price BETWEEN 500 AND 1000;

-- Equivalent
SELECT *
FROM products
WHERE price >= 500
  AND price <= 1000;`,
  },
  {
    id: "like",
    short: "LIKE",
    title: "15. LIKE and Pattern Matching",
    icon: Search,
    description:
      "LIKE performs simple text pattern matching.",
    bullets: [
      "% matches zero or more characters.",
      "_ matches exactly one character.",
      "Prefix searches may use indexes more effectively than patterns beginning with %.",
    ],
    codeTitle: "LIKE examples",
    code: `-- Starts with A
SELECT *
FROM users
WHERE name LIKE 'A%';

-- Ends with a
SELECT *
FROM users
WHERE name LIKE '%a';

-- Contains dev
SELECT *
FROM users
WHERE name LIKE '%dev%';

-- Exactly one wildcard character
SELECT *
FROM users
WHERE name LIKE 'R_hul';`,
  },
  {
    id: "null",
    short: "NULL",
    title: "16. NULL and Three-Valued Logic",
    icon: AlertTriangle,
    description:
      "NULL represents an unknown or missing value. It is not the same as zero or an empty string.",
    bullets: [
      "Use IS NULL instead of = NULL.",
      "Use IS NOT NULL instead of != NULL.",
      "Comparisons with NULL usually produce UNKNOWN.",
      "SQL conditions operate using TRUE, FALSE and UNKNOWN.",
      "UNKNOWN rows are normally excluded by WHERE.",
    ],
    codeTitle: "NULL examples",
    code: `-- Wrong
SELECT *
FROM users
WHERE phone = NULL;

-- Correct
SELECT *
FROM users
WHERE phone IS NULL;

SELECT *
FROM users
WHERE phone IS NOT NULL;

-- Useful replacement
SELECT
    name,
    COALESCE(phone, 'Not provided') AS phone
FROM users;`,
  },
  {
    id: "distinct",
    short: "DISTINCT",
    title: "17. DISTINCT",
    icon: Layers3,
    description:
      "DISTINCT removes duplicate rows from a result set.",
    bullets: [
      "Can be used with one or multiple selected columns.",
      "Removing duplicates may require sorting or hashing.",
      "Do not use DISTINCT merely to hide incorrect joins.",
    ],
    codeTitle: "DISTINCT example",
    code: `SELECT DISTINCT city
FROM users;

SELECT DISTINCT city, age
FROM users;`,
  },
  {
    id: "order-by",
    short: "ORDER BY",
    title: "18. ORDER BY",
    icon: ListFilter,
    description:
      "ORDER BY controls the sorting of the final result.",
    bullets: [
      "ASC sorts ascending.",
      "DESC sorts descending.",
      "Multiple columns can participate in sorting.",
      "A stable secondary sort is useful for pagination.",
    ],
    codeTitle: "Sorting examples",
    code: `SELECT *
FROM users
ORDER BY age ASC;

SELECT *
FROM users
ORDER BY age DESC;

SELECT *
FROM users
ORDER BY city ASC, age DESC;

SELECT *
FROM orders
ORDER BY created_at DESC, id DESC;`,
  },
  {
    id: "limit-offset",
    short: "Pagination",
    title: "19. LIMIT, OFFSET and Keyset Pagination",
    icon: Gauge,
    description:
      "LIMIT restricts result size while OFFSET skips rows. For very large datasets, cursor/keyset pagination usually scales better.",
    bullets: [
      "LIMIT controls page size.",
      "OFFSET skips a number of rows.",
      "Large offsets may become expensive because rows still need to be located or scanned.",
      "Keyset pagination uses the last seen indexed value.",
      "Keyset pagination also handles frequently changing data more predictably.",
    ],
    codeTitle: "Pagination examples",
    code: `-- OFFSET pagination
SELECT *
FROM products
ORDER BY id
LIMIT 20 OFFSET 40;

-- Keyset pagination
SELECT *
FROM products
WHERE id > 500
ORDER BY id
LIMIT 20;

-- Composite cursor
SELECT *
FROM orders
WHERE
    created_at < '2026-09-30 10:00:00'
    OR (
        created_at = '2026-09-30 10:00:00'
        AND id < 5000
    )
ORDER BY created_at DESC, id DESC
LIMIT 20;`,
  },
  {
    id: "update",
    short: "UPDATE",
    title: "20. UPDATE",
    icon: Code2,
    description:
      "UPDATE modifies existing rows.",
    bullets: [
      "Use WHERE to control which rows are updated.",
      "Multiple columns can be modified together.",
      "A missing WHERE condition can update every row.",
      "Critical updates should often run inside a transaction.",
    ],
    codeTitle: "UPDATE examples",
    code: `UPDATE users
SET age = 26
WHERE id = 1;

UPDATE products
SET
    price = 899.00,
    updated_at = CURRENT_TIMESTAMP
WHERE id = 100;

-- Dangerous: updates every row
UPDATE users
SET active = FALSE;`,
  },
  {
    id: "delete",
    short: "DELETE",
    title: "21. DELETE",
    icon: AlertTriangle,
    description:
      "DELETE removes selected rows from a table.",
    bullets: [
      "WHERE determines which rows are deleted.",
      "Without WHERE, every row can be removed.",
      "Foreign keys may block deletion or perform cascading actions.",
      "Soft deletion is sometimes used when historical records must remain available.",
    ],
    codeTitle: "DELETE examples",
    code: `DELETE FROM users
WHERE id = 5;

DELETE FROM sessions
WHERE expires_at < CURRENT_TIMESTAMP;

-- Dangerous
DELETE FROM users;`,
  },
  {
    id: "delete-truncate-drop",
    short: "DELETE vs DROP",
    title: "22. DELETE vs TRUNCATE vs DROP",
    icon: Table2,
    description:
      "These commands all remove something, but they operate at different levels.",
    bullets: [
      "DELETE removes rows and can normally use WHERE.",
      "TRUNCATE quickly removes all table rows while keeping the table structure.",
      "DROP removes the table object itself.",
      "Locking, identity reset and transaction behaviour can vary by database engine.",
    ],
    codeTitle: "Examples",
    code: `DELETE FROM users
WHERE active = FALSE;

TRUNCATE TABLE temp_imports;

DROP TABLE old_logs;`,
  },
  {
    id: "alter-table",
    short: "ALTER",
    title: "23. ALTER TABLE",
    icon: Table2,
    description:
      "ALTER changes an existing table structure.",
    bullets: [
      "Add columns.",
      "Drop columns.",
      "Rename columns.",
      "Change data types.",
      "Add or remove constraints.",
      "Large schema changes must be planned carefully on production tables.",
    ],
    codeTitle: "ALTER examples",
    code: `ALTER TABLE users
ADD COLUMN phone VARCHAR(20);

ALTER TABLE users
ADD COLUMN active BOOLEAN DEFAULT TRUE;

ALTER TABLE users
DROP COLUMN phone;

ALTER TABLE users
ADD CONSTRAINT users_email_unique
UNIQUE (email);`,
  },
  {
    id: "constraints",
    short: "Constraints",
    title: "24. SQL Constraints",
    icon: ShieldCheck,
    description:
      "Constraints protect the correctness and integrity of stored data.",
    bullets: [
      "NOT NULL prevents missing values.",
      "UNIQUE prevents duplicate values.",
      "PRIMARY KEY uniquely identifies every row.",
      "FOREIGN KEY maintains relationships.",
      "CHECK validates a condition.",
      "DEFAULT supplies a value when none is provided.",
    ],
    codeTitle: "Constraint example",
    code: `CREATE TABLE employees (
    id BIGINT PRIMARY KEY,

    email VARCHAR(255)
        UNIQUE
        NOT NULL,

    name VARCHAR(100)
        NOT NULL,

    age INT
        CHECK (age >= 18),

    status VARCHAR(20)
        DEFAULT 'ACTIVE',

    department_id BIGINT,

    CONSTRAINT fk_department
        FOREIGN KEY (department_id)
        REFERENCES departments(id)
);`,
  },
];

const advancedSections = [
  {
    id: "aggregate-functions",
    title: "25. Aggregate Functions",
    icon: Gauge,
    text: "Aggregate functions calculate one result from a set of rows.",
    code: `SELECT COUNT(*) FROM orders;

SELECT SUM(amount) FROM orders;

SELECT AVG(amount) FROM orders;

SELECT MIN(amount) FROM orders;

SELECT MAX(amount) FROM orders;

SELECT COUNT(DISTINCT user_id)
FROM orders;`,
    notes: [
      "COUNT(*) counts rows.",
      "COUNT(column) does not count NULL values.",
      "SUM calculates the total.",
      "AVG calculates the arithmetic mean.",
      "MIN and MAX return smallest/largest values.",
      "DISTINCT can be used inside aggregates.",
    ],
  },
  {
    id: "group-by",
    title: "26. GROUP BY and HAVING",
    icon: Layers3,
    text: "GROUP BY creates groups of rows so aggregate calculations can be performed per group.",
    code: `SELECT
    city,
    COUNT(*) AS total_users
FROM users
GROUP BY city;

SELECT
    user_id,
    COUNT(*) AS order_count,
    SUM(amount) AS total_spent
FROM orders
GROUP BY user_id;

SELECT
    user_id,
    SUM(amount) AS total_spent
FROM orders
GROUP BY user_id
HAVING SUM(amount) > 10000;`,
    notes: [
      "WHERE filters rows before grouping.",
      "GROUP BY creates groups.",
      "HAVING filters groups after aggregation.",
      "Columns selected without aggregation generally need to appear in GROUP BY.",
    ],
  },
  {
    id: "query-execution-order",
    title: "27. Logical SQL Query Execution Order",
    icon: Workflow,
    text: "SQL is written in one order but conceptually processed in another logical order.",
    code: `SELECT        -- 5
    department_id,
    COUNT(*) AS total
FROM employees -- 1
WHERE active = TRUE -- 2
GROUP BY department_id -- 3
HAVING COUNT(*) > 5 -- 4
ORDER BY total DESC -- 6
LIMIT 10; -- 7`,
    notes: [
      "FROM",
      "JOIN / ON",
      "WHERE",
      "GROUP BY",
      "HAVING",
      "SELECT",
      "DISTINCT",
      "ORDER BY",
      "LIMIT / OFFSET",
    ],
  },
  {
    id: "joins",
    title: "28. SQL Joins",
    icon: Network,
    text: "Joins combine rows from multiple tables using related columns.",
    code: `-- INNER JOIN
SELECT
    u.name,
    o.id AS order_id,
    o.amount
FROM users u
INNER JOIN orders o
    ON o.user_id = u.id;

-- LEFT JOIN
SELECT
    u.name,
    o.id AS order_id
FROM users u
LEFT JOIN orders o
    ON o.user_id = u.id;

-- Find users with no orders
SELECT
    u.id,
    u.name
FROM users u
LEFT JOIN orders o
    ON o.user_id = u.id
WHERE o.id IS NULL;`,
    notes: [
      "INNER JOIN returns only matching rows.",
      "LEFT JOIN returns all rows from the left table plus matches.",
      "RIGHT JOIN returns all rows from the right table plus matches.",
      "FULL OUTER JOIN returns matched and unmatched rows from both sides.",
      "CROSS JOIN returns every possible combination.",
      "SELF JOIN joins a table with itself.",
    ],
  },
  {
    id: "self-join",
    title: "29. Self Join",
    icon: Network,
    text: "A self join is useful when rows in the same table relate to one another, such as employees and managers.",
    code: `CREATE TABLE employees (
    id BIGINT PRIMARY KEY,
    name VARCHAR(100),
    manager_id BIGINT
);

SELECT
    employee.name AS employee,
    manager.name AS manager
FROM employees employee
LEFT JOIN employees manager
    ON employee.manager_id = manager.id;`,
    notes: [
      "The same table appears more than once.",
      "Aliases distinguish each logical copy.",
      "Common use cases include hierarchical relationships.",
    ],
  },
  {
    id: "cross-join",
    title: "30. CROSS JOIN",
    icon: Network,
    text: "CROSS JOIN creates the Cartesian product of two tables.",
    code: `SELECT
    colors.name,
    sizes.name
FROM colors
CROSS JOIN sizes;`,
    notes: [
      "If one table contains 4 rows and another contains 3, the result contains 12 rows.",
      "Useful for generating combinations.",
      "Accidental Cartesian products can create huge result sets.",
    ],
  },
  {
    id: "set-operations",
    title: "31. UNION, UNION ALL, INTERSECT and EXCEPT",
    icon: Layers3,
    text: "Set operators combine the result sets of independent SELECT statements.",
    code: `SELECT email
FROM customers

UNION

SELECT email
FROM newsletter_users;

SELECT email
FROM customers

UNION ALL

SELECT email
FROM newsletter_users;

SELECT email FROM customers
INTERSECT
SELECT email FROM newsletter_users;

SELECT email FROM customers
EXCEPT
SELECT email FROM newsletter_users;`,
    notes: [
      "UNION removes duplicates.",
      "UNION ALL keeps duplicates and is usually cheaper.",
      "INTERSECT returns values present in both results.",
      "EXCEPT returns values found in the first query but not the second.",
      "Database support and syntax can vary.",
    ],
  },
  {
    id: "subqueries",
    title: "32. Subqueries",
    icon: Code2,
    text: "A subquery is a query embedded inside another SQL statement.",
    code: `SELECT *
FROM products
WHERE price > (
    SELECT AVG(price)
    FROM products
);

SELECT *
FROM users
WHERE id IN (
    SELECT user_id
    FROM orders
    WHERE amount > 5000
);`,
    notes: [
      "Scalar subqueries return a single value.",
      "Multi-row subqueries return multiple values.",
      "Subqueries can appear in SELECT, FROM, WHERE and HAVING depending on the database.",
      "A join may sometimes be easier to optimize or understand.",
    ],
  },
  {
    id: "correlated-subqueries",
    title: "33. Correlated Subqueries",
    icon: Code2,
    text: "A correlated subquery references columns from the outer query.",
    code: `SELECT
    u.id,
    u.name
FROM users u
WHERE EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.user_id = u.id
      AND o.amount > 5000
);`,
    notes: [
      "The inner query depends on the current outer row.",
      "EXISTS is frequently used with correlated subqueries.",
      "Indexes on correlation columns are important.",
    ],
  },
  {
    id: "exists",
    title: "34. EXISTS and NOT EXISTS",
    icon: Search,
    text: "EXISTS checks whether a subquery returns at least one matching row.",
    code: `SELECT *
FROM users u
WHERE EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.user_id = u.id
);

SELECT *
FROM users u
WHERE NOT EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.user_id = u.id
);`,
    notes: [
      "EXISTS is useful when only existence matters.",
      "NOT EXISTS is commonly used for anti-joins.",
      "It avoids several NULL-related problems associated with NOT IN.",
    ],
  },
  {
    id: "cte",
    title: "35. Common Table Expressions — CTE",
    icon: Layers3,
    text: "A CTE creates a named temporary result that can make complex queries easier to read.",
    code: `WITH high_value_orders AS (
    SELECT
        id,
        user_id,
        amount
    FROM orders
    WHERE amount >= 5000
)
SELECT
    u.name,
    h.amount
FROM high_value_orders h
JOIN users u
    ON u.id = h.user_id;`,
    notes: [
      "Created using WITH.",
      "Improves readability.",
      "Can break complex queries into logical stages.",
      "Optimizer behaviour differs between database engines and versions.",
    ],
  },
  {
    id: "recursive-cte",
    title: "36. Recursive CTE",
    icon: Workflow,
    text: "Recursive CTEs can traverse hierarchical data such as employee hierarchies, categories or folder trees.",
    code: `WITH RECURSIVE employee_tree AS (
    SELECT
        id,
        name,
        manager_id,
        1 AS level
    FROM employees
    WHERE manager_id IS NULL

    UNION ALL

    SELECT
        e.id,
        e.name,
        e.manager_id,
        tree.level + 1
    FROM employees e
    JOIN employee_tree tree
        ON e.manager_id = tree.id
)
SELECT *
FROM employee_tree;`,
    notes: [
      "Contains an anchor query.",
      "Contains a recursive query.",
      "Recursion stops when no additional rows are produced.",
      "Useful for tree-like structures.",
    ],
  },
  {
    id: "case",
    title: "37. CASE Expression",
    icon: Code2,
    text: "CASE provides conditional logic inside SQL queries.",
    code: `SELECT
    name,
    price,
    CASE
        WHEN price >= 5000 THEN 'Premium'
        WHEN price >= 1000 THEN 'Mid Range'
        ELSE 'Budget'
    END AS price_category
FROM products;`,
    notes: [
      "Comparable to if/else logic.",
      "Can be used in SELECT, ORDER BY and other expressions.",
      "Useful for categorization and conditional aggregation.",
    ],
  },
  {
    id: "string-functions",
    title: "38. String Functions",
    icon: Code2,
    text: "SQL databases provide functions for manipulating textual values.",
    code: `SELECT UPPER(name)
FROM users;

SELECT LOWER(email)
FROM users;

SELECT LENGTH(name)
FROM users;

SELECT CONCAT(first_name, ' ', last_name)
FROM users;

SELECT TRIM(name)
FROM users;

SELECT SUBSTRING(name, 1, 3)
FROM users;`,
    notes: [
      "UPPER / LOWER change case.",
      "LENGTH returns string length.",
      "CONCAT combines strings.",
      "TRIM removes unwanted whitespace.",
      "SUBSTRING extracts part of a string.",
      "Exact names can differ by database engine.",
    ],
  },
  {
    id: "numeric-functions",
    title: "39. Numeric Functions",
    icon: Code2,
    text: "Numeric functions perform calculations and transformations.",
    code: `SELECT ROUND(99.876, 2);

SELECT ABS(-100);

SELECT CEIL(10.2);

SELECT FLOOR(10.9);

SELECT POWER(2, 10);`,
    notes: [
      "ROUND controls decimal precision.",
      "ABS returns absolute value.",
      "CEIL rounds upward.",
      "FLOOR rounds downward.",
      "POWER performs exponentiation.",
    ],
  },
  {
    id: "date-functions",
    title: "40. Date and Time",
    icon: Code2,
    text: "Date functions are essential for analytics, reports and application logic.",
    code: `SELECT CURRENT_DATE;

SELECT CURRENT_TIMESTAMP;

-- PostgreSQL example
SELECT NOW();

SELECT *
FROM orders
WHERE created_at >= CURRENT_DATE;

-- PostgreSQL example
SELECT
    created_at,
    created_at + INTERVAL '7 days'
FROM orders;`,
    notes: [
      "Store timestamps consistently.",
      "Timezone strategy should be defined at the application level.",
      "Date syntax varies more between SQL engines than basic SELECT syntax.",
    ],
  },
  {
    id: "coalesce",
    title: "41. COALESCE and NULL Handling",
    icon: Code2,
    text: "COALESCE returns the first non-NULL expression.",
    code: `SELECT
    name,
    COALESCE(phone, alternate_phone, 'No phone') AS phone
FROM users;

SELECT
    product_id,
    COALESCE(discount, 0) AS discount
FROM products;`,
    notes: [
      "Useful for default presentation values.",
      "Accepts multiple arguments.",
      "Stops at the first non-NULL value.",
    ],
  },
  {
    id: "window-functions",
    title: "42. Window Functions",
    icon: Gauge,
    text: "Window functions calculate values across related rows without collapsing them into a single grouped row.",
    code: `SELECT
    employee_id,
    department_id,
    salary,
    AVG(salary) OVER (
        PARTITION BY department_id
    ) AS department_avg_salary
FROM employees;`,
    notes: [
      "OVER defines the window.",
      "PARTITION BY creates logical groups.",
      "ORDER BY inside OVER determines calculation order.",
      "Unlike GROUP BY, individual rows remain visible.",
    ],
  },
  {
    id: "row-number-rank",
    title: "43. ROW_NUMBER, RANK and DENSE_RANK",
    icon: Gauge,
    text: "Ranking window functions are among the most important SQL interview topics.",
    code: `SELECT
    employee_id,
    department_id,
    salary,

    ROW_NUMBER() OVER (
        PARTITION BY department_id
        ORDER BY salary DESC
    ) AS row_num,

    RANK() OVER (
        PARTITION BY department_id
        ORDER BY salary DESC
    ) AS salary_rank,

    DENSE_RANK() OVER (
        PARTITION BY department_id
        ORDER BY salary DESC
    ) AS dense_salary_rank

FROM employees;`,
    notes: [
      "ROW_NUMBER always produces unique sequential numbers.",
      "RANK gives equal values the same rank and leaves gaps.",
      "DENSE_RANK gives equal values the same rank without gaps.",
    ],
  },
  {
    id: "lag-lead",
    title: "44. LAG and LEAD",
    icon: Gauge,
    text: "LAG accesses a previous row and LEAD accesses a following row in a window.",
    code: `SELECT
    order_date,
    revenue,

    LAG(revenue) OVER (
        ORDER BY order_date
    ) AS previous_revenue,

    LEAD(revenue) OVER (
        ORDER BY order_date
    ) AS next_revenue

FROM daily_revenue;`,
    notes: [
      "Useful for growth calculations.",
      "Useful for comparing current and previous records.",
      "Avoids many self-joins.",
    ],
  },
  {
    id: "running-total",
    title: "45. Running Totals",
    icon: Gauge,
    text: "Window frames can calculate cumulative totals.",
    code: `SELECT
    order_date,
    amount,

    SUM(amount) OVER (
        ORDER BY order_date
        ROWS BETWEEN UNBOUNDED PRECEDING
        AND CURRENT ROW
    ) AS running_total

FROM orders;`,
    notes: [
      "Common in financial and analytics workloads.",
      "The window frame controls which rows participate.",
    ],
  },
];

const indexTypes = [
  [
    "B-Tree",
    "Equality, range, ORDER BY",
    "Most common general-purpose index",
  ],
  [
    "Hash",
    "Equality lookup",
    "Database support and limitations vary",
  ],
  [
    "Composite",
    "Multiple-column filters",
    "Column order matters",
  ],
  [
    "Unique",
    "Uniqueness + lookup",
    "Prevents duplicate indexed values",
  ],
  [
    "Partial / Filtered",
    "Subset of table",
    "Useful for highly targeted queries",
  ],
  [
    "Full-text",
    "Text search",
    "Better suited to natural text search",
  ],
  [
    "GIN / GiST",
    "PostgreSQL specialized workloads",
    "Arrays, JSONB, full-text, geometric data and more",
  ],
];

const isolationRows = [
  ["Read Uncommitted", "Possible", "Possible", "Possible"],
  ["Read Committed", "Prevented", "Possible", "Possible"],
  ["Repeatable Read", "Prevented", "Prevented*", "Engine dependent"],
  ["Serializable", "Prevented", "Prevented", "Prevented"],
];

const interviewQuestions = [
  "What is SQL and how is it different from MySQL?",
  "What is a primary key?",
  "Primary key vs unique key?",
  "What is a foreign key?",
  "What is a composite key?",
  "What is a candidate key?",
  "DELETE vs TRUNCATE vs DROP?",
  "WHERE vs HAVING?",
  "UNION vs UNION ALL?",
  "INNER JOIN vs LEFT JOIN?",
  "What is a CROSS JOIN?",
  "What is a SELF JOIN?",
  "What is normalization?",
  "Explain 1NF, 2NF, 3NF and BCNF.",
  "What is denormalization?",
  "What is an index?",
  "How does a B-Tree index work?",
  "When should you not create an index?",
  "What is a composite index?",
  "What is the leftmost-prefix concept?",
  "What is a covering index?",
  "Clustered vs non-clustered index?",
  "What is a transaction?",
  "Explain ACID.",
  "What is a dirty read?",
  "What is a non-repeatable read?",
  "What is a phantom read?",
  "Explain transaction isolation levels.",
  "Optimistic vs pessimistic locking?",
  "What is a database deadlock?",
  "How do you prevent deadlocks?",
  "What is a CTE?",
  "CTE vs subquery?",
  "What is a recursive CTE?",
  "What are window functions?",
  "ROW_NUMBER vs RANK vs DENSE_RANK?",
  "What are LAG and LEAD?",
  "What is a correlated subquery?",
  "IN vs EXISTS?",
  "NOT IN vs NOT EXISTS?",
  "What is a view?",
  "View vs materialized view?",
  "What does EXPLAIN do?",
  "What is a query execution plan?",
  "Why can SELECT * be inefficient?",
  "OFFSET vs cursor pagination?",
  "What is SQL injection?",
  "How do prepared statements prevent SQL injection?",
  "Partitioning vs sharding?",
  "SQL vs NoSQL — when would you choose each?",
];

const practiceQuestions = [
  "Find the second-highest salary.",
  "Find the Nth-highest salary.",
  "Find duplicate emails.",
  "Delete duplicate rows while keeping one.",
  "Find employees earning more than their manager.",
  "Find the top 3 salaries in every department.",
  "Find users who never placed an order.",
  "Find customers who placed more than 5 orders.",
  "Calculate monthly revenue.",
  "Calculate month-over-month revenue growth.",
  "Find the most frequently purchased product.",
  "Find consecutive login dates.",
  "Calculate a running total.",
  "Find records that appear three consecutive times.",
  "Find the latest order for every customer.",
  "Find the first order for every customer.",
  "Find products priced above their category average.",
  "Find departments whose average salary is above company average.",
];

function CodeBlock({ title = "SQL", children, dark }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className={`overflow-hidden rounded-2xl border ${
        dark
          ? "border-slate-700 bg-[#0b1120]"
          : "border-slate-200 bg-slate-950"
      }`}
    >
      <div className="flex items-center justify-between border-b border-slate-700/80 px-4 py-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
          <TerminalSquare size={15} />
          {title}
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
          aria-label={`Copy ${title} code`}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <pre className="max-w-full overflow-x-auto p-4 text-[13px] leading-6 text-slate-200 sm:p-5 sm:text-sm">
        <code>{children}</code>
      </pre>
    </div>
  );
}

function Callout({ children, type = "info", dark }) {
  const config = {
    info: {
      icon: Lightbulb,
      light: "border-blue-200 bg-blue-50 text-blue-950",
      dark: "border-blue-900/60 bg-blue-950/30 text-blue-100",
    },
    warning: {
      icon: AlertTriangle,
      light: "border-amber-200 bg-amber-50 text-amber-950",
      dark: "border-amber-900/60 bg-amber-950/20 text-amber-100",
    },
    success: {
      icon: Check,
      light: "border-emerald-200 bg-emerald-50 text-emerald-950",
      dark: "border-emerald-900/60 bg-emerald-950/20 text-emerald-100",
    },
  };

  const item = config[type] || config.info;
  const Icon = item.icon;

  return (
    <div
      className={`flex gap-3 rounded-2xl border p-4 text-sm leading-6 ${
        dark ? item.dark : item.light
      }`}
    >
      <Icon size={18} className="mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

function SectionTitle({
  number,
  title,
  description,
  icon: Icon = Database,
  dark,
}) {
  return (
    <div className="mb-6">
      <div
        className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${
          dark
            ? "bg-cyan-400/10 text-cyan-300"
            : "bg-cyan-50 text-cyan-700"
        }`}
      >
        <Icon size={21} />
      </div>

      <h2
        className={`text-2xl font-black tracking-tight sm:text-3xl ${
          dark ? "text-white" : "text-slate-950"
        }`}
      >
        {number ? `${number}. ` : ""}
        {title}
      </h2>

      {description && (
        <p
          className={`mt-3 max-w-4xl text-[15px] leading-7 sm:text-base ${
            dark ? "text-slate-300" : "text-slate-600"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}

function BulletList({ items, dark }) {
  return (
    <ul className="grid gap-2.5">
      {items.map((item) => (
        <li
          key={item}
          className={`flex gap-3 text-sm leading-6 sm:text-[15px] ${
            dark ? "text-slate-300" : "text-slate-700"
          }`}
        >
          <Check
            size={16}
            className={`mt-1 shrink-0 ${
              dark ? "text-emerald-400" : "text-emerald-600"
            }`}
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function ComparisonTable({ headers, rows, dark }) {
  return (
    <div
      className={`overflow-x-auto rounded-2xl border ${
        dark ? "border-slate-700" : "border-slate-200"
      }`}
    >
      <table className="min-w-full text-left text-sm">
        <thead className={dark ? "bg-slate-800" : "bg-slate-100"}>
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className={`whitespace-nowrap px-4 py-3 font-bold ${
                  dark ? "text-slate-100" : "text-slate-800"
                }`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={`${row.join("-")}-${rowIndex}`}
              className={`border-t ${
                dark
                  ? "border-slate-700 bg-slate-900/60"
                  : "border-slate-200 bg-white"
              }`}
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={`${cell}-${cellIndex}`}
                  className={`px-4 py-3 align-top leading-6 ${
                    dark ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ResourceCard({ section, dark }) {
  const Icon = section.icon;

  return (
    <section
      id={section.id}
      className={`scroll-mt-24 rounded-3xl border p-5 shadow-sm sm:p-7 ${
        dark
          ? "border-slate-800 bg-slate-900/80"
          : "border-slate-200 bg-white"
      }`}
    >
      <SectionTitle
        title={section.title.replace(/^\d+\.\s*/, "")}
        number={section.title.match(/^\d+/)?.[0]}
        description={section.description}
        icon={Icon}
        dark={dark}
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <BulletList items={section.bullets} dark={dark} />

        <CodeBlock title={section.codeTitle} dark={dark}>
          {section.code}
        </CodeBlock>
      </div>
    </section>
  );
}

function AdvancedCard({ section, dark }) {
  const Icon = section.icon;

  return (
    <section
      id={section.id}
      className={`scroll-mt-24 rounded-3xl border p-5 shadow-sm sm:p-7 ${
        dark
          ? "border-slate-800 bg-slate-900/80"
          : "border-slate-200 bg-white"
      }`}
    >
      <SectionTitle
        title={section.title.replace(/^\d+\.\s*/, "")}
        number={section.title.match(/^\d+/)?.[0]}
        description={section.text}
        icon={Icon}
        dark={dark}
      />

      <div className="grid gap-6 xl:grid-cols-[0.86fr_1.14fr]">
        <BulletList items={section.notes} dark={dark} />

        <CodeBlock dark={dark}>{section.code}</CodeBlock>
      </div>
    </section>
  );
}

export default function SQLResource() {
  const theme = useSyncedTheme();
  const dark = theme === "dark";

  const [query, setQuery] = useState("");

  const navigation = useMemo(
    () => [
      ...sqlSections.map((item) => ({
        id: item.id,
        title: item.short,
      })),
      ...advancedSections.map((item) => ({
        id: item.id,
        title: item.title.replace(/^\d+\.\s*/, ""),
      })),
      { id: "normalization", title: "Normalization" },
      { id: "relationships", title: "Relationships" },
      { id: "views", title: "Views" },
      { id: "indexes", title: "Indexes" },
      { id: "composite-index", title: "Composite Index" },
      { id: "explain", title: "EXPLAIN" },
      { id: "transactions", title: "Transactions" },
      { id: "acid", title: "ACID" },
      { id: "isolation", title: "Isolation Levels" },
      { id: "locking", title: "Locking" },
      { id: "deadlocks", title: "Deadlocks" },
      { id: "stored-procedures", title: "Stored Procedures" },
      { id: "triggers", title: "Triggers" },
      { id: "partitioning", title: "Partitioning" },
      { id: "sql-injection", title: "SQL Injection" },
      { id: "optimization", title: "Optimization" },
      { id: "schema-design", title: "Schema Design" },
      { id: "interview-queries", title: "Interview Queries" },
      { id: "interview-questions", title: "Interview Questions" },
      { id: "cheat-sheet", title: "Cheat Sheet" },
    ],
    []
  );

  const filteredNavigation = useMemo(() => {
    const clean = query.trim().toLowerCase();

    if (!clean) return navigation;

    return navigation.filter((item) =>
      item.title.toLowerCase().includes(clean)
    );
  }, [navigation, query]);

  const schema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline:
      "SQL Complete Guide - Beginner to Advanced SQL Interview Preparation",
    description:
      "Learn SQL from fundamentals to advanced topics including joins, subqueries, CTEs, window functions, normalization, indexes, transactions, ACID, locking, optimization and interview questions.",
    url: PAGE_URL,
    mainEntityOfPage: PAGE_URL,
    author: {
      "@type": "Organization",
      name: "Target Trek",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "Target Trek",
      url: SITE_URL,
    },
    about: [
      "SQL",
      "Database Management Systems",
      "Relational Databases",
      "SQL Interview Preparation",
      "Database Design",
    ],
    educationalLevel: [
      "Beginner",
      "Intermediate",
      "Advanced",
    ],
    learningResourceType: "Tutorial",
    inLanguage: "en",
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Target Trek",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Resources",
        item: `${SITE_URL}/resources`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "SQL Complete Guide",
        item: PAGE_URL,
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>
          SQL Complete Guide: Beginner to Advanced + Interview Questions | Target Trek
        </title>

        <meta
          name="description"
          content="Master SQL from beginner to advanced. Learn SQL queries, joins, subqueries, CTEs, window functions, indexes, normalization, ACID, transactions, locking, optimization and SQL interview questions."
        />

        <meta
          name="keywords"
          content="SQL tutorial, SQL complete guide, SQL interview questions, SQL joins, SQL queries, SQL window functions, SQL CTE, SQL indexes, database interview questions, DBMS, RDBMS, SQL for software engineers"
        />

        <meta name="author" content="Target Trek" />
        <meta name="robots" content="index, follow" />

        <link rel="canonical" href={PAGE_URL} />

        <meta
          property="og:title"
          content="SQL Complete Guide - Beginner to Advanced"
        />
        <meta
          property="og:description"
          content="A complete SQL resource covering fundamentals, advanced queries, database internals and interview preparation."
        />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:site_name" content="Target Trek" />

        <meta
          name="twitter:card"
          content="summary_large_image"
        />
        <meta
          name="twitter:title"
          content="SQL Complete Guide - Target Trek"
        />
        <meta
          name="twitter:description"
          content="Learn SQL from fundamentals to advanced database concepts and interview problems."
        />

        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>

        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>

      <div
        className={`min-h-screen mt-8 transition-colors duration-300 ${
          dark
            ? "bg-[#070b14] text-slate-100"
            : "bg-slate-50 text-slate-900"
        }`}
      >
        {/* Hero */}
        <header
          className={`border-b ${
            dark
              ? "border-slate-800 bg-slate-950"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
            <nav
              aria-label="Breadcrumb"
              className={`mb-6 flex flex-wrap items-center gap-2 text-sm ${
                dark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              <a href="/" className="hover:underline">
                Target Trek
              </a>

              <ChevronRight size={14} />

              <a href="/resources" className="hover:underline">
                Resources
              </a>

              <ChevronRight size={14} />

              <span className={dark ? "text-white" : "text-slate-900"}>
                SQL
              </span>
            </nav>

            <div className="max-w-4xl">
              <div
                className={`mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.15em] ${
                  dark
                    ? "border-cyan-900 bg-cyan-950/40 text-cyan-300"
                    : "border-cyan-200 bg-cyan-50 text-cyan-700"
                }`}
              >
                <Database size={14} />
                Target Trek SQL Resource
              </div>

              <h1
                className={`text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl ${
                  dark ? "text-white" : "text-slate-950"
                }`}
              >
                SQL Complete Guide
                <span
                  className={`mt-2 block ${
                    dark ? "text-cyan-300" : "text-cyan-700"
                  }`}
                >
                  Beginner to Advanced
                </span>
              </h1>

              <p
                className={`mt-6 max-w-3xl text-base leading-8 sm:text-lg ${
                  dark ? "text-slate-300" : "text-slate-600"
                }`}
              >
                Learn SQL from database fundamentals to advanced
                querying, indexing, transactions, locking, query
                optimization and real SQL interview problems. Every
                topic includes theory, examples and production-oriented
                explanations.
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                {[
                  "50+ Topics",
                  "SQL Examples",
                  "DBMS",
                  "Indexes",
                  "Transactions",
                  "Window Functions",
                  "Interview Prep",
                ].map((item) => (
                  <span
                    key={item}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                      dark
                        ? "border-slate-700 bg-slate-900 text-slate-300"
                        : "border-slate-200 bg-slate-50 text-slate-700"
                    }`}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* Learning flow */}
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div
            className={`rounded-3xl border p-5 sm:p-7 ${
              dark
                ? "border-slate-800 bg-slate-900/70"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <Workflow
                className={dark ? "text-cyan-300" : "text-cyan-700"}
              />

              <h2
                className={`text-xl font-black ${
                  dark ? "text-white" : "text-slate-950"
                }`}
              >
                Recommended learning path
              </h2>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              {[
                "Database Fundamentals",
                "Basic SQL",
                "Filtering",
                "Joins",
                "Aggregation",
                "Subqueries",
                "CTEs",
                "Window Functions",
                "Schema Design",
                "Indexes",
                "Transactions",
                "Locking",
                "Optimization",
                "Interview Problems",
              ].map((item, index, array) => (
                <React.Fragment key={item}>
                  <span
                    className={`rounded-xl px-3 py-2 text-xs font-semibold sm:text-sm ${
                      dark
                        ? "bg-slate-800 text-slate-200"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {item}
                  </span>

                  {index < array.length - 1 && (
                    <ArrowRight
                      size={14}
                      className={
                        dark ? "text-slate-600" : "text-slate-400"
                      }
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        <div className="mx-auto grid max-w-7xl gap-8 px-4 pb-16 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-8">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-20">
              <div
                className={`max-h-[calc(100vh-6rem)] overflow-hidden rounded-2xl border ${
                  dark
                    ? "border-slate-800 bg-slate-900"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="p-3">
                  <div
                    className={`flex items-center gap-2 rounded-xl border px-3 ${
                      dark
                        ? "border-slate-700 bg-slate-950"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <Search
                      size={15}
                      className={
                        dark ? "text-slate-500" : "text-slate-400"
                      }
                    />

                    <input
                      type="search"
                      value={query}
                      onChange={(event) =>
                        setQuery(event.target.value)
                      }
                      placeholder="Find topic..."
                      className={`w-full bg-transparent py-2.5 text-sm outline-none ${
                        dark
                          ? "text-white placeholder:text-slate-600"
                          : "text-slate-900 placeholder:text-slate-400"
                      }`}
                    />
                  </div>
                </div>

                <div className="max-h-[calc(100vh-10rem)] overflow-y-auto px-2 pb-3">
                  {filteredNavigation.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={`block rounded-lg px-3 py-2 text-[13px] transition ${
                        dark
                          ? "text-slate-400 hover:bg-slate-800 hover:text-white"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                      }`}
                    >
                      {item.title}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Content */}
          <main className="min-w-0 space-y-6">
            <Callout dark={dark}>
              <strong>How to use this resource:</strong> start from the
              beginning if you are new to SQL. If you are preparing for
              interviews, focus heavily on joins, GROUP BY, subqueries,
              CTEs, window functions, indexes, transactions, isolation
              levels and query optimization.
            </Callout>

            {sqlSections.map((section) => (
              <ResourceCard
                key={section.id}
                section={section}
                dark={dark}
              />
            ))}

            {advancedSections.map((section) => (
              <AdvancedCard
                key={section.id}
                section={section}
                dark={dark}
              />
            ))}

            {/* Normalization */}
            <section
              id="normalization"
              className={`scroll-mt-24 rounded-3xl border p-5 sm:p-7 ${
                dark
                  ? "border-slate-800 bg-slate-900/80"
                  : "border-slate-200 bg-white"
              }`}
            >
              <SectionTitle
                number="46"
                title="Database Normalization"
                description="Normalization organizes relational data to reduce redundancy and prevent data anomalies."
                icon={Layers3}
                dark={dark}
              />

              <div className="space-y-6">
                <ComparisonTable
                  dark={dark}
                  headers={["Form", "Requirement", "Main Goal"]}
                  rows={[
                    [
                      "1NF",
                      "Atomic values, no repeating groups",
                      "Remove multi-valued columns",
                    ],
                    [
                      "2NF",
                      "1NF + no partial dependency",
                      "Remove dependency on part of a composite key",
                    ],
                    [
                      "3NF",
                      "2NF + no transitive dependency",
                      "Non-key fields depend only on the key",
                    ],
                    [
                      "BCNF",
                      "Every determinant is a candidate key",
                      "Stronger dependency correctness",
                    ],
                  ]}
                />

                <CodeBlock title="Bad design" dark={dark}>
{`orders
----------------------------------------------------------
order_id | customer_name | customer_phone | products
----------------------------------------------------------
1        | Rahul         | 9999999999     | Book, Pen, Bag

Problems:
- products contains multiple values
- customer data repeats
- updates may create inconsistencies`}
                </CodeBlock>

                <CodeBlock title="Normalized design" dark={dark}>
{`customers
---------
id
name
phone

orders
---------
id
customer_id
created_at

products
---------
id
name
price

order_items
---------
order_id
product_id
quantity
price`}
                </CodeBlock>

                <Callout type="info" dark={dark}>
                  Normalization improves consistency, but highly
                  read-heavy systems sometimes intentionally
                  denormalize selected data to reduce expensive joins.
                </Callout>
              </div>
            </section>

            {/* Relationships */}
            <section
              id="relationships"
              className={`scroll-mt-24 rounded-3xl border p-5 sm:p-7 ${
                dark
                  ? "border-slate-800 bg-slate-900/80"
                  : "border-slate-200 bg-white"
              }`}
            >
              <SectionTitle
                number="47"
                title="Database Relationships"
                description="Relational databases model how entities are connected."
                icon={Network}
                dark={dark}
              />

              <div className="grid gap-4 md:grid-cols-3">
                {[
                  {
                    title: "One-to-One",
                    example: "User → UserProfile",
                  },
                  {
                    title: "One-to-Many",
                    example: "User → Orders",
                  },
                  {
                    title: "Many-to-Many",
                    example: "Students ↔ Courses",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className={`rounded-2xl border p-5 ${
                      dark
                        ? "border-slate-700 bg-slate-950"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <h3
                      className={`font-bold ${
                        dark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {item.title}
                    </h3>

                    <p
                      className={`mt-2 text-sm ${
                        dark ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      {item.example}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <CodeBlock title="Many-to-many design" dark={dark}>
{`CREATE TABLE students (
    id BIGINT PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE courses (
    id BIGINT PRIMARY KEY,
    title VARCHAR(150)
);

CREATE TABLE student_courses (
    student_id BIGINT,
    course_id BIGINT,

    PRIMARY KEY (student_id, course_id),

    FOREIGN KEY (student_id)
        REFERENCES students(id),

    FOREIGN KEY (course_id)
        REFERENCES courses(id)
);`}
                </CodeBlock>
              </div>
            </section>

            {/* Foreign key actions */}
            <section
              id="foreign-key-actions"
              className={`scroll-mt-24 rounded-3xl border p-5 sm:p-7 ${
                dark
                  ? "border-slate-800 bg-slate-900/80"
                  : "border-slate-200 bg-white"
              }`}
            >
              <SectionTitle
                number="48"
                title="Foreign Key Actions"
                description="Foreign keys can define what happens when referenced rows change."
                icon={KeyRound}
                dark={dark}
              />

              <BulletList
                dark={dark}
                items={[
                  "ON DELETE CASCADE — automatically deletes dependent rows.",
                  "ON DELETE SET NULL — replaces the foreign key with NULL.",
                  "RESTRICT / NO ACTION — blocks deletion when dependent rows exist.",
                  "ON UPDATE CASCADE — propagates referenced key updates.",
                  "Cascade rules should be used carefully in production systems.",
                ]}
              />

              <div className="mt-6">
                <CodeBlock dark={dark}>
{`CREATE TABLE orders (
    id BIGINT PRIMARY KEY,
    user_id BIGINT,

    CONSTRAINT fk_order_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);`}
                </CodeBlock>
              </div>
            </section>

            {/* Views */}
            <section
              id="views"
              className={`scroll-mt-24 rounded-3xl border p-5 sm:p-7 ${
                dark
                  ? "border-slate-800 bg-slate-900/80"
                  : "border-slate-200 bg-white"
              }`}
            >
              <SectionTitle
                number="49"
                title="Views and Materialized Views"
                description="A view stores a query definition. A materialized view stores the query result physically where supported."
                icon={Table2}
                dark={dark}
              />

              <ComparisonTable
                dark={dark}
                headers={[
                  "Feature",
                  "View",
                  "Materialized View",
                ]}
                rows={[
                  [
                    "Stores query",
                    "Yes",
                    "Yes",
                  ],
                  [
                    "Stores result data",
                    "Usually no",
                    "Yes",
                  ],
                  [
                    "Fresh data",
                    "Generally current",
                    "Needs refresh",
                  ],
                  [
                    "Read speed",
                    "Depends on base query",
                    "Often faster",
                  ],
                  [
                    "Use case",
                    "Abstraction / security",
                    "Expensive analytics",
                  ],
                ]}
              />

              <div className="mt-6">
                <CodeBlock dark={dark}>
{`CREATE VIEW active_users AS
SELECT
    id,
    name,
    email
FROM users
WHERE active = TRUE;

SELECT *
FROM active_users;

-- PostgreSQL example
CREATE MATERIALIZED VIEW monthly_sales AS
SELECT
    DATE_TRUNC('month', created_at) AS month,
    SUM(amount) AS revenue
FROM orders
GROUP BY DATE_TRUNC('month', created_at);`}
                </CodeBlock>
              </div>
            </section>

            {/* Indexes */}
            <section
              id="indexes"
              className={`scroll-mt-24 rounded-3xl border p-5 sm:p-7 ${
                dark
                  ? "border-slate-800 bg-slate-900/80"
                  : "border-slate-200 bg-white"
              }`}
            >
              <SectionTitle
                number="50"
                title="Database Indexes"
                description="An index is an additional data structure that helps the database locate rows without scanning the entire table."
                icon={Zap}
                dark={dark}
              />

              <Callout dark={dark}>
                Think of an index like the index at the back of a book:
                instead of reading every page, you first locate where the
                desired information exists.
              </Callout>

              <div className="mt-6">
                <CodeBlock title="Index example" dark={dark}>
{`CREATE INDEX idx_users_email
ON users(email);

SELECT *
FROM users
WHERE email = 'rahul@example.com';`}
                </CodeBlock>
              </div>

              <div className="mt-6">
                <ComparisonTable
                  dark={dark}
                  headers={[
                    "Index Type",
                    "Typical Use",
                    "Notes",
                  ]}
                  rows={indexTypes}
                />
              </div>

              <div className="mt-6">
                <Callout type="warning" dark={dark}>
                  Indexes speed up many reads but are not free. They
                  consume storage and add work to INSERT, UPDATE and
                  DELETE because index entries must also be maintained.
                </Callout>
              </div>
            </section>

            {/* Composite */}
            <section
              id="composite-index"
              className={`scroll-mt-24 rounded-3xl border p-5 sm:p-7 ${
                dark
                  ? "border-slate-800 bg-slate-900/80"
                  : "border-slate-200 bg-white"
              }`}
            >
              <SectionTitle
                number="51"
                title="Composite Index and Column Order"
                description="A composite index contains multiple columns. Choosing the right column order is critical."
                icon={Zap}
                dark={dark}
              />

              <CodeBlock dark={dark}>
{`CREATE INDEX idx_orders_user_status_created
ON orders(user_id, status, created_at);

-- Excellent candidate
SELECT *
FROM orders
WHERE user_id = 100
  AND status = 'SUCCESS'
ORDER BY created_at DESC;

-- May use only part of the index
SELECT *
FROM orders
WHERE user_id = 100;

-- Often cannot efficiently use the leading structure
SELECT *
FROM orders
WHERE status = 'SUCCESS';`}
              </CodeBlock>

              <div className="mt-6">
                <BulletList
                  dark={dark}
                  items={[
                    "Column order matters.",
                    "Equality filters often appear before range filters.",
                    "Indexes should reflect real application query patterns.",
                    "Do not blindly add every filtered column to an index.",
                    "A covering index contains enough columns to answer a query without reading the base table in some database engines.",
                  ]}
                />
              </div>
            </section>

            {/* Explain */}
            <section
              id="explain"
              className={`scroll-mt-24 rounded-3xl border p-5 sm:p-7 ${
                dark
                  ? "border-slate-800 bg-slate-900/80"
                  : "border-slate-200 bg-white"
              }`}
            >
              <SectionTitle
                number="52"
                title="EXPLAIN and Query Execution Plans"
                description="The query optimizer decides how to execute a SQL statement. EXPLAIN allows developers to inspect that plan."
                icon={Gauge}
                dark={dark}
              />

              <CodeBlock dark={dark}>
{`EXPLAIN
SELECT *
FROM orders
WHERE user_id = 100;

-- PostgreSQL
EXPLAIN ANALYZE
SELECT *
FROM orders
WHERE user_id = 100;`}
              </CodeBlock>

              <div className="mt-6">
                <BulletList
                  dark={dark}
                  items={[
                    "Check whether the database performs a sequential/table scan.",
                    "Check which indexes are used.",
                    "Inspect join algorithms.",
                    "Compare estimated rows with actual rows where supported.",
                    "Look for unnecessary sorts.",
                    "Look for repeated expensive operations.",
                    "Use execution plans before assuming an index will help.",
                  ]}
                />
              </div>
            </section>

            {/* Transactions */}
            <section
              id="transactions"
              className={`scroll-mt-24 rounded-3xl border p-5 sm:p-7 ${
                dark
                  ? "border-slate-800 bg-slate-900/80"
                  : "border-slate-200 bg-white"
              }`}
            >
              <SectionTitle
                number="53"
                title="Transactions"
                description="A transaction groups operations into a single logical unit of work."
                icon={LockKeyhole}
                dark={dark}
              />

              <CodeBlock title="Money transfer" dark={dark}>
{`BEGIN;

UPDATE accounts
SET balance = balance - 1000
WHERE id = 1;

UPDATE accounts
SET balance = balance + 1000
WHERE id = 2;

COMMIT;`}
              </CodeBlock>

              <div className="mt-6">
                <CodeBlock title="Rollback" dark={dark}>
{`BEGIN;

UPDATE inventory
SET stock = stock - 1
WHERE product_id = 500
  AND stock > 0;

-- Something fails

ROLLBACK;`}
                </CodeBlock>
              </div>

              <div className="mt-6">
                <CodeBlock title="Savepoint" dark={dark}>
{`BEGIN;

INSERT INTO orders (...);

SAVEPOINT order_created;

INSERT INTO payment_attempts (...);

ROLLBACK TO SAVEPOINT order_created;

COMMIT;`}
                </CodeBlock>
              </div>
            </section>

            {/* ACID */}
            <section
              id="acid"
              className={`scroll-mt-24 rounded-3xl border p-5 sm:p-7 ${
                dark
                  ? "border-slate-800 bg-slate-900/80"
                  : "border-slate-200 bg-white"
              }`}
            >
              <SectionTitle
                number="54"
                title="ACID Properties"
                description="ACID describes important guarantees expected from reliable database transactions."
                icon={ShieldCheck}
                dark={dark}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  [
                    "Atomicity",
                    "All operations succeed together or the transaction is rolled back.",
                  ],
                  [
                    "Consistency",
                    "A transaction moves the database from one valid state to another valid state.",
                  ],
                  [
                    "Isolation",
                    "Concurrent transactions should not incorrectly interfere with one another.",
                  ],
                  [
                    "Durability",
                    "Committed data should survive failures according to the database's durability guarantees.",
                  ],
                ].map(([title, description]) => (
                  <div
                    key={title}
                    className={`rounded-2xl border p-5 ${
                      dark
                        ? "border-slate-700 bg-slate-950"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <h3
                      className={`font-black ${
                        dark ? "text-white" : "text-slate-950"
                      }`}
                    >
                      {title}
                    </h3>

                    <p
                      className={`mt-2 text-sm leading-6 ${
                        dark ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      {description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Isolation */}
            <section
              id="isolation"
              className={`scroll-mt-24 rounded-3xl border p-5 sm:p-7 ${
                dark
                  ? "border-slate-800 bg-slate-900/80"
                  : "border-slate-200 bg-white"
              }`}
            >
              <SectionTitle
                number="55"
                title="Transaction Isolation Levels"
                description="Isolation levels control how much concurrent transactions can observe each other's intermediate effects."
                icon={LockKeyhole}
                dark={dark}
              />

              <div className="mb-6 grid gap-4 md:grid-cols-3">
                {[
                  [
                    "Dirty Read",
                    "Transaction reads data written by another transaction that has not committed.",
                  ],
                  [
                    "Non-repeatable Read",
                    "The same row returns a different committed value when read again.",
                  ],
                  [
                    "Phantom Read",
                    "Repeating a range query returns additional or missing rows.",
                  ],
                ].map(([title, description]) => (
                  <div
                    key={title}
                    className={`rounded-2xl border p-5 ${
                      dark
                        ? "border-slate-700 bg-slate-950"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <h3
                      className={`font-bold ${
                        dark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {title}
                    </h3>

                    <p
                      className={`mt-2 text-sm leading-6 ${
                        dark ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      {description}
                    </p>
                  </div>
                ))}
              </div>

              <ComparisonTable
                dark={dark}
                headers={[
                  "Isolation Level",
                  "Dirty Read",
                  "Non-repeatable Read",
                  "Phantom Read",
                ]}
                rows={isolationRows}
              />

              <p
                className={`mt-3 text-xs leading-5 ${
                  dark ? "text-slate-500" : "text-slate-500"
                }`}
              >
                * Exact guarantees and implementation details can vary
                across database engines, particularly because of MVCC.
              </p>
            </section>

            {/* Locking */}
            <section
              id="locking"
              className={`scroll-mt-24 rounded-3xl border p-5 sm:p-7 ${
                dark
                  ? "border-slate-800 bg-slate-900/80"
                  : "border-slate-200 bg-white"
              }`}
            >
              <SectionTitle
                number="56"
                title="Database Locking"
                description="Locks coordinate concurrent access to data and help protect correctness."
                icon={LockKeyhole}
                dark={dark}
              />

              <BulletList
                dark={dark}
                items={[
                  "Shared/read locks allow compatible readers depending on the engine.",
                  "Exclusive/write locks protect modifications.",
                  "Row-level locks affect specific records.",
                  "Table-level locks affect an entire table.",
                  "Lock granularity influences concurrency.",
                  "MVCC-based databases may avoid many read/write conflicts using row versions.",
                ]}
              />

              <div className="mt-6">
                <CodeBlock title="Pessimistic locking" dark={dark}>
{`BEGIN;

SELECT *
FROM inventory
WHERE product_id = 100
FOR UPDATE;

UPDATE inventory
SET stock = stock - 1
WHERE product_id = 100;

COMMIT;`}
                </CodeBlock>
              </div>
            </section>

            {/* optimistic */}
            <section
              id="optimistic-locking"
              className={`scroll-mt-24 rounded-3xl border p-5 sm:p-7 ${
                dark
                  ? "border-slate-800 bg-slate-900/80"
                  : "border-slate-200 bg-white"
              }`}
            >
              <SectionTitle
                number="57"
                title="Optimistic vs Pessimistic Locking"
                description="Applications can handle concurrent updates using different strategies."
                icon={LockKeyhole}
                dark={dark}
              />

              <ComparisonTable
                dark={dark}
                headers={[
                  "Feature",
                  "Optimistic",
                  "Pessimistic",
                ]}
                rows={[
                  [
                    "Assumption",
                    "Conflicts are uncommon",
                    "Conflicts may occur",
                  ],
                  [
                    "Lock early",
                    "Usually no",
                    "Yes",
                  ],
                  [
                    "Typical mechanism",
                    "Version column",
                    "SELECT FOR UPDATE",
                  ],
                  [
                    "Concurrency",
                    "High",
                    "Potentially lower",
                  ],
                  [
                    "Conflict handling",
                    "Detect and retry",
                    "Wait/block",
                  ],
                ]}
              />

              <div className="mt-6">
                <CodeBlock title="Optimistic locking" dark={dark}>
{`UPDATE products
SET
    stock = stock - 1,
    version = version + 1
WHERE id = 100
  AND version = 7;

-- If affected rows = 0,
-- another transaction changed the record first.`}
                </CodeBlock>
              </div>
            </section>

            {/* Deadlocks */}
            <section
              id="deadlocks"
              className={`scroll-mt-24 rounded-3xl border p-5 sm:p-7 ${
                dark
                  ? "border-slate-800 bg-slate-900/80"
                  : "border-slate-200 bg-white"
              }`}
            >
              <SectionTitle
                number="58"
                title="Database Deadlocks"
                description="A deadlock occurs when transactions wait on resources held by one another and neither can continue."
                icon={AlertTriangle}
                dark={dark}
              />

              <CodeBlock title="Deadlock scenario" dark={dark}>
{`Transaction A
-------------
Locks Row 1
Needs Row 2

Transaction B
-------------
Locks Row 2
Needs Row 1

A waits for B
B waits for A

=> Deadlock`}
              </CodeBlock>

              <div className="mt-6">
                <BulletList
                  dark={dark}
                  items={[
                    "Access rows in a consistent order.",
                    "Keep transactions short.",
                    "Avoid user interaction inside open transactions.",
                    "Use appropriate indexes so fewer rows remain locked.",
                    "Retry transactions that are selected as deadlock victims.",
                    "Avoid unnecessarily broad locking.",
                  ]}
                />
              </div>
            </section>

            {/* Stored proc */}
            <section
              id="stored-procedures"
              className={`scroll-mt-24 rounded-3xl border p-5 sm:p-7 ${
                dark
                  ? "border-slate-800 bg-slate-900/80"
                  : "border-slate-200 bg-white"
              }`}
            >
              <SectionTitle
                number="59"
                title="Stored Procedures and Database Functions"
                description="Stored procedures/functions allow logic to execute inside the database. Exact syntax is database-specific."
                icon={Code2}
                dark={dark}
              />

              <BulletList
                dark={dark}
                items={[
                  "Can encapsulate repeated database operations.",
                  "Can reduce application-to-database round trips in some cases.",
                  "May improve security by limiting direct table access.",
                  "Heavy business logic inside the database can make application portability and testing harder.",
                  "Syntax differs significantly between PostgreSQL, MySQL, SQL Server and Oracle.",
                ]}
              />
            </section>

            {/* Triggers */}
            <section
              id="triggers"
              className={`scroll-mt-24 rounded-3xl border p-5 sm:p-7 ${
                dark
                  ? "border-slate-800 bg-slate-900/80"
                  : "border-slate-200 bg-white"
              }`}
            >
              <SectionTitle
                number="60"
                title="Database Triggers"
                description="A trigger automatically executes database logic after or before specified events."
                icon={Zap}
                dark={dark}
              />

              <BulletList
                dark={dark}
                items={[
                  "Can execute on INSERT.",
                  "Can execute on UPDATE.",
                  "Can execute on DELETE.",
                  "Useful for auditing and enforcing specialized rules.",
                  "Can create hidden behaviour if overused.",
                  "Debugging systems with many triggers can become difficult.",
                ]}
              />

              <div className="mt-6">
                <Callout type="warning" dark={dark}>
                  Prefer explicit application/domain logic when the
                  operation should remain visible to application
                  developers. Use triggers deliberately.
                </Callout>
              </div>
            </section>

            {/* Partitioning */}
            <section
              id="partitioning"
              className={`scroll-mt-24 rounded-3xl border p-5 sm:p-7 ${
                dark
                  ? "border-slate-800 bg-slate-900/80"
                  : "border-slate-200 bg-white"
              }`}
            >
              <SectionTitle
                number="61"
                title="Table Partitioning"
                description="Partitioning divides one logical table into smaller physical pieces."
                icon={Layers3}
                dark={dark}
              />

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  [
                    "Range Partitioning",
                    "Example: orders separated by month or year.",
                  ],
                  [
                    "List Partitioning",
                    "Example: records separated by region.",
                  ],
                  [
                    "Hash Partitioning",
                    "Rows distributed using a hash function.",
                  ],
                ].map(([title, description]) => (
                  <div
                    key={title}
                    className={`rounded-2xl border p-5 ${
                      dark
                        ? "border-slate-700 bg-slate-950"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <h3 className="font-bold">{title}</h3>
                    <p
                      className={`mt-2 text-sm leading-6 ${
                        dark ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      {description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <Callout dark={dark}>
                  Partitioning is not the same as sharding. Partitioning
                  normally divides data within one database system,
                  while sharding distributes data across separate
                  database nodes or instances.
                </Callout>
              </div>
            </section>

            {/* SQL injection */}
            <section
              id="sql-injection"
              className={`scroll-mt-24 rounded-3xl border p-5 sm:p-7 ${
                dark
                  ? "border-slate-800 bg-slate-900/80"
                  : "border-slate-200 bg-white"
              }`}
            >
              <SectionTitle
                number="62"
                title="SQL Injection and Security"
                description="SQL injection happens when untrusted input is interpreted as part of a SQL statement."
                icon={ShieldCheck}
                dark={dark}
              />

              <CodeBlock title="Unsafe approach" dark={dark}>
{`// Never build SQL by directly joining user input.

const sql =
  "SELECT * FROM users WHERE email = '" +
  email +
  "'";`}
              </CodeBlock>

              <div className="mt-6">
                <CodeBlock title="Parameterized approach" dark={dark}>
{`const sql =
  "SELECT * FROM users WHERE email = ?";

db.execute(sql, [email]);`}
                </CodeBlock>
              </div>

              <div className="mt-6">
                <BulletList
                  dark={dark}
                  items={[
                    "Use prepared statements or parameterized queries.",
                    "Never concatenate raw user input into SQL.",
                    "Validate input.",
                    "Use least-privilege database accounts.",
                    "Do not expose database error details to end users.",
                    "Use ORM parameterization correctly rather than assuming every ORM method is automatically safe.",
                  ]}
                />
              </div>
            </section>

            {/* Optimization */}
            <section
              id="optimization"
              className={`scroll-mt-24 rounded-3xl border p-5 sm:p-7 ${
                dark
                  ? "border-slate-800 bg-slate-900/80"
                  : "border-slate-200 bg-white"
              }`}
            >
              <SectionTitle
                number="63"
                title="SQL Query Optimization"
                description="Performance tuning begins with measuring the actual query and examining its execution plan."
                icon={Gauge}
                dark={dark}
              />

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "Select only required columns.",
                  "Filter rows as early as logically possible.",
                  "Create indexes for important access patterns.",
                  "Avoid unnecessary DISTINCT.",
                  "Avoid unnecessary sorts.",
                  "Inspect execution plans.",
                  "Index foreign keys used heavily in joins when appropriate.",
                  "Avoid applying functions to indexed columns when it prevents efficient index use.",
                  "Avoid leading wildcard searches for large tables when possible.",
                  "Use correct data types.",
                  "Avoid N+1 application queries.",
                  "Batch related database work.",
                  "Keep transactions short.",
                  "Use keyset pagination for very large datasets.",
                  "Archive or partition extremely large historical tables where appropriate.",
                  "Monitor slow-query logs.",
                ].map((item) => (
                  <div
                    key={item}
                    className={`flex gap-3 rounded-xl border p-4 text-sm leading-6 ${
                      dark
                        ? "border-slate-700 bg-slate-950 text-slate-300"
                        : "border-slate-200 bg-slate-50 text-slate-700"
                    }`}
                  >
                    <Check
                      size={16}
                      className="mt-1 shrink-0 text-emerald-500"
                    />
                    {item}
                  </div>
                ))}
              </div>
            </section>

            {/* Query smells */}
            <section
              id="query-smells"
              className={`scroll-mt-24 rounded-3xl border p-5 sm:p-7 ${
                dark
                  ? "border-slate-800 bg-slate-900/80"
                  : "border-slate-200 bg-white"
              }`}
            >
              <SectionTitle
                number="64"
                title="Common SQL Performance Mistakes"
                description="Several query patterns repeatedly cause avoidable performance issues."
                icon={AlertTriangle}
                dark={dark}
              />

              <CodeBlock title="Examples" dark={dark}>
{`-- 1. Fetching unnecessary columns
SELECT *
FROM large_orders;

-- Better
SELECT id, user_id, amount
FROM large_orders;


-- 2. Function over indexed column
WHERE LOWER(email) = 'user@example.com'


-- 3. Leading wildcard
WHERE name LIKE '%developer%'


-- 4. Huge OFFSET
LIMIT 20 OFFSET 500000


-- 5. Accidental Cartesian product
SELECT *
FROM users, orders;`}
              </CodeBlock>
            </section>

            {/* Schema */}
            <section
              id="schema-design"
              className={`scroll-mt-24 rounded-3xl border p-5 sm:p-7 ${
                dark
                  ? "border-slate-800 bg-slate-900/80"
                  : "border-slate-200 bg-white"
              }`}
            >
              <SectionTitle
                number="65"
                title="Real E-commerce Schema Design"
                description="A practical relational design showing how SQL concepts come together."
                icon={Database}
                dark={dark}
              />

              <CodeBlock title="Schema" dark={dark}>
{`users
-----
id PK
name
email UNIQUE
created_at

products
--------
id PK
name
price
stock
active

orders
------
id PK
user_id FK -> users.id
status
total_amount
created_at

order_items
-----------
id PK
order_id FK -> orders.id
product_id FK -> products.id
quantity
unit_price

payments
--------
id PK
order_id FK -> orders.id
provider
status
amount
transaction_id
created_at

reviews
-------
id PK
user_id FK -> users.id
product_id FK -> products.id
rating
comment
created_at`}
              </CodeBlock>

              <div className="mt-6">
                <CodeBlock title="Example production query" dark={dark}>
{`SELECT
    o.id AS order_id,
    u.name AS customer,
    o.status,
    o.total_amount,
    COUNT(oi.id) AS total_items
FROM orders o
JOIN users u
    ON u.id = o.user_id
JOIN order_items oi
    ON oi.order_id = o.id
WHERE o.created_at >= CURRENT_DATE
GROUP BY
    o.id,
    u.name,
    o.status,
    o.total_amount
ORDER BY o.created_at DESC;`}
                </CodeBlock>
              </div>
            </section>

            {/* Interview SQL */}
            <section
              id="interview-queries"
              className={`scroll-mt-24 rounded-3xl border p-5 sm:p-7 ${
                dark
                  ? "border-slate-800 bg-slate-900/80"
                  : "border-slate-200 bg-white"
              }`}
            >
              <SectionTitle
                number="66"
                title="Important SQL Interview Queries"
                description="These patterns appear repeatedly in backend, data and software engineering interviews."
                icon={Sparkles}
                dark={dark}
              />

              <h3
                className={`mb-3 text-lg font-black ${
                  dark ? "text-white" : "text-slate-950"
                }`}
              >
                Second highest salary
              </h3>

              <CodeBlock dark={dark}>
{`SELECT MAX(salary) AS second_highest
FROM employees
WHERE salary < (
    SELECT MAX(salary)
    FROM employees
);`}
              </CodeBlock>

              <h3
                className={`mb-3 mt-8 text-lg font-black ${
                  dark ? "text-white" : "text-slate-950"
                }`}
              >
                Nth highest salary
              </h3>

              <CodeBlock dark={dark}>
{`WITH ranked AS (
    SELECT
        salary,
        DENSE_RANK() OVER (
            ORDER BY salary DESC
        ) AS rank_number
    FROM employees
)
SELECT DISTINCT salary
FROM ranked
WHERE rank_number = 3;`}
              </CodeBlock>

              <h3
                className={`mb-3 mt-8 text-lg font-black ${
                  dark ? "text-white" : "text-slate-950"
                }`}
              >
                Duplicate emails
              </h3>

              <CodeBlock dark={dark}>
{`SELECT
    email,
    COUNT(*) AS occurrences
FROM users
GROUP BY email
HAVING COUNT(*) > 1;`}
              </CodeBlock>

              <h3
                className={`mb-3 mt-8 text-lg font-black ${
                  dark ? "text-white" : "text-slate-950"
                }`}
              >
                Employees earning more than manager
              </h3>

              <CodeBlock dark={dark}>
{`SELECT
    employee.name AS employee,
    employee.salary,
    manager.name AS manager,
    manager.salary AS manager_salary
FROM employees employee
JOIN employees manager
    ON employee.manager_id = manager.id
WHERE employee.salary > manager.salary;`}
              </CodeBlock>

              <h3
                className={`mb-3 mt-8 text-lg font-black ${
                  dark ? "text-white" : "text-slate-950"
                }`}
              >
                Top 3 salaries from each department
              </h3>

              <CodeBlock dark={dark}>
{`WITH ranked AS (
    SELECT
        id,
        name,
        department_id,
        salary,
        DENSE_RANK() OVER (
            PARTITION BY department_id
            ORDER BY salary DESC
        ) AS salary_rank
    FROM employees
)
SELECT *
FROM ranked
WHERE salary_rank <= 3;`}
              </CodeBlock>

              <h3
                className={`mb-3 mt-8 text-lg font-black ${
                  dark ? "text-white" : "text-slate-950"
                }`}
              >
                Users with no orders
              </h3>

              <CodeBlock dark={dark}>
{`SELECT
    u.id,
    u.name
FROM users u
WHERE NOT EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.user_id = u.id
);`}
              </CodeBlock>

              <h3
                className={`mb-3 mt-8 text-lg font-black ${
                  dark ? "text-white" : "text-slate-950"
                }`}
              >
                Latest order for every user
              </h3>

              <CodeBlock dark={dark}>
{`WITH ranked_orders AS (
    SELECT
        o.*,
        ROW_NUMBER() OVER (
            PARTITION BY user_id
            ORDER BY created_at DESC, id DESC
        ) AS row_num
    FROM orders o
)
SELECT *
FROM ranked_orders
WHERE row_num = 1;`}
              </CodeBlock>

              <h3
                className={`mb-3 mt-8 text-lg font-black ${
                  dark ? "text-white" : "text-slate-950"
                }`}
              >
                Monthly revenue
              </h3>

              <CodeBlock dark={dark}>
{`-- PostgreSQL example
SELECT
    DATE_TRUNC('month', created_at) AS month,
    SUM(amount) AS revenue
FROM orders
WHERE status = 'SUCCESS'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month;`}
              </CodeBlock>
            </section>

            {/* Practice */}
            <section
              id="practice-problems"
              className={`scroll-mt-24 rounded-3xl border p-5 sm:p-7 ${
                dark
                  ? "border-slate-800 bg-slate-900/80"
                  : "border-slate-200 bg-white"
              }`}
            >
              <SectionTitle
                number="67"
                title="SQL Practice Problems"
                description="Try solving these without looking at the examples first."
                icon={Code2}
                dark={dark}
              />

              <div className="grid gap-3 sm:grid-cols-2">
                {practiceQuestions.map((question, index) => (
                  <div
                    key={question}
                    className={`flex gap-3 rounded-xl border p-4 text-sm leading-6 ${
                      dark
                        ? "border-slate-700 bg-slate-950 text-slate-300"
                        : "border-slate-200 bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                        dark
                          ? "bg-slate-800 text-cyan-300"
                          : "bg-white text-cyan-700"
                      }`}
                    >
                      {index + 1}
                    </span>

                    <span>{question}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Interview questions */}
            <section
              id="interview-questions"
              className={`scroll-mt-24 rounded-3xl border p-5 sm:p-7 ${
                dark
                  ? "border-slate-800 bg-slate-900/80"
                  : "border-slate-200 bg-white"
              }`}
            >
              <SectionTitle
                number="68"
                title="SQL Interview Questions Checklist"
                description="Use this checklist before backend, SDE, data engineering or SQL-heavy interviews."
                icon={Clipboard}
                dark={dark}
              />

              <div className="grid gap-3 md:grid-cols-2">
                {interviewQuestions.map((question, index) => (
                  <div
                    key={question}
                    className={`flex gap-3 rounded-xl border p-4 ${
                      dark
                        ? "border-slate-700 bg-slate-950"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                        dark
                          ? "bg-cyan-400/10 text-cyan-300"
                          : "bg-cyan-100 text-cyan-800"
                      }`}
                    >
                      {index + 1}
                    </span>

                    <p
                      className={`text-sm leading-6 ${
                        dark ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      {question}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Cheat sheet */}
            <section
              id="cheat-sheet"
              className={`scroll-mt-24 rounded-3xl border p-5 sm:p-7 ${
                dark
                  ? "border-slate-800 bg-slate-900/80"
                  : "border-slate-200 bg-white"
              }`}
            >
              <SectionTitle
                number="69"
                title="SQL Quick Revision Cheat Sheet"
                description="A compact revision block for commonly used SQL syntax."
                icon={FileCode2}
                dark={dark}
              />

              <CodeBlock dark={dark}>
{`-- SELECT
SELECT column1, column2
FROM table_name;

-- FILTER
SELECT *
FROM users
WHERE age >= 18;

-- SORT
SELECT *
FROM users
ORDER BY created_at DESC;

-- LIMIT
SELECT *
FROM users
LIMIT 10;

-- GROUP
SELECT city, COUNT(*)
FROM users
GROUP BY city;

-- GROUP FILTER
SELECT city, COUNT(*)
FROM users
GROUP BY city
HAVING COUNT(*) > 10;

-- JOIN
SELECT *
FROM users u
JOIN orders o
    ON o.user_id = u.id;

-- LEFT JOIN
SELECT *
FROM users u
LEFT JOIN orders o
    ON o.user_id = u.id;

-- SUBQUERY
SELECT *
FROM products
WHERE price > (
    SELECT AVG(price)
    FROM products
);

-- CTE
WITH data AS (
    SELECT *
    FROM orders
)
SELECT *
FROM data;

-- WINDOW FUNCTION
SELECT
    name,
    salary,
    DENSE_RANK() OVER (
        ORDER BY salary DESC
    ) AS salary_rank
FROM employees;

-- INDEX
CREATE INDEX idx_users_email
ON users(email);

-- TRANSACTION
BEGIN;

UPDATE accounts
SET balance = balance - 100
WHERE id = 1;

COMMIT;

-- EXISTENCE
SELECT *
FROM users u
WHERE EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.user_id = u.id
);

-- NULL
SELECT *
FROM users
WHERE phone IS NULL;

-- CASE
SELECT
    name,
    CASE
        WHEN age >= 18 THEN 'Adult'
        ELSE 'Minor'
    END AS category
FROM users;`}
              </CodeBlock>
            </section>

            {/* Final roadmap */}
            <section
              className={`rounded-3xl border p-6 sm:p-8 ${
                dark
                  ? "border-cyan-900/50 bg-gradient-to-br from-cyan-950/30 to-slate-900"
                  : "border-cyan-200 bg-gradient-to-br from-cyan-50 to-white"
              }`}
            >
              <Sparkles
                size={26}
                className={
                  dark ? "text-cyan-300" : "text-cyan-700"
                }
              />

              <h2
                className={`mt-4 text-2xl font-black sm:text-3xl ${
                  dark ? "text-white" : "text-slate-950"
                }`}
              >
                What should you master for interviews?
              </h2>

              <p
                className={`mt-3 max-w-3xl leading-7 ${
                  dark ? "text-slate-300" : "text-slate-600"
                }`}
              >
                Do not stop after learning SELECT and JOIN. For backend
                and SDE interviews, you should be able to explain how
                the database behaves internally and why a particular
                query or schema performs well.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  "Joins",
                  "GROUP BY + HAVING",
                  "Subqueries",
                  "CTEs",
                  "Window Functions",
                  "Normalization",
                  "Indexes",
                  "Composite Indexes",
                  "EXPLAIN",
                  "Transactions",
                  "ACID",
                  "Isolation Levels",
                  "Locking",
                  "Deadlocks",
                  "Pagination",
                  "Query Optimization",
                  "SQL Injection",
                  "Schema Design",
                ].map((item) => (
                  <div
                    key={item}
                    className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold ${
                      dark
                        ? "border-slate-700 bg-slate-950/70 text-slate-200"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    <Check
                      size={15}
                      className="shrink-0 text-emerald-500"
                    />
                    {item}
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>
    </>
  );
}