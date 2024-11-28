# playwright-indexeddb

A powerful and type-safe library for interacting with IndexedDB in Playwright tests.

## Features

- 🎭 Seamless integration with Playwright
- 📦 Full TypeScript support
- 🔄 Complete CRUD operations
- 🧪 Comprehensive test coverage
- 🚀 Promise-based API
- 💪 Type-safe operations

## Installation

```bash
npm install playwright-indexeddb
```

## Usage

```typescript
import { test } from "@playwright/test";
import { PlaywrightIndexedDB } from "playwright-indexeddb";

test("example test", async ({ page }) => {
  // Initialize IndexedDB
  const db = new PlaywrightIndexedDB(page, {
    dbName: "myDatabase",
    storeName: "myStore",
    version: 1, // optional, defaults to 1
  });

  // Put an item
  await db.putItem({ id: 1, name: "Test Item" }, 1);

  // Get an item
  const item = await db.getItem(1);

  // Get all items
  const allItems = await db.getAllItems();

  // Delete an item
  await db.deleteItem(1);

  // Clear all items
  await db.clear();
});
```

## API Reference

### Constructor

```typescript
new PlaywrightIndexedDB(page: Page, options: IndexedDBOptions)
```

#### Options

- `dbName`: string - Name of the IndexedDB database
- `storeName`: string - Name of the object store
- `version?`: number - Database version (optional, defaults to 1)

### Methods

#### `getAllItems<T>()`
Returns all items from the store as an array of type T.

#### `getItem<T>(key: IDBValidKey)`
Returns a single item of type T for the given key, or null if not found.

#### `putItem<T>(item: T, key?: IDBValidKey)`
Stores an item in the database. If key is provided, it will be used as the item's key.

#### `deleteItem(key: IDBValidKey)`
Deletes the item with the specified key.

#### `clear()`
Removes all items from the store.

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run linter
npm run lint

# Build package
npm run build
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT

## Support

If you find any bugs or have feature requests, please create an issue in the GitHub repository. 