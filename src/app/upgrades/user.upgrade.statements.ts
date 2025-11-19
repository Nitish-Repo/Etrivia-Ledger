export class UserUpgradeStatements {
  userUpgrades = [
    {
      toVersion: 1,
      statements: [
        `CREATE TABLE IF NOT EXISTS users(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          active INTEGER DEFAULT 1
        );`
      ]
    },
    // Add new versions here for future schema changes:
    // {
    //   toVersion: 2,
    //   statements: [
    //     `ALTER TABLE users ADD COLUMN email TEXT;`,
    //   ]
    // },
  ]
}
