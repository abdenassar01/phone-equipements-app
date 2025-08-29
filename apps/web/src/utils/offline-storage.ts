import type { Doc } from '@phone-equipements-app/backend/convex/_generated/dataModel'

type Equipment = Doc<'equipments'> & {
  brand: Doc<'brands'> | null
  equipmentType: Doc<'equipmentTypes'> | null
}

type Accessory = Doc<'accessories'> & {
  category: Doc<'accessoryCategories'> | null
}

interface OfflineData {
  equipments: Equipment[]
  accessories: Accessory[]
  brands: Doc<'brands'>[]
  equipmentTypes: Doc<'equipmentTypes'>[]
  accessoryCategories: Doc<'accessoryCategories'>[]
  lastSync: string
  version: string
}

const STORAGE_KEYS = {
  OFFLINE_DATA: 'phone-equipements-offline-data',
  LAST_SYNC: 'phone-equipements-last-sync',
  SYNC_STATUS: 'phone-equipements-sync-status'
} as const

// LocalStorage utilities
export class OfflineStorage {
  private static instance: OfflineStorage
  private dbName = 'PhoneEquipementsDB'
  private dbVersion = 1
  private db: IDBDatabase | null = null

  private constructor() {}

  static getInstance(): OfflineStorage {
    if (!OfflineStorage.instance) {
      OfflineStorage.instance = new OfflineStorage()
    }
    return OfflineStorage.instance
  }

  // Initialize IndexedDB
  async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        // Create object stores
        if (!db.objectStoreNames.contains('equipments')) {
          db.createObjectStore('equipments', { keyPath: '_id' })
        }
        if (!db.objectStoreNames.contains('accessories')) {
          db.createObjectStore('accessories', { keyPath: '_id' })
        }
        if (!db.objectStoreNames.contains('brands')) {
          db.createObjectStore('brands', { keyPath: '_id' })
        }
        if (!db.objectStoreNames.contains('equipmentTypes')) {
          db.createObjectStore('equipmentTypes', { keyPath: '_id' })
        }
        if (!db.objectStoreNames.contains('accessoryCategories')) {
          db.createObjectStore('accessoryCategories', { keyPath: '_id' })
        }
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' })
        }
      }
    })
  }

  // Save data to IndexedDB
  async saveToIndexedDB(data: OfflineData): Promise<void> {
    if (!this.db) await this.initDB()
    if (!this.db) throw new Error('Failed to initialize database')

    const transaction = this.db.transaction(
      ['equipments', 'accessories', 'brands', 'equipmentTypes', 'accessoryCategories', 'metadata'],
      'readwrite'
    )

    // Clear existing data
    await Promise.all([
      this.clearStore(transaction, 'equipments'),
      this.clearStore(transaction, 'accessories'),
      this.clearStore(transaction, 'brands'),
      this.clearStore(transaction, 'equipmentTypes'),
      this.clearStore(transaction, 'accessoryCategories')
    ])

    // Save new data
    await Promise.all([
      this.saveToStore(transaction, 'equipments', data.equipments),
      this.saveToStore(transaction, 'accessories', data.accessories),
      this.saveToStore(transaction, 'brands', data.brands),
      this.saveToStore(transaction, 'equipmentTypes', data.equipmentTypes),
      this.saveToStore(transaction, 'accessoryCategories', data.accessoryCategories)
    ])

    // Save metadata
    const metadataStore = transaction.objectStore('metadata')
    await this.promisifyRequest(metadataStore.put({ key: 'lastSync', value: data.lastSync }))
    await this.promisifyRequest(metadataStore.put({ key: 'version', value: data.version }))
  }

  // Load data from IndexedDB
  async loadFromIndexedDB(): Promise<OfflineData | null> {
    if (!this.db) await this.initDB()
    if (!this.db) return null

    try {
      const transaction = this.db.transaction(
        ['equipments', 'accessories', 'brands', 'equipmentTypes', 'accessoryCategories', 'metadata'],
        'readonly'
      )

      const [equipments, accessories, brands, equipmentTypes, accessoryCategories, metadata] = await Promise.all([
        this.loadFromStore<Equipment>(transaction, 'equipments'),
        this.loadFromStore<Accessory>(transaction, 'accessories'),
        this.loadFromStore<Doc<'brands'>>(transaction, 'brands'),
        this.loadFromStore<Doc<'equipmentTypes'>>(transaction, 'equipmentTypes'),
        this.loadFromStore<Doc<'accessoryCategories'>>(transaction, 'accessoryCategories'),
        this.loadMetadata(transaction)
      ])

      return {
        equipments,
        accessories,
        brands,
        equipmentTypes,
        accessoryCategories,
        lastSync: metadata.lastSync || new Date().toISOString(),
        version: metadata.version || '1.0'
      }
    } catch (error) {
      console.error('Error loading from IndexedDB:', error)
      return null
    }
  }

  // Helper methods
  private async clearStore(transaction: IDBTransaction, storeName: string): Promise<void> {
    const store = transaction.objectStore(storeName)
    await this.promisifyRequest(store.clear())
  }

  private async saveToStore<T>(transaction: IDBTransaction, storeName: string, data: T[]): Promise<void> {
    const store = transaction.objectStore(storeName)
    await Promise.all(data.map(item => this.promisifyRequest(store.add(item))))
  }

  private async loadFromStore<T>(transaction: IDBTransaction, storeName: string): Promise<T[]> {
    const store = transaction.objectStore(storeName)
    const request = store.getAll()
    return await this.promisifyRequest(request)
  }

  private async loadMetadata(transaction: IDBTransaction): Promise<{ lastSync?: string; version?: string }> {
    const store = transaction.objectStore('metadata')
    const [lastSyncResult, versionResult] = await Promise.all([
      this.promisifyRequest(store.get('lastSync')),
      this.promisifyRequest(store.get('version'))
    ])
    
    return {
      lastSync: lastSyncResult?.value,
      version: versionResult?.value
    }
  }

  private promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // LocalStorage fallback methods
  saveToLocalStorage(data: OfflineData): void {
    try {
      localStorage.setItem(STORAGE_KEYS.OFFLINE_DATA, JSON.stringify(data))
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, data.lastSync)
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  }

  loadFromLocalStorage(): OfflineData | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.OFFLINE_DATA)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Error loading from localStorage:', error)
      return null
    }
  }

  // Sync status management
  setSyncStatus(status: 'syncing' | 'synced' | 'error' | 'offline'): void {
    localStorage.setItem(STORAGE_KEYS.SYNC_STATUS, status)
  }

  getSyncStatus(): string {
    return localStorage.getItem(STORAGE_KEYS.SYNC_STATUS) || 'offline'
  }

  getLastSyncTime(): string | null {
    return localStorage.getItem(STORAGE_KEYS.LAST_SYNC)
  }

  // Clear all offline data
  async clearOfflineData(): Promise<void> {
    // Clear localStorage
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })

    // Clear IndexedDB
    if (this.db) {
      const transaction = this.db.transaction(
        ['equipments', 'accessories', 'brands', 'equipmentTypes', 'accessoryCategories', 'metadata'],
        'readwrite'
      )

      await Promise.all([
        this.clearStore(transaction, 'equipments'),
        this.clearStore(transaction, 'accessories'),
        this.clearStore(transaction, 'brands'),
        this.clearStore(transaction, 'equipmentTypes'),
        this.clearStore(transaction, 'accessoryCategories'),
        this.clearStore(transaction, 'metadata')
      ])
    }
  }

  // Get storage usage info
  async getStorageInfo(): Promise<{ used: number; available: number; percentage: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate()
      const used = estimate.usage || 0
      const available = estimate.quota || 0
      const percentage = available > 0 ? (used / available) * 100 : 0
      
      return { used, available, percentage }
    }
    
    return { used: 0, available: 0, percentage: 0 }
  }
}

// Export singleton instance
export const offlineStorage = OfflineStorage.getInstance()

// Utility functions
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const isOnline = (): boolean => {
  return navigator.onLine
}

export const getOfflineCapabilities = (): {
  localStorage: boolean
  indexedDB: boolean
  serviceWorker: boolean
} => {
  return {
    localStorage: typeof Storage !== 'undefined',
    indexedDB: typeof indexedDB !== 'undefined',
    serviceWorker: 'serviceWorker' in navigator
  }
}