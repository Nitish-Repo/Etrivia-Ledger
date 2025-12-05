# 📦 Database Service Architecture

## 📁 Structure

```
src/app/core/database/
├── config/
│   └── index.ts                      # Configuration exports
│
├── services/
│   ├── sqlite-connection.service.ts  # Platform-specific connection (Web/iOS/Android)
│   ├── database.service.ts           # Generic CRUD operations
│   └── index.ts                      # Exports
│
├── models/
│   ├── query-result.interface.ts     # Query result interface
│   └── index.ts                      # Exports
│
└── index.ts                # Main exports

src/assets/
└── schema.sql              # ⭐ Database schema (ONLY file you need to edit!)
```

## 🚀 Key Features

✅ **Single Responsibility** - Each service has one clear purpose  
✅ **Platform Agnostic** - Works on Web, iOS, and Android  
✅ **No Code Duplication** - Generic CRUD operations  
✅ **Easy to Maintain** - All schemas in one SQL file  
✅ **Type-Safe** - Full TypeScript support with generics  
✅ **Scalable** - Easy to add new tables without new services

## 📋 Services Overview

### 1. SqliteConnectionService
Manages the platform-specific SQLite connection:
- Auto-detects platform (Web/iOS/Android)
- Initializes web store for browsers
- Manages database connection lifecycle
- Loads `assets/schema.sql` via HTTP and executes it automatically

### 2. DatabaseService
Provides generic CRUD operations for all tables:
- `query<T>(sql, params)` - Execute custom queries
- `getAll<T>(table)` - Get all records
- `getById<T>(table, id)` - Get single record
- `getByCondition<T>(table, where, params)` - Conditional queries
- `insert(table, data)` - Insert new record
- `update(table, id, data)` - Update record by ID
- `updateByCondition(table, data, where, params)` - Conditional update
- `delete(table, id)` - Delete record by ID
- `deleteByCondition(table, where, params)` - Conditional delete
- `count(table, where?, params?)` - Count records
- `exists(table, where, params)` - Check if record exists
- `executeBatch(statements)` - Execute transaction
- `truncate(table)` - Clear table

## 💡 Usage Examples

### Initialize Database
The database is automatically initialized in `main.ts` using `APP_INITIALIZER`:

```typescript
// main.ts
import { DatabaseService } from '@app/core/database/services/database.service';
import { provideHttpClient } from '@angular/common/http';

export function initializeFactory(dbService: DatabaseService) {
  return async () => {
    // Schema is automatically loaded from assets/schema.sql
    await dbService.initializeDatabase();
  };
}

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),  // Required for loading schema.sql
    DatabaseService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeFactory,
      deps: [DatabaseService],
      multi: true
    }
  ]
});
```

### Using in Components

```typescript
import { DatabaseService } from '@app/core/database/services/database.service';
import { User } from '@app/models/user';

@Component({...})
export class UsersComponent {
  constructor(private db: DatabaseService) {}

  async ngOnInit() {
    // Wait for database to be ready
    this.db.getDatabaseState().subscribe(async (isReady) => {
      if (isReady) {
        await this.loadUsers();
      }
    });
  }

  // Get all users
  async loadUsers() {
    const users = await this.db.getAll<User>('users');
  }

  // Get user by ID
  async getUser(id: number) {
    const user = await this.db.getById<User>('users', id);
  }

  // Insert new user
  async createUser(name: string, email: string) {
    const newId = await this.db.insert('users', { 
      name, 
      email,
      active: 1 
    });
  }

  // Update user
  async updateUser(id: number, data: Partial<User>) {
    await this.db.update('users', id, data);
  }

  // Delete user
  async deleteUser(id: number) {
    await this.db.delete('users', id);
  }

  // Conditional queries
  async getActiveUsers() {
    const users = await this.db.getByCondition<User>(
      'users',
      'active = ?',
      [1]
    );
  }

  // Custom queries
  async searchUsers(searchTerm: string) {
    const users = await this.db.query<User>(
      'SELECT * FROM users WHERE name LIKE ? OR email LIKE ?',
      [`%${searchTerm}%`, `%${searchTerm}%`]
    );
  }

  // Count records
  async countActiveUsers() {
    const count = await this.db.count('users', 'active = ?', [1]);
  }

  // Check if exists
  async emailExists(email: string) {
    return await this.db.exists('users', 'email = ?', [email]);
  }
}
```

## 🗄️ Adding New Tables

Simply edit `src/assets/schema.sql` - that's it!

**Example: Adding a categories table**

1. **Open `src/assets/schema.sql`** and add:

```sql
-- Categories Table (NEW)
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
```

2. **Create TypeScript interface**:
```typescript
export interface Category {
  id: number;
  name: string;
  description?: string;
  active: number;
  created_at?: string;
}
```

3. **Use immediately** - restart the app and it will load the new schema:

```typescript
const categories = await this.db.getAll<Category>('categories');
```

**That's it!** No TypeScript files to update, just pure SQL! 🎉

## 🔧 Advanced Usage

### Transactions
```typescript
await this.db.executeBatch([
  "INSERT INTO users (name) VALUES ('User 1')",
  "INSERT INTO users (name) VALUES ('User 2')",
  "UPDATE products SET price = price * 0.9"
]);
```

### Batch Updates
```typescript
await this.db.updateByCondition(
  'users',
  { active: 0 },
  'created_at < ?',
  ['2024-01-01']
);
```

### Complex Queries
```typescript
const result = await this.db.query<any>(`
  SELECT u.name, COUNT(o.id) as order_count
  FROM users u
  LEFT JOIN orders o ON u.id = o.user_id
  GROUP BY u.id
  HAVING order_count > 5
`);
```

## 🌐 Platform Support

| Platform | Storage Type | Status |
|----------|-------------|--------|
| Web      | IndexedDB   | ✅ Supported |
| iOS      | SQLite      | ✅ Supported |
| Android  | SQLite      | ✅ Supported |

## 🔄 Migration from Old Services

### Before (Multiple Services)
```typescript
// Old way - separate service per table
constructor(
  private userService: UserService,
  private productService: ProductService,
  private orderService: OrderService
) {}
```

### After (One Generic Service)
```typescript
// New way - single service for all tables
constructor(private db: DatabaseService) {}

// Works for any table
await this.db.getAll<User>('users');
await this.db.getAll<Product>('products');
await this.db.getAll<Order>('orders');
```

## 📝 Notes

- Database is initialized automatically on app start
- All operations are asynchronous (use `await`)
- Type-safe with TypeScript generics
- Automatic platform detection (no manual configuration needed)
- Supports both online and offline use
- Data persists across app restarts

## 🎯 Best Practices

1. **Always use type parameters**: `db.getAll<User>('users')` instead of `db.getAll('users')`
2. **Handle errors**: Wrap database calls in try-catch blocks
3. **Use transactions**: For multiple related operations
4. **Index your tables**: Add indexes in schema.sql for frequently queried columns
5. **Validate input**: Check data before inserting/updating
6. **Use prepared statements**: Pass parameters array to prevent SQL injection

---

**Need help?** Check the implementation in `src/app/features/components/users/users.component.ts` for a complete example.
