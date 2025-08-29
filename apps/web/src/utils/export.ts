import jsPDF from 'jspdf'
import 'jspdf-autotable'
import type { Doc } from '@phone-equipements-app/backend/convex/_generated/dataModel'
import { autoTable } from 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

export const testPDFGeneration = () => {
  try {
    console.log('Testing PDF generation...')
    const doc = new jsPDF()
    doc.text('Test PDF', 10, 10)
    doc.save('test.pdf')
    console.log('PDF test successful')
    return true
  } catch (error) {
    console.error('PDF test failed:', error)
    return false
  }
}

type Equipment = Doc<'equipments'> & {
  brand: Doc<'brands'> | null
  equipmentType: Doc<'equipmentTypes'> | null
}

type Accessory = Doc<'accessories'> & {
  category: Doc<'accessoryCategories'> | null
}

export const exportToJSON = (data: any[], filename: string) => {
  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const exportToCSV = (data: any[], filename: string, headers: string[]) => {
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = getNestedValue(row, header)
        return typeof value === 'string' && value.includes(',')
          ? `"${value.replace(/"/g, '""')}"`
          : value || ''
      }).join(',')
    )
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

export const exportEquipmentsToPDF = (equipments: Equipment[]) => {
  try {
    console.log('Starting PDF export with equipments:', equipments)
    console.log('Number of equipments:', equipments?.length || 0)

    if (!equipments || equipments.length === 0) {
      console.warn('No equipments data provided for PDF export')
      throw new Error('Aucun équipement à exporter')
    }

    console.log('Creating jsPDF instance...')
    const doc = new jsPDF()
    console.log('jsPDF instance created successfully')

    // Add title
    console.log('Adding title...')
    doc.setFontSize(20)
    doc.text('Liste des Équipements par Marque', 14, 22)
    console.log('Title added successfully')

    console.log('Adding date...')
    doc.setFontSize(10)
    doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 14, 30)
    console.log('Date added successfully')

    console.log('Grouping equipments by brand...')
    const groupedByBrand = equipments.reduce((acc, equipment) => {
      const brandName = equipment.brand?.name || 'Sans marque'
      if (!acc[brandName]) {
        acc[brandName] = []
      }
      acc[brandName].push(equipment)
      return acc
    }, {} as Record<string, Equipment[]>)
    console.log('Grouped by brand:', Object.keys(groupedByBrand))

    let currentY = 40

    console.log('Creating tables for each brand...')
    Object.entries(groupedByBrand).forEach(([brandName, brandEquipments]) => {
      console.log(`Processing brand: ${brandName} with ${brandEquipments.length} equipments`)

      console.log('Adding brand header...')
      doc.setFontSize(14)
      doc.setFont("helvetica", 'bold')
      doc.text(`Marque: ${brandName}`, 14, currentY)
      currentY += 10
      console.log('Brand header added successfully')

      console.log('Preparing table data...')
      const tableData: string[][] = []
      brandEquipments.forEach((equipment, index) => {
        console.log(`Processing equipment ${index + 1}:`, equipment.label)

        const variants = (equipment as any).variants
        if (variants && Array.isArray(variants) && variants.length > 0) {
          variants.forEach((variant: any) => {
            tableData.push([
              equipment.label || 'Sans nom',
              variant.label || 'Variante standard',
              `${variant.price || 0} DH`
            ])
          })
        } else {
          tableData.push([
            equipment.label || 'Sans nom',
            'Modèle standard',
            (equipment as any).price ? `${(equipment as any).price} DH` : 'Prix non défini'
          ])
        }
      })
      console.log(`Table data prepared for ${brandName}:`, tableData.length, 'rows')

    console.log('Calling autoTable...')
    try {
      autoTable(doc, {
        head: [['Équipement', 'Variante', 'Prix']],
        body: tableData,
        startY: currentY,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [147, 51, 234] },
        margin: { left: 14 }
      })
      console.log('autoTable completed successfully')
    } catch (tableError) {
      console.error('Error in autoTable:', tableError)
      throw tableError
    }

    currentY = (doc as any).lastAutoTable.finalY + 15
    console.log('Updated currentY:', currentY)

      // Add new page if needed
      if (currentY > 250) {
        doc.addPage()
        currentY = 20
      }
    })
    console.log('All brands processed successfully')

    console.log('Saving PDF...')
    doc.save('equipements_par_marque.pdf')
    console.log('PDF saved successfully')
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    })
    throw new Error(`Erreur lors de la génération du PDF des équipements: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
  }
}

export const exportAccessoriesToPDF = (accessories: Accessory[]) => {
  try {
    console.log('Starting accessories PDF export with data:', accessories)
    console.log('Number of accessories:', accessories?.length || 0)

    if (!accessories || accessories.length === 0) {
      console.warn('No accessories data provided for PDF export')
      throw new Error('Aucun accessoire à exporter')
    }

    const doc = new jsPDF()

  // Add title
  doc.setFontSize(20)
  doc.text('Liste des Accessoires', 14, 22)

  // Add generation date
  doc.setFontSize(10)
  doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 14, 30)

  // Prepare table data
  const tableData = accessories.map(accessory => [
    accessory.label,
    `${accessory.price || 0} DH`,
    accessory.description || 'Aucune description',
    accessory.inStock ? 'En stock' : 'Rupture'
  ])

  // Add table
  autoTable(doc, {
    head: [['Nom', 'Prix', 'Description', 'Stock']],
    body: tableData,
    startY: 35,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [147, 51, 234] },
    columnStyles: {
      2: { cellWidth: 60 } // Description column wider
    }
  })

    doc.save('accessoires.pdf')
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error)
    throw new Error('Erreur lors de la génération du PDF des accessoires')
  }
}

export const exportBrandsToPDF = (brands: Doc<'brands'>[]) => {
  const doc = new jsPDF()

  // Add title
  doc.setFontSize(20)
  doc.text('Liste des Marques', 14, 22)

  // Add generation date
  doc.setFontSize(10)
  doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 14, 30)

  // Prepare table data
  const tableData = brands.map(brand => [
    brand.name,
    new Date(brand.createdAt).toLocaleDateString('fr-FR'),
    new Date(brand.updatedAt).toLocaleDateString('fr-FR')
  ])

  // Add table
  autoTable(doc, {
    head: [['Nom', 'Date de création', 'Dernière modification']],
    body: tableData,
    startY: 35,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [147, 51, 234] } // Purple header
  })

  doc.save('marques.pdf')
}

// CSV Export Helpers
export const exportEquipmentsToCSV = (equipments: Equipment[]) => {
  const headers = [
    'label', 'brand.name', 'equipmentType.name', 'description',
    'variants.length', 'createdAt', 'updatedAt'
  ]

  const processedData = equipments.map(equipment => ({
    ...equipment,
    'variants.length': equipment.variants?.length || 0,
    createdAt: new Date(equipment.createdAt).toLocaleDateString('fr-FR'),
    updatedAt: new Date(equipment.updatedAt).toLocaleDateString('fr-FR')
  }))

  exportToCSV(processedData, 'equipements', headers)
}

export const exportAccessoriesToCSV = (accessories: Accessory[]) => {
  const headers = [
    'name', 'category.name', 'price', 'description', 'inStock',
    'compatibility', 'createdAt', 'updatedAt'
  ]

  const processedData = accessories.map(accessory => ({
    ...accessory,
    inStock: accessory.inStock ? 'Oui' : 'Non',
    createdAt: new Date(accessory.createdAt).toLocaleDateString('fr-FR'),
    updatedAt: new Date(accessory.updatedAt).toLocaleDateString('fr-FR')
  }))

  exportToCSV(processedData, 'accessoires', headers)
}

// Complete data export
export const exportAllData = async (data: {
  equipments: Equipment[]
  accessories: Accessory[]
  brands: Doc<'brands'>[]
  equipmentTypes: Doc<'equipmentTypes'>[]
  accessoryCategories: Doc<'accessoryCategories'>[]
}) => {
  const completeData = {
    ...data,
    exportDate: new Date().toISOString(),
    version: '1.0'
  }

  exportToJSON([completeData], `phone-equipements-backup-${new Date().toISOString().split('T')[0]}`)
}

// Utility to download file from URL
export const downloadFile = (url: string, filename: string) => {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}