import { useState } from 'react'
import { Download, Database, Wifi, WifiOff, RefreshCw, Trash2, HardDrive, Printer } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
// Using inline badge and separator components since UI components may not exist
// import { Badge } from '../ui/badge'
// import { Separator } from '../ui/separator'
// import { useToast } from '../ui/use-toast'
import { useOfflineSync, useOnlineStatus } from '../../hooks/useOfflineData'
import { exportToJSON, exportToCSV, exportEquipmentsToPDF, exportAccessoriesToPDF, testPDFGeneration } from '../../utils/export'
import { 
  PrintableEquipmentTable, 
  PrintableAccessoryTable, 
  PrintableBrandTable,
  PrintableEquipmentTypeTable,
  PrintableAccessoryCategoryTable,
  printCurrentPage
} from '../ui/printable-table'
import type { Doc } from '@phone-equipements-app/backend/convex/_generated/dataModel'

type Equipment = Doc<'equipments'> & {
  brand: Doc<'brands'> | null
  equipmentType: Doc<'equipmentTypes'> | null
}

type Accessory = Doc<'accessories'>

interface DataExportPanelProps {
  equipments: Equipment[]
  accessories: Accessory[]
  brands: Doc<'brands'>[]
  equipmentTypes: Doc<'equipmentTypes'>[]
  accessoryCategories: Doc<'accessoryCategories'>[]
}

export const DataExportPanel = ({
  equipments,
  accessories,
  brands,
  equipmentTypes,
  accessoryCategories
}: DataExportPanelProps) => {
  const [isExporting, setIsExporting] = useState(false)
  const [showPrintPreview, setShowPrintPreview] = useState<string | null>(null)
  // const { toast } = useToast() // Commented out since useToast may not exist
  const toast = (options: any) => {
    console.log('Toast:', options.title, options.description)
    alert(`${options.title}: ${options.description}`)
  }
  const isOnline = useOnlineStatus()
  const {
    syncStatus,
    storageInfo,
    syncToOffline,
    loadOfflineData,
    clearOfflineData,
    updateStorageInfo
  } = useOfflineSync()

  const handleTestPDF = () => {
    console.log('Testing PDF generation...')
    const success = testPDFGeneration()
    if (success) {
      toast({
        title: 'Test PDF réussi',
        description: 'jsPDF fonctionne correctement'
      })
    } else {
      toast({
        title: 'Test PDF échoué',
        description: 'Problème avec jsPDF',
        variant: 'destructive'
      })
    }
  }

  const handleExport = async (format: 'json' | 'csv' | 'pdf', dataType: 'all' | 'equipments' | 'accessories' | 'brands') => {
    console.log('Export requested:', { format, dataType })
    console.log('Available data:', {
      equipments: equipments?.length || 0,
      accessories: accessories?.length || 0,
      brands: brands?.length || 0
    })
    
    setIsExporting(true)
    try {
      let filename: string
      let success = false

      switch (dataType) {
        case 'equipments':
          console.log('Exporting equipments with format:', format)
          console.log('Equipments data:', equipments)
          filename = `equipments_${new Date().toISOString().split('T')[0]}`
          if (format === 'json') {
            exportToJSON(equipments, filename)
            success = true
          } else if (format === 'csv') {
            const headers = ['label', 'brand.name', 'equipmentType.name', 'description']
            exportToCSV(equipments, filename, headers)
            success = true
          } else if (format === 'pdf') {
            try {
              console.log('Calling exportEquipmentsToPDF with:', equipments)
              exportEquipmentsToPDF(equipments)
              success = true
            } catch (error) {
              console.error('Erreur PDF équipements:', error)
              success = false
            }
          }
          break

        case 'accessories':
          console.log('Exporting accessories with format:', format)
          console.log('Accessories data:', accessories)
          filename = `accessories_${new Date().toISOString().split('T')[0]}`
          if (format === 'json') {
            exportToJSON(accessories, filename)
            success = true
          } else if (format === 'csv') {
            const headers = ['label', 'price', 'description', 'inStock']
            exportToCSV(accessories, filename, headers)
            success = true
          } else if (format === 'pdf') {
            try {
              console.log('Calling exportAccessoriesToPDF with:', accessories)
              exportAccessoriesToPDF(accessories as any)
              success = true
            } catch (error) {
              console.error('Erreur PDF accessoires:', error)
              success = false
            }
          }
          break

        case 'brands':
          filename = `brands_${new Date().toISOString().split('T')[0]}`
          if (format === 'json') {
            exportToJSON(brands, filename)
            success = true
          } else if (format === 'csv') {
            const headers = ['name', 'createdAt', 'updatedAt']
            exportToCSV(brands, filename, headers)
            success = true
          } else if (format === 'pdf') {
            // PDF export for brands not implemented in this simplified version
            success = false
          }
          break

        case 'all':
          filename = `all_data_${new Date().toISOString().split('T')[0]}`
          const allDataArray = [
            { type: 'equipments', data: equipments },
            { type: 'accessories', data: accessories },
            { type: 'brands', data: brands },
            { type: 'equipmentTypes', data: equipmentTypes },
            { type: 'accessoryCategories', data: accessoryCategories },
            { type: 'exportInfo', data: { exportDate: new Date().toISOString() } }
          ]
          if (format === 'json') {
            exportToJSON(allDataArray, filename)
            success = true
          }
          break
      }

      if (success) {
        toast({
          title: 'Export réussi',
          description: `Les données ont été exportées en ${format.toUpperCase()}`
        })
      } else {
        throw new Error('Export failed')
      }
    } catch (error) {
      console.error('Export error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue'
      toast({
        title: 'Erreur d\'export',
        description: `Erreur détaillée: ${errorMessage}`,
        variant: 'destructive'
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleSync = async () => {
    const success = await syncToOffline()
    if (success) {
      toast({
        title: 'Synchronisation réussie',
        description: 'Les données ont été sauvegardées hors ligne'
      })
      await updateStorageInfo()
    } else {
      toast({
        title: 'Erreur de synchronisation',
        description: 'Impossible de synchroniser les données',
        variant: 'destructive'
      })
    }
  }

  const handleLoadOffline = async () => {
    const data = await loadOfflineData()
    if (data) {
      toast({
        title: 'Données hors ligne chargées',
        description: `Dernière synchronisation: ${new Date(data.lastSync).toLocaleString()}`
      })
    } else {
      toast({
        title: 'Aucune donnée hors ligne',
        description: 'Aucune donnée hors ligne disponible',
        variant: 'destructive'
      })
    }
  }

  const handleClearOffline = async () => {
    const success = await clearOfflineData()
    if (success) {
      toast({
        title: 'Données supprimées',
        description: 'Les données hors ligne ont été supprimées'
      })
      await updateStorageInfo()
    } else {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer les données hors ligne',
        variant: 'destructive'
      })
    }
  }

  const handlePrint = (dataType: 'equipments' | 'accessories' | 'brands' | 'equipmentTypes' | 'accessoryCategories') => {
    setShowPrintPreview(dataType)
  }

  const renderPrintPreview = () => {
    if (!showPrintPreview) return null

    let content
    switch (showPrintPreview) {
      case 'equipments':
        content = <PrintableEquipmentTable equipments={equipments} />
        break
      case 'accessories':
        content = <PrintableAccessoryTable accessories={accessories} accessoryCategories={accessoryCategories} />
        break
      case 'brands':
        content = <PrintableBrandTable brands={brands} />
        break
      case 'equipmentTypes':
        content = <PrintableEquipmentTypeTable equipmentTypes={equipmentTypes} />
        break
      case 'accessoryCategories':
        content = <PrintableAccessoryCategoryTable accessoryCategories={accessoryCategories} />
        break
      default:
        return null
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-6xl max-h-[90vh] overflow-auto">
          <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
            <h3 className="text-lg font-semibold">Aperçu avant impression</h3>
            <div className="flex gap-2">
              <Button onClick={printCurrentPage} className="flex items-center gap-2">
                <Printer className="h-4 w-4" />
                Imprimer
              </Button>
              <Button variant="outline" onClick={() => setShowPrintPreview(null)}>
                Fermer
              </Button>
            </div>
          </div>
          <div className="p-4">
            {content}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isOnline ? <Wifi className="h-5 w-5 text-green-500" /> : <WifiOff className="h-5 w-5 text-red-500" />}
            État de la connexion
          </CardTitle>
          <CardDescription>
            Statut de la connexion et de la synchronisation des données
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Connexion:</span>
            <span className={`px-2 py-1 rounded text-sm ${isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {isOnline ? 'En ligne' : 'Hors ligne'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Synchronisation:</span>
            <span className="px-2 py-1 rounded text-sm bg-gray-100 text-gray-800">
              {syncStatus.status === 'synced' ? 'Synchronisé' : 
               syncStatus.status === 'syncing' ? 'Synchronisation...' :
               syncStatus.status === 'error' ? 'Erreur' :
               syncStatus.status === 'offline' ? 'Hors ligne' : 'Jamais synchronisé'}
            </span>
          </div>
          {syncStatus.lastSync && (
            <div className="flex items-center justify-between">
              <span>Dernière sync:</span>
              <span className="text-sm text-muted-foreground">
                {new Date(syncStatus.lastSync).toLocaleString()}
              </span>
            </div>
          )}
          {storageInfo && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Stockage utilisé:</span>
                <span className="text-sm">{storageInfo.formattedUsed}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${Math.min(storageInfo.percentage, 100)}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Offline Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Gestion des données hors ligne
          </CardTitle>
          <CardDescription>
            Synchroniser et gérer les données pour un usage hors ligne
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleSync}
              disabled={!isOnline || syncStatus.status === 'syncing'}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${syncStatus.status === 'syncing' ? 'animate-spin' : ''}`} />
              Synchroniser
            </Button>
            <Button
              variant="outline"
              onClick={handleLoadOffline}
              className="flex items-center gap-2"
            >
              <HardDrive className="h-4 w-4" />
              Charger hors ligne
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearOffline}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Vider le cache
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export des données
          </CardTitle>
          <CardDescription>
            Télécharger les données dans différents formats
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* All Data Export */}
          {/* Test PDF Button */}
          <div>
            <h4 className="font-medium mb-3">Test PDF</h4>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleTestPDF}
                disabled={isExporting}
                size="sm"
                variant="secondary"
              >
                Tester jsPDF
              </Button>
            </div>
          </div>

          <div className="border-t my-4"></div>

          <div>
            <h4 className="font-medium mb-3">Toutes les données</h4>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => handleExport('json', 'all')}
                disabled={isExporting}
                size="sm"
              >
                JSON Complet
              </Button>
            </div>
          </div>

          <div className="border-t my-4"></div>

          {/* Equipments Export */}
          <div>
            <h4 className="font-medium mb-3">Équipements ({equipments.length})</h4>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => handleExport('json', 'equipments')}
                disabled={isExporting}
                size="sm"
                variant="outline"
              >
                JSON
              </Button>
              <Button
                onClick={() => handleExport('csv', 'equipments')}
                disabled={isExporting}
                size="sm"
                variant="outline"
              >
                CSV
              </Button>
              <Button 
                onClick={() => handleExport('pdf', 'equipments')} 
                disabled={isExporting}
                size="sm"
                variant="outline"
              >
                PDF
              </Button>
              <Button 
                onClick={() => handlePrint('equipments')} 
                disabled={isExporting}
                size="sm"
                variant="outline"
                className="flex items-center gap-1"
              >
                <Printer className="h-3 w-3" />
                Imprimer
              </Button>
            </div>
          </div>

          <div className="border-t my-4"></div>

          {/* Accessories Export */}
          <div>
            <h4 className="font-medium mb-3">Accessoires ({accessories.length})</h4>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => handleExport('json', 'accessories')}
                disabled={isExporting}
                size="sm"
                variant="outline"
              >
                JSON
              </Button>
              <Button
                onClick={() => handleExport('csv', 'accessories')}
                disabled={isExporting}
                size="sm"
                variant="outline"
              >
                CSV
              </Button>
              <Button 
                onClick={() => handleExport('pdf', 'accessories')} 
                disabled={isExporting}
                size="sm"
                variant="outline"
              >
                PDF
              </Button>
              <Button 
                onClick={() => handlePrint('accessories')} 
                disabled={isExporting}
                size="sm"
                variant="outline"
                className="flex items-center gap-1"
              >
                <Printer className="h-3 w-3" />
                Imprimer
              </Button>
            </div>
          </div>

          <div className="border-t my-4"></div>

          {/* Brands Export */}
          <div>
            <h4 className="font-medium mb-3">Marques ({brands.length})</h4>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => handleExport('json', 'brands')}
                disabled={isExporting}
                size="sm"
                variant="outline"
              >
                JSON
              </Button>
              <Button
                onClick={() => handleExport('csv', 'brands')}
                disabled={isExporting}
                size="sm"
                variant="outline"
              >
                CSV
              </Button>
              <Button 
                onClick={() => handleExport('pdf', 'brands')} 
                disabled={isExporting}
                size="sm"
                variant="outline"
              >
                PDF
              </Button>
              <Button 
                onClick={() => handlePrint('brands')} 
                disabled={isExporting}
                size="sm"
                variant="outline"
                className="flex items-center gap-1"
              >
                <Printer className="h-3 w-3" />
                Imprimer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
      
      {renderPrintPreview()}
    </>
  )
}