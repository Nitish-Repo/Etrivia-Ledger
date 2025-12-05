# 📖 Schema Migration Guide - Easy to Understand

## 🎯 **The Main Rule**

**`CREATE TABLE IF NOT EXISTS` does NOT update existing tables!**

It only:
- ✅ Creates table if it doesn't exist
- ❌ Does NOT add new columns to existing tables
- ❌ Does NOT modify existing columns

---

## 📝 **Real-Life Scenarios**

### **Scenario 1: Brand New App Installation**

**User Action**: Installs your app for the first time

**What Happens**:
```
1. App starts
2. Loads schema.sql
3. Executes: CREATE TABLE IF NOT EXISTS users (...)
4. Table doesn't exist → Creates new table ✅
5. All columns created fresh
```

**Result**: Perfect! Everything works.

---

### **Scenario 2: Adding New Column to Existing Table**

**Your Code Change**:
```sql
-- OLD schema.sql
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT,
    email TEXT
);

-- NEW schema.sql (you add phone)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT,
    email TEXT,
    phone TEXT  -- ⬅️ NEW!
);
```

**User Has Existing Data**:
```
User 1: { id: 1, name: "John", email: "john@test.com" }
User 2: { id: 2, name: "Sarah", email: "sarah@test.com" }
```

**What Happens on App Update**:
```
1. App updates and restarts
2. Loads NEW schema.sql
3. Executes: CREATE TABLE IF NOT EXISTS users (...)
4. Table ALREADY exists → Does NOTHING! ❌
5. Phone column is NOT added
6. Your old data is still there (no data loss) ✅
```

**Result**: 
- ✅ Data is safe (not deleted)
- ❌ New column doesn't exist
- ❌ App might crash when trying to use `phone` field

---

### **Scenario 3: Adding a Completely New Table**

**Your Code Change**:
```sql
-- Add to schema.sql
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    name TEXT,
    price REAL
);
```

**What Happens**:
```
1. App restarts
2. Loads schema.sql
3. Executes: CREATE TABLE IF NOT EXISTS users (...) → Skips (exists)
4. Executes: CREATE TABLE IF NOT EXISTS products (...) → Creates! ✅
5. New products table is created
```

**Result**: ✅ Works perfectly! New table is added.

---

## ✅ **SOLUTION: How to Properly Add Columns**

### **Method 1: Development Only (Quick & Dirty)**

**If you're still developing and don't have real users:**

1. **Delete the app** from device/emulator
2. **Reinstall** the app
3. Fresh database with new schema ✅

**Commands**:
```bash
# Uninstall from Android
ionic cap sync
# Then uninstall app from device manually

# Reinstall
ionic cap run android
```

---

### **Method 2: Production (Proper Migration)**

**When you have real users with data, use migrations:**

#### **Step 1: Create migration file**

Create `src/app/core/database-services/migrations.ts`:

```typescript
export interface Migration {
  version: number;
  name: string;
  sql: string;
}

export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    name: 'Initial schema',
    sql: `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        active INTEGER DEFAULT 1
      );
    `
  },
  {
    version: 2,
    name: 'Add phone to users',
    sql: `
      ALTER TABLE users ADD COLUMN phone TEXT;
    `
  },
  {
    version: 3,
    name: 'Add products table',
    sql: `
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        price REAL NOT NULL
      );
    `
  }
];
```

#### **Step 2: Track database version**

Update `sqlite-connection.service.ts`:

```typescript
private async runMigrations(): Promise<void> {
  // Get current version from database
  const result = await this.db.query('PRAGMA user_version');
  const currentVersion = result.values?.[0]?.user_version || 0;
  
  console.log(`📊 Current DB version: ${currentVersion}`);
  
  // Run pending migrations
  for (const migration of MIGRATIONS) {
    if (migration.version > currentVersion) {
      console.log(`🔄 Running migration ${migration.version}: ${migration.name}`);
      
      try {
        await this.db.execute(migration.sql);
        await this.db.execute(`PRAGMA user_version = ${migration.version}`);
        console.log(`✅ Migration ${migration.version} complete`);
      } catch (error) {
        console.error(`❌ Migration ${migration.version} failed:`, error);
        throw error;
      }
    }
  }
}
```

---

## 🔍 **Complete Example: Real App Evolution**

### **Version 1.0 (Launch)**

**schema.sql**:
```sql
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT
);
```

**User Data After Using App**:
```javascript
[
  { id: 1, name: "Alice", email: "alice@test.com" },
  { id: 2, name: "Bob", email: "bob@test.com" }
]
```

---

### **Version 1.1 (Update: Add Phone)**

**What NOT to Do** ❌:
```sql
-- DON'T just edit schema.sql like this:
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT  -- ⬅️ This won't work!
);
```
**Why**: Existing users' tables won't get the `phone` column.

---

**What TO Do** ✅:

**migrations.ts**:
```typescript
export const MIGRATIONS = [
  {
    version: 1,
    sql: `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT
    );`
  },
  {
    version: 2,
    sql: `ALTER TABLE users ADD COLUMN phone TEXT;`
  }
];
```

**What Happens to User Data**:
```javascript
// BEFORE update (version 1)
[
  { id: 1, name: "Alice", email: "alice@test.com" },
  { id: 2, name: "Bob", email: "bob@test.com" }
]

// AFTER update (version 2)
[
  { id: 1, name: "Alice", email: "alice@test.com", phone: null },
  { id: 2, name: "Bob", email: "bob@test.com", phone: null }
]
```

**Result**: ✅ Data preserved + New column added!

---

## 🚨 **Common Mistakes & Solutions**

### **Mistake 1: Changing CREATE TABLE**
```sql
❌ CREATE TABLE IF NOT EXISTS users (
    id INTEGER,        -- Changed from AUTOINCREMENT
    name TEXT
);
```
**Problem**: Won't update existing table
**Solution**: Use ALTER TABLE or create migration

---

### **Mistake 2: Deleting Columns**
```sql
❌ CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    -- Removed email column
    name TEXT
);
```
**Problem**: Old column still exists in user's database
**Solution**: Use migration with ALTER TABLE DROP COLUMN

---

### **Mistake 3: Renaming Columns**
```sql
❌ CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    full_name TEXT  -- Renamed from 'name'
);
```
**Problem**: Old column remains, new column doesn't exist
**Solution**: Migration to rename: `ALTER TABLE users RENAME COLUMN name TO full_name;`

---

## 🎓 **Summary - Key Takeaways**

| Scenario | Safe to Edit schema.sql? | Needs Migration? |
|----------|-------------------------|------------------|
| **New table** | ✅ Yes | ❌ No |
| **Add column** | ❌ No | ✅ Yes |
| **Remove column** | ❌ No | ✅ Yes |
| **Rename column** | ❌ No | ✅ Yes |
| **Change column type** | ❌ No | ✅ Yes |
| **Add index** | ✅ Yes (IF NOT EXISTS) | ❌ No |
| **Development only** | ✅ Yes (uninstall/reinstall) | ❌ No |

---

## 💡 **Simple Development Workflow**

### **During Development (No Real Users Yet)**

Just edit `schema.sql` freely, then:
```bash
# Uninstall app
# Reinstall app
ionic cap run android
```

Fresh start with new schema! ✅

---

### **After Launch (Real Users Have Data)**

**NEVER** just edit `schema.sql` for changes!

**Always**:
1. Create migration
2. Update version number
3. Test on development device
4. Deploy update

---

## 📱 **Quick Reference**

**Adding New Table**: 
→ Just add to schema.sql ✅

**Adding Column**: 
→ Create migration with ALTER TABLE ✅

**Removing Column**: 
→ Create migration (data loss warning!) ⚠️

**Development Testing**: 
→ Uninstall/reinstall app ✅

**Production Update**: 
→ Always use migrations! ✅
