# 🚀 Database Schema Guide - Simple & Easy

## 📁 **Only ONE File to Edit: `schema.ts`**

All your database changes go in ONE place!

---

## 📝 **How to Add New Features**

### **Example 1: Add Phone Column**

Edit `src/app/core/database-services/schema.ts`:

```typescript
export const SCHEMA_VERSIONS: SchemaVersion[] = [
  {
    version: 1,
    name: 'Initial schema',
    up: `
      CREATE TABLE IF NOT EXISTS users (...);
      CREATE TABLE IF NOT EXISTS products (...);
    `
  },
  {
    version: 2,  // ⬅️ NEW VERSION
    name: 'Add phone to users',
    up: `
      ALTER TABLE users ADD COLUMN phone TEXT;
    `
  }
];
```

**That's it!** ✅

---

### **Example 2: Add New Table**

```typescript
export const SCHEMA_VERSIONS: SchemaVersion[] = [
  { version: 1, name: 'Initial schema', up: `...` },
  { version: 2, name: 'Add phone to users', up: `...` },
  {
    version: 3,  // ⬅️ NEW VERSION
    name: 'Add orders table',
    up: `
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        total REAL NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
    `
  }
];
```

---

## ✅ **What Happens Automatically**

### **New User (First Install)**
```
1. Install app
2. Runs version 1 → Creates users & products tables
3. Runs version 2 → Adds phone column
4. Runs version 3 → Creates orders table
5. Database is at version 3 ✅
```

### **Existing User (Has Version 1)**
```
1. Update app
2. Detects current version = 1
3. Runs version 2 → Adds phone column
4. Runs version 3 → Creates orders table
5. Database updated to version 3 ✅
6. Old data preserved! ✅
```

---

## 🎯 **Rules**

1. **Always increment version number**
   ```typescript
   version: 1, 2, 3, 4, 5... (keep going up)
   ```

2. **Never change old versions**
   ```typescript
   ❌ Don't modify version 1 after release
   ✅ Add new version 2, 3, etc.
   ```

3. **One file, all changes**
   ```
   ✅ schema.ts - Edit this
   ❌ No other files needed
   ```

---

## 💡 **Quick Examples**

### **Add Column**
```typescript
{
  version: 4,
  name: 'Add avatar to users',
  up: `ALTER TABLE users ADD COLUMN avatar_url TEXT;`
}
```

### **Add Index**
```typescript
{
  version: 5,
  name: 'Index user emails',
  up: `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`
}
```

### **Multiple Changes**
```typescript
{
  version: 6,
  name: 'Multiple updates',
  up: `
    ALTER TABLE users ADD COLUMN last_login TEXT;
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY,
      user_id INTEGER NOT NULL
    );
  `
}
```

---

## 🎓 **Summary**

| What | Where | How |
|------|-------|-----|
| All changes | `schema.ts` | Add new version |
| Data safety | Automatic | Always preserved ✅ |
| Version tracking | Automatic | Handled for you ✅ |

**Simple. Clean. Professional.** 🚀
