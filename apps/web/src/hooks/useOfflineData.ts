import { useState, useEffect, useCallback } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@phone-equipements-app/backend/convex/_generated/api'
import { offlineStorage, isOnline, formatBytes } from '../utils/offline-storage'
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

interface SyncStatus {
  status: 'syncing' | 'synced' | 'error' | 'offline' | 'never-synced'
  lastSync: string | null
  error?: string
}

interface StorageInfo {
  used: number
  available: number
  percentage: number
  formattedUsed: string
  formattedAvailable: string
}

// Hook for managing offline data synchronization
export const useOfflineSync = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    status: 'offline',
    lastSync: null
  })
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null)

  // Fetch online data
  const equipments = useQuery(api.equipments.getAllEquipments, { limit: 1000 })
  const accessories = useQuery(api.accessories.getAllAccessories, { limit: 1000 })
  const brands = useQuery(api.brands.getAllBrands)
  const equipmentTypes = useQuery(api.equipmentTypes.getAllEquipmentTypes)
  const accessoryCategories = useQuery(api.accessoryCategories.getAllAccessoryCategories)

  // Check if all data is loaded
  const isDataLoaded = equipments !== undefined &&
                      accessories !== undefined &&
                      brands !== undefined &&
                      equipmentTypes !== undefined &&
                      accessoryCategories !== undefined

  // Sync data to offline storage
  const syncToOffline = useCallback(async () => {
    if (!isDataLoaded || !isOnline()) {
      setSyncStatus(prev => ({ ...prev, status: 'offline' }))
      return false
    }

    try {
      setSyncStatus(prev => ({ ...prev, status: 'syncing' }))
      offlineStorage.setSyncStatus('syncing')

      const offlineData: OfflineData = {
        equipments: equipments || [],
        accessories: (accessories || []).map(acc => ({
          ...acc,
          category: accessoryCategories?.find(cat => cat._id === acc.categoryId) || null
        })),
        brands: brands || [],
        equipmentTypes: equipmentTypes || [],
        accessoryCategories: accessoryCategories || [],
        lastSync: new Date().toISOString(),
        version: '1.0'
      }

      // Try IndexedDB first, fallback to localStorage
      try {
        await offlineStorage.saveToIndexedDB(offlineData)
      } catch (error) {
        console.warn('IndexedDB failed, using localStorage:', error)
        offlineStorage.saveToLocalStorage(offlineData)
      }

      const newSyncStatus: SyncStatus = {
        status: 'synced',
        lastSync: offlineData.lastSync
      }

      setSyncStatus(newSyncStatus)
      offlineStorage.setSyncStatus('synced')

      return true
    } catch (error) {
      console.error('Sync failed:', error)
      const errorStatus: SyncStatus = {
        status: 'error',
        lastSync: offlineStorage.getLastSyncTime(),
        error: error instanceof Error ? error.message : 'Unknown error'
      }
      setSyncStatus(errorStatus)
      offlineStorage.setSyncStatus('error')
      return false
    }
  }, [isDataLoaded, equipments, accessories, brands, equipmentTypes, accessoryCategories])

  // Load offline data
  const loadOfflineData = useCallback(async (): Promise<OfflineData | null> => {
    try {
      // Try IndexedDB first
      let data = await offlineStorage.loadFromIndexedDB()

      // Fallback to localStorage
      if (!data) {
        data = offlineStorage.loadFromLocalStorage()
      }

      return data
    } catch (error) {
      console.error('Failed to load offline data:', error)
      return null
    }
  }, [])

  // Clear offline data
  const clearOfflineData = useCallback(async () => {
    try {
      await offlineStorage.clearOfflineData()
      setSyncStatus({
        status: 'never-synced',
        lastSync: null
      })
      return true
    } catch (error) {
      console.error('Failed to clear offline data:', error)
      return false
    }
  }, [])

  // Update storage info
  const updateStorageInfo = useCallback(async () => {
    try {
      const info = await offlineStorage.getStorageInfo()
      setStorageInfo({
        ...info,
        formattedUsed: formatBytes(info.used),
        formattedAvailable: formatBytes(info.available)
      })
    } catch (error) {
      console.error('Failed to get storage info:', error)
    }
  }, [])

  // Initialize sync status and storage info
  useEffect(() => {
    const initializeStatus = async () => {
      const status = offlineStorage.getSyncStatus() as SyncStatus['status']
      const lastSync = offlineStorage.getLastSyncTime()

      setSyncStatus({
        status: lastSync ? status : 'never-synced',
        lastSync
      })

      await updateStorageInfo()
    }

    initializeStatus()
  }, [])

  // Auto-sync when data is loaded and online
  useEffect(() => {
    if (isDataLoaded && isOnline() && syncStatus.status === 'never-synced') {
      syncToOffline()
    }
  }, [isDataLoaded, syncToOffline, syncStatus.status])

  return {
    syncStatus,
    storageInfo,
    isDataLoaded,
    isOnline: isOnline(),
    syncToOffline,
    loadOfflineData,
    clearOfflineData,
    updateStorageInfo
  }
}

// Hook for using offline data with fallback to online
export const useHybridData = () => {
  const [offlineData, setOfflineData] = useState<OfflineData | null>(null)
  const [isUsingOfflineData, setIsUsingOfflineData] = useState(false)
  const { loadOfflineData, isOnline } = useOfflineSync()

  // Online data queries
  const onlineEquipments = useQuery(api.equipments.getAllEquipments, { limit: 1000 })
  const onlineAccessories = useQuery(api.accessories.getAllAccessories, { limit: 1000 })
  const onlineBrands = useQuery(api.brands.getAllBrands)
  const onlineEquipmentTypes = useQuery(api.equipmentTypes.getAllEquipmentTypes)
  const onlineAccessoryCategories = useQuery(api.accessoryCategories.getAllAccessoryCategories)

  const isOnlineDataLoaded = onlineEquipments !== undefined &&
                            onlineAccessories !== undefined &&
                            onlineBrands !== undefined &&
                            onlineEquipmentTypes !== undefined &&
                            onlineAccessoryCategories !== undefined

  // Load offline data when online data is not available
  useEffect(() => {
    const loadData = async () => {
      if (!isOnline || !isOnlineDataLoaded) {
        const data = await loadOfflineData()
        if (data) {
          setOfflineData(data)
          setIsUsingOfflineData(true)
        }
      } else {
        setIsUsingOfflineData(false)
      }
    }

    loadData()
  }, [isOnline, isOnlineDataLoaded, loadOfflineData])

  // Return appropriate data based on availability
  const getData = () => {
    if (isOnline && isOnlineDataLoaded) {
      return {
        equipments: onlineEquipments || [],
        accessories: onlineAccessories || [],
        brands: onlineBrands || [],
        equipmentTypes: onlineEquipmentTypes || [],
        accessoryCategories: onlineAccessoryCategories || [],
        isOffline: false
      }
    }

    if (offlineData) {
      return {
        equipments: offlineData.equipments,
        accessories: offlineData.accessories,
        brands: offlineData.brands,
        equipmentTypes: offlineData.equipmentTypes,
        accessoryCategories: offlineData.accessoryCategories,
        isOffline: true
      }
    }

    return {
      equipments: [],
      accessories: [],
      brands: [],
      equipmentTypes: [],
      accessoryCategories: [],
      isOffline: false
    }
  }

  return {
    ...getData(),
    isUsingOfflineData,
    isLoading: !isOnlineDataLoaded && !offlineData,
    hasOfflineData: !!offlineData
  }
}

// Hook for online status monitoring
export const useOnlineStatus = () => {
  const [online, setOnline] = useState(isOnline())

  useEffect(() => {
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return online
}