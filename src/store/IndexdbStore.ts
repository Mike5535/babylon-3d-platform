import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

export type AssetRecord = {
  id: string;
  name: string;
  mime: string;
  size: number;
  blob: Blob;
  createdAt: number;
};

interface AppDB extends DBSchema {
  assets: {
    key: string;
    value: AssetRecord;
  };
}

const DB_NAME = '3D-platform';
const DB_VERSION = 1;
const ASSETS_TABLE_NAME = 'assets';

class IndexdbStore {
  private readonly dbName = DB_NAME;
  private readonly version = DB_VERSION;
  private db?: IDBPDatabase<AppDB>;

  async init() {
    if (this.db) return;

    this.db = await openDB<AppDB>(this.dbName, this.version, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('assets')) {
          db.createObjectStore('assets', { keyPath: 'id' });
        }
      },
    });
  }

  private async getDb(): Promise<IDBPDatabase<AppDB>> {
    await this.init();
    if (!this.db) throw new Error('DB is not initialized');
    return this.db;
  }

  async putFile(id: string, file: File): Promise<void> {
    const db = await this.getDb();
    const rec: AssetRecord = {
      id,
      name: file.name,
      mime: file.type || 'application/octet-stream',
      size: file.size,
      blob: file,
      createdAt: Date.now(),
    };
    await db.put(ASSETS_TABLE_NAME, rec);
  }

  async get(id: string): Promise<AssetRecord | undefined> {
    const db = await this.getDb();
    return db.get(ASSETS_TABLE_NAME, id);
  }

  async getAll(): Promise<AssetRecord[]> {
    const db = await this.getDb();
    return db.getAll(ASSETS_TABLE_NAME);
  }

  async clear() {
    const db = await this.getDb();
    await db.clear(ASSETS_TABLE_NAME);
  }
}

export const indexdbStore = new IndexdbStore();
