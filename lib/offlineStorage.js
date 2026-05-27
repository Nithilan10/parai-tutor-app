/**
 * Offline storage manager using IndexedDB
 * Stores practice data, progress, and feedback for offline use
 */

const DB_NAME = 'ParaiTutorDB';
const DB_VERSION = 1;

class OfflineStorage {
  constructor() {
    this.db = null;
  }

  async initialize() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Store for nilais
        if (!db.objectStoreNames.contains('nilais')) {
          const nilaiStore = db.createObjectStore('nilais', { keyPath: 'id' });
          nilaiStore.createIndex('order', 'order', { unique: false });
          nilaiStore.createIndex('difficulty', 'difficulty', { unique: false });
        }

        // Store for practice sessions
        if (!db.objectStoreNames.contains('sessions')) {
          const sessionStore = db.createObjectStore('sessions', { keyPath: 'id', autoIncrement: true });
          sessionStore.createIndex('nilaiId', 'nilaiId', { unique: false });
          sessionStore.createIndex('timestamp', 'timestamp', { unique: false });
          sessionStore.createIndex('synced', 'synced', { unique: false });
        }

        // Store for user progress
        if (!db.objectStoreNames.contains('progress')) {
          const progressStore = db.createObjectStore('progress', { keyPath: 'beatId' });
          progressStore.createIndex('status', 'status', { unique: false });
        }

        // Store for pending feedback submissions
        if (!db.objectStoreNames.contains('pendingFeedback')) {
          const feedbackStore = db.createObjectStore('pendingFeedback', { keyPath: 'id', autoIncrement: true });
          feedbackStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  // Nilai operations
  async saveNilai(nilai) {
    const tx = this.db.transaction(['nilais'], 'readwrite');
    const store = tx.objectStore('nilais');
    await store.put(nilai);
    return tx.complete;
  }

  async saveNilais(nilais) {
    const tx = this.db.transaction(['nilais'], 'readwrite');
    const store = tx.objectStore('nilais');
    
    for (const nilai of nilais) {
      await store.put(nilai);
    }
    
    return tx.complete;
  }

  async getNilai(id) {
    const tx = this.db.transaction(['nilais'], 'readonly');
    const store = tx.objectStore('nilais');
    return await store.get(id);
  }

  async getAllNilais() {
    const tx = this.db.transaction(['nilais'], 'readonly');
    const store = tx.objectStore('nilais');
    return await store.getAll();
  }

  // Practice session operations
  async saveSession(session) {
    const tx = this.db.transaction(['sessions'], 'readwrite');
    const store = tx.objectStore('sessions');
    
    const sessionData = {
      ...session,
      timestamp: session.timestamp || Date.now(),
      synced: false,
    };
    
    const id = await store.add(sessionData);
    return id;
  }

  async getSessions(nilaiId = null) {
    const tx = this.db.transaction(['sessions'], 'readonly');
    const store = tx.objectStore('sessions');
    
    if (nilaiId) {
      const index = store.index('nilaiId');
      return await index.getAll(nilaiId);
    }
    
    return await store.getAll();
  }

  async getUnsyncedSessions() {
    const tx = this.db.transaction(['sessions'], 'readonly');
    const store = tx.objectStore('sessions');
    const index = store.index('synced');
    return await index.getAll(false);
  }

  async markSessionSynced(id) {
    const tx = this.db.transaction(['sessions'], 'readwrite');
    const store = tx.objectStore('sessions');
    const session = await store.get(id);
    
    if (session) {
      session.synced = true;
      await store.put(session);
    }
    
    return tx.complete;
  }

  // Progress operations
  async saveProgress(beatId, status) {
    const tx = this.db.transaction(['progress'], 'readwrite');
    const store = tx.objectStore('progress');
    
    await store.put({
      beatId,
      status,
      updatedAt: Date.now(),
    });
    
    return tx.complete;
  }

  async getProgress(beatId) {
    const tx = this.db.transaction(['progress'], 'readonly');
    const store = tx.objectStore('progress');
    return await store.get(beatId);
  }

  async getAllProgress() {
    const tx = this.db.transaction(['progress'], 'readonly');
    const store = tx.objectStore('progress');
    return await store.getAll();
  }

  // Pending feedback operations
  async queueFeedback(feedback) {
    const tx = this.db.transaction(['pendingFeedback'], 'readwrite');
    const store = tx.objectStore('pendingFeedback');
    
    const id = await store.add({
      ...feedback,
      timestamp: Date.now(),
    });
    
    return id;
  }

  async getPendingFeedback() {
    const tx = this.db.transaction(['pendingFeedback'], 'readonly');
    const store = tx.objectStore('pendingFeedback');
    return await store.getAll();
  }

  async removePendingFeedback(id) {
    const tx = this.db.transaction(['pendingFeedback'], 'readwrite');
    const store = tx.objectStore('pendingFeedback');
    await store.delete(id);
    return tx.complete;
  }

  // Utility operations
  async clear() {
    const stores = ['nilais', 'sessions', 'progress', 'pendingFeedback'];
    const tx = this.db.transaction(stores, 'readwrite');
    
    for (const storeName of stores) {
      const store = tx.objectStore(storeName);
      await store.clear();
    }
    
    return tx.complete;
  }

  async getStorageStats() {
    const [nilais, sessions, progress, pending] = await Promise.all([
      this.getAllNilais(),
      this.getSessions(),
      this.getAllProgress(),
      this.getPendingFeedback(),
    ]);

    return {
      nilaisCount: nilais.length,
      sessionsCount: sessions.length,
      progressCount: progress.length,
      pendingFeedbackCount: pending.length,
    };
  }
}

// Singleton instance
let offlineStorage = null;

export async function getOfflineStorage() {
  if (!offlineStorage) {
    offlineStorage = new OfflineStorage();
    await offlineStorage.initialize();
  }
  return offlineStorage;
}

// Sync manager
export class SyncManager {
  constructor() {
    this.syncing = false;
  }

  async syncAll() {
    if (this.syncing || !navigator.onLine) return;

    this.syncing = true;

    try {
      const storage = await getOfflineStorage();
      
      // Sync sessions
      const unsyncedSessions = await storage.getUnsyncedSessions();
      for (const session of unsyncedSessions) {
        try {
          await fetch('/api/sessions/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(session),
          });
          await storage.markSessionSynced(session.id);
        } catch (error) {
          console.warn('[Sync] Failed to sync session:', session.id, error);
        }
      }

      // Sync pending feedback
      const pendingFeedback = await storage.getPendingFeedback();
      for (const feedback of pendingFeedback) {
        try {
          await fetch('/api/tutorials/analyze-beat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(feedback),
          });
          await storage.removePendingFeedback(feedback.id);
        } catch (error) {
          console.warn('[Sync] Failed to sync feedback:', feedback.id, error);
        }
      }

      console.log('[Sync] Sync completed successfully');
    } catch (error) {
      console.error('[Sync] Sync failed:', error);
    } finally {
      this.syncing = false;
    }
  }
}

// Auto-sync on connection restore
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    const syncManager = new SyncManager();
    syncManager.syncAll();
  });
}
