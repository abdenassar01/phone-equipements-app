import React from 'react'
import type { Doc } from '@phone-equipements-app/backend/convex/_generated/dataModel'

type Equipment = Doc<'equipments'> & {
  brand: Doc<'brands'> | null
  equipmentType: Doc<'equipmentTypes'> | null
}

type Accessory = Doc<'accessories'>

interface PrintableTableProps {
  title: string
  subtitle?: string
  className?: string
  children: React.ReactNode
}

export const PrintableTable = ({ title, subtitle, className = '', children }: PrintableTableProps) => {
  return (
    <div className={`printable-table ${className}`}>
      <style>{`
        @media print {
          .printable-table {
            width: 100%;
            margin: 0;
            padding: 20px;
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
          }
          
          .print-header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
          }
          
          .print-title {
            font-size: 24px;
            font-weight: bold;
            margin: 0 0 5px 0;
            color: #333;
          }
          
          .print-subtitle {
            font-size: 14px;
            color: #666;
            margin: 0;
          }
          
          .print-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          
          .print-table th,
          .print-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
            vertical-align: top;
          }
          
          .print-table th {
            background-color: #f5f5f5;
            font-weight: bold;
            font-size: 11px;
            text-transform: uppercase;
          }
          
          .print-table td {
            font-size: 10px;
          }
          
          .print-table tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          
          .print-footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
          }
          
          /* Hide non-printable elements */
          .no-print {
            display: none !important;
          }
        }
        
        @media screen {
          .printable-table {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
          }
          
          .print-header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 15px;
          }
          
          .print-title {
            font-size: 28px;
            font-weight: bold;
            margin: 0 0 8px 0;
            color: #1f2937;
          }
          
          .print-subtitle {
            font-size: 16px;
            color: #6b7280;
            margin: 0;
          }
          
          .print-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          
          .print-table th,
          .print-table td {
            border: 1px solid #e5e7eb;
            padding: 12px;
            text-align: left;
            vertical-align: top;
          }
          
          .print-table th {
            background-color: #f9fafb;
            font-weight: 600;
            font-size: 14px;
            color: #374151;
          }
          
          .print-table td {
            font-size: 14px;
            color: #1f2937;
          }
          
          .print-table tr:hover {
            background-color: #f3f4f6;
          }
          
          .print-footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding-top: 15px;
          }
        }
      `}</style>
      
      <div className="print-header">
        <h1 className="print-title">{title}</h1>
        {subtitle && <p className="print-subtitle">{subtitle}</p>}
      </div>
      
      {children}
      
      <div className="print-footer">
        <p>Généré le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}</p>
      </div>
    </div>
  )
}

interface EquipmentTableProps {
  equipments: Equipment[]
  title?: string
}

export const PrintableEquipmentTable = ({ equipments, title = "Liste des Équipements" }: EquipmentTableProps) => {
  return (
    <PrintableTable 
      title={title} 
      subtitle={`${equipments.length} équipement(s) au total`}
    >
      <table className="print-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Marque</th>
            <th>Type</th>
            <th>Prix</th>
            <th>SKU</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {equipments.map((equipment) => (
            <tr key={equipment._id}>
              <td>{equipment.label}</td>
              <td>{equipment.brand?.name || 'N/A'}</td>
              <td>{equipment.equipmentType?.name || 'N/A'}</td>
              <td>N/A</td>
              <td>N/A</td>
              <td>{equipment.description || 'Aucune description'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </PrintableTable>
  )
}

interface AccessoryTableProps {
  accessories: Accessory[]
  accessoryCategories: Doc<'accessoryCategories'>[]
  title?: string
}

export const PrintableAccessoryTable = ({ 
  accessories, 
  accessoryCategories, 
  title = "Liste des Accessoires" 
}: AccessoryTableProps) => {
  const getCategoryName = (categoryId: string) => {
    const category = accessoryCategories.find(cat => cat._id === categoryId)
    return category?.name || 'N/A'
  }

  return (
    <PrintableTable 
      title={title} 
      subtitle={`${accessories.length} accessoire(s) au total`}
    >
      <table className="print-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Catégorie</th>
            <th>Prix</th>
            <th>SKU</th>
            <th>En Stock</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {accessories.map((accessory) => (
            <tr key={accessory._id}>
              <td>{accessory.label}</td>
              <td>{getCategoryName(accessory.categoryId)}</td>
              <td>{accessory.price ? `${accessory.price}€` : 'N/A'}</td>
              <td>{accessory.sku || 'N/A'}</td>
              <td>{accessory.inStock ? 'Oui' : 'Non'}</td>
              <td>{accessory.description || 'Aucune description'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </PrintableTable>
  )
}

interface BrandTableProps {
  brands: Doc<'brands'>[]
  title?: string
}

export const PrintableBrandTable = ({ brands, title = "Liste des Marques" }: BrandTableProps) => {
  return (
    <PrintableTable 
      title={title} 
      subtitle={`${brands.length} marque(s) au total`}
    >
      <table className="print-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Description</th>
            <th>Site Web</th>
            <th>Date de création</th>
          </tr>
        </thead>
        <tbody>
          {brands.map((brand) => (
            <tr key={brand._id}>
              <td>{brand.name}</td>
              <td>Aucune description</td>
              <td>N/A</td>
              <td>{new Date(brand.createdAt).toLocaleDateString('fr-FR')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </PrintableTable>
  )
}

interface EquipmentTypeTableProps {
  equipmentTypes: Doc<'equipmentTypes'>[]
  title?: string
}

export const PrintableEquipmentTypeTable = ({ 
  equipmentTypes, 
  title = "Types d'Équipements" 
}: EquipmentTypeTableProps) => {
  return (
    <PrintableTable 
      title={title} 
      subtitle={`${equipmentTypes.length} type(s) d'équipement au total`}
    >
      <table className="print-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Description</th>
            <th>Icône</th>
            <th>Date de création</th>
          </tr>
        </thead>
        <tbody>
          {equipmentTypes.map((type) => (
            <tr key={type._id}>
              <td>{type.name}</td>
              <td>{type.description || 'Aucune description'}</td>
              <td>N/A</td>
              <td>{new Date(type.createdAt).toLocaleDateString('fr-FR')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </PrintableTable>
  )
}

interface AccessoryCategoryTableProps {
  accessoryCategories: Doc<'accessoryCategories'>[]
  title?: string
}

export const PrintableAccessoryCategoryTable = ({ 
  accessoryCategories, 
  title = "Catégories d'Accessoires" 
}: AccessoryCategoryTableProps) => {
  return (
    <PrintableTable 
      title={title} 
      subtitle={`${accessoryCategories.length} catégorie(s) d'accessoire au total`}
    >
      <table className="print-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Description</th>
            <th>Icône</th>
            <th>Date de création</th>
          </tr>
        </thead>
        <tbody>
          {accessoryCategories.map((category) => (
            <tr key={category._id}>
              <td>{category.name}</td>
              <td>{category.description || 'Aucune description'}</td>
              <td>{category.icon || 'N/A'}</td>
              <td>{new Date(category.createdAt).toLocaleDateString('fr-FR')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </PrintableTable>
  )
}

// Utility function to print a specific table
export const printTable = (elementId: string) => {
  const printContent = document.getElementById(elementId)
  if (!printContent) {
    console.error(`Element with id '${elementId}' not found`)
    return
  }
  
  const originalContent = document.body.innerHTML
  document.body.innerHTML = printContent.innerHTML
  window.print()
  document.body.innerHTML = originalContent
  window.location.reload() // Reload to restore event listeners
}

// Utility function to open print dialog for current page
export const printCurrentPage = () => {
  window.print()
}