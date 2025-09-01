import React, { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@phone-equipements-app/backend/convex/_generated/api'
import type { Doc, Id } from '@phone-equipements-app/backend/convex/_generated/dataModel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/ui/modal'
import { PlusIcon, EditIcon, TrashIcon, SaveIcon, XIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FileUpload } from '@/components/ui/file-upload'
import { ImageGallery, ImageDisplay } from '@/components/ui/image-display'
import { DataExportPanel } from '@/components/admin/DataExportPanel'

type TabType = 'brands' | 'equipmentTypes' | 'equipments' | 'accessoryCategories' | 'accessories' | 'dataExport'

type ModalState = {
  isOpen: boolean
  type: 'create' | 'edit'
  entity: TabType
  data?: any
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<TabType>('brands')
  const [modalState, setModalState] = useState<ModalState | null>(null)

  const tabs = [
    { id: 'brands' as const, label: 'Marques' },
    { id: 'equipmentTypes' as const, label: 'Types d\'Équipements' },
    { id: 'equipments' as const, label: 'Équipements' },
    { id: 'accessoryCategories' as const, label: 'Catégories d\'Accessoires' },
    { id: 'accessories' as const, label: 'Accessoires' },
    // { id: 'dataExport' as const, label: 'Export & Hors ligne' },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'brands':
        return <BrandsTab modalState={modalState} setModalState={setModalState} />
      case 'equipmentTypes':
        return <EquipmentTypesTab modalState={modalState} setModalState={setModalState} />
      case 'equipments':
        return <EquipmentsTab modalState={modalState} setModalState={setModalState} />
      case 'accessoryCategories':
        return <AccessoryCategoriesTab modalState={modalState} setModalState={setModalState} />
      case 'accessories':
        return <AccessoriesTab modalState={modalState} setModalState={setModalState} />
      // case 'dataExport':
      //   return <DataExportTab />
      default:
        return <div>Sélectionnez un onglet pour gérer les données</div>
    }
  }

  return (
    <div className="min-h-screen">
      <div className="">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Panneau d'Administration</h1>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'py-2 px-1 border-b-2 font-medium text-sm',
                  activeTab === tab.id
                    ? 'border-pink-500 text-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="rounded-xl">
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}

// Data Export Tab Component
function DataExportTab() {
  const equipments = useQuery(api.equipments.getAllEquipments, { limit: 1000 })
  const accessories = useQuery(api.accessories.getAllAccessories, { limit: 1000 })
  const brands = useQuery(api.brands.getAllBrands)
  const equipmentTypes = useQuery(api.equipmentTypes.getAllEquipmentTypes)
  const accessoryCategories = useQuery(api.accessoryCategories.getAllAccessoryCategories)

  const isLoading = equipments === undefined ||
                   accessories === undefined ||
                   brands === undefined ||
                   equipmentTypes === undefined ||
                   accessoryCategories === undefined

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2">Chargement des données...</span>
      </div>
    )
  }

  return (
    <DataExportPanel
      equipments={equipments || []}
      accessories={(accessories || []).map(acc => ({
        ...acc,
        category: null // Add required category property
      }))}
      brands={brands || []}
      equipmentTypes={equipmentTypes || []}
      accessoryCategories={accessoryCategories || []}
    />
  )
}

// Brands Tab Component
function BrandsTab({ modalState, setModalState }: { modalState: ModalState | null, setModalState: (state: ModalState | null) => void }) {
  const brands = useQuery(api.brands.getAllBrands)
  const createBrand = useMutation(api.brands.createBrand)
  const updateBrand = useMutation(api.brands.updateBrand)
  const deleteBrand = useMutation(api.brands.deleteBrand)

  const [formData, setFormData] = useState({ name: '', logo: undefined as Id<'_storage'> | undefined })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (modalState?.type === 'create') {
        await createBrand({
          name: formData.name,
          logo: formData.logo
        })
      } else if (modalState?.type === 'edit' && modalState.data) {
        await updateBrand({
          id: modalState.data._id,
          name: formData.name,
          logo: formData.logo
        })
      }
      setModalState(null)
      setFormData({ name: '', logo: undefined })
    } catch (error) {
      console.error('Error saving brand:', error)
    }
  }

  const handleEdit = (brand: Doc<'brands'>) => {
    setModalState({ isOpen: true, type: 'edit', entity: 'brands', data: brand })
    setFormData({
      name: brand.name,
      logo: brand.logo
    })
  }

  const handleDelete = async (id: Id<'brands'>) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette marque ?')) {
      await deleteBrand({ id })
    }
  }

  const openCreateModal = () => {
    setModalState({ isOpen: true, type: 'create', entity: 'brands' })
    setFormData({ name: '', logo: undefined })
  }

  const closeModal = () => {
    setModalState(null)
    setFormData({ name: '', logo: undefined })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Gestion des Marques</h2>
        <Button
          onClick={openCreateModal}
          className="bg-pink-500 hover:bg-pink-600"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Ajouter une Marque
        </Button>
      </div>

      {modalState?.entity === 'brands' && (
        <Modal title='' isOpen={modalState.isOpen} onClose={closeModal}>
          <div className="p-2">
            <h3 className="text-lg font-semibold mb-4">
              {modalState.type === 'create' ? 'Créer une Marque' : 'Modifier la Marque'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nom de la Marque</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <FileUpload
                  label="Logo de la Marque (optionnel)"
                  value={formData.logo ? [formData.logo] : []}
                  onChange={(files) => setFormData({ ...formData, logo: files[0] })}
                  multiple={false}
                  accept="image/*"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="submit"
                  className="bg-pink-500 hover:bg-pink-600"
                >
                  <SaveIcon className="w-4 h-4 mr-2" />
                  {modalState.type === 'create' ? 'Créer' : 'Mettre à jour'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                >
                  <XIcon className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* Brands List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {brands?.map((brand) => (
          <Card key={brand._id} className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h3 className="font-semibold">{brand.name}</h3>
                {brand.logo && (
                  <div className="mt-2">
                    <ImageDisplay storageId={brand.logo} alt={brand.name} className="w-12 h-12 object-contain rounded-lg" />
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(brand)}
                >
                  <EditIcon className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(brand._id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Equipment Types Tab Component
function EquipmentTypesTab({ modalState, setModalState }: { modalState: ModalState | null, setModalState: (state: ModalState | null) => void }) {
  const equipmentTypes = useQuery(api.equipmentTypes.getAllEquipmentTypes)
  const createEquipmentType = useMutation(api.equipmentTypes.createEquipmentType)
  const updateEquipmentType = useMutation(api.equipmentTypes.updateEquipmentType)
  const deleteEquipmentType = useMutation(api.equipmentTypes.deleteEquipmentType)

  const [formData, setFormData] = useState({ name: '', description: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (modalState?.type === 'create') {
        await createEquipmentType({
          name: formData.name,
          description: formData.description || undefined
        })
      } else if (modalState?.type === 'edit' && modalState.data) {
        await updateEquipmentType({
          id: modalState.data._id,
          name: formData.name,
          description: formData.description || undefined
        })
      }
      setModalState(null)
      setFormData({ name: '', description: '' })
    } catch (error) {
      console.error('Error saving equipment type:', error)
    }
  }

  const handleEdit = (equipmentType: Doc<'equipmentTypes'>) => {
    setModalState({ isOpen: true, type: 'edit', entity: 'equipmentTypes', data: equipmentType })
    setFormData({
      name: equipmentType.name,
      description: equipmentType.description || ''
    })
  }

  const handleDelete = async (id: Id<'equipmentTypes'>) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce type d\'équipement ?')) {
      await deleteEquipmentType({ id })
    }
  }

  const openCreateModal = () => {
    setModalState({ isOpen: true, type: 'create', entity: 'equipmentTypes' })
    setFormData({ name: '', description: '' })
  }

  const closeModal = () => {
    setModalState(null)
    setFormData({ name: '', description: '' })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Gestion des Types d'Équipements</h2>
        <Button
          onClick={openCreateModal}
          className="bg-pink-500 hover:bg-pink-600"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Ajouter un Type d'Équipement
        </Button>
      </div>

      {/* Modal for Create/Edit */}
      {modalState?.entity === 'equipmentTypes' && (
        <Modal title='' isOpen={modalState.isOpen} onClose={closeModal}>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              {modalState.type === 'create' ? 'Créer un Type d\'Équipement' : 'Modifier le Type d\'Équipement'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nom du Type d'Équipement</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description (optionnelle)</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="submit"
                  className="bg-pink-500 hover:bg-pink-600"
                >
                  <SaveIcon className="w-4 h-4 mr-2" />
                  {modalState.type === 'create' ? 'Créer' : 'Mettre à jour'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                >
                  <XIcon className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* Equipment Types List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {equipmentTypes?.map((equipmentType) => (
          <Card key={equipmentType._id} className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h3 className="font-semibold">{equipmentType.name}</h3>
                {equipmentType.description && (
                  <p className="text-sm text-gray-600 mt-1">{equipmentType.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(equipmentType)}
                >
                  <EditIcon className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(equipmentType._id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Equipments Tab Component
function EquipmentsTab({ modalState, setModalState }: { modalState: ModalState | null, setModalState: (state: ModalState | null) => void }) {
  const equipments = useQuery(api.equipments.getAllEquipments, {})
  const brands = useQuery(api.brands.getAllBrands)
  const equipmentTypes = useQuery(api.equipmentTypes.getAllEquipmentTypes)
  const createEquipment = useMutation(api.equipments.createEquipment)
  const updateEquipment = useMutation(api.equipments.updateEquipment)
  const deleteEquipment = useMutation(api.equipments.deleteEquipment)

  const [formData, setFormData] = useState({
    label: '',
    description: '',
    brandId: '',
    equipmentTypeId: ''
  })

  const [variants, setVariants] = useState<Array<{
    label: string
    price: string
  }>>([{ label: '', price: '' }])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const variantsArray = variants.map(v => ({
        label: v.label,
        price: parseFloat(v.price)
      })).filter(v => v.label && v.price)

      if (modalState?.type === 'create') {
        await createEquipment({
          label: formData.label,
          description: formData.description,
          brandId: formData.brandId as Id<'brands'>,
          equipmentTypeId: formData.equipmentTypeId as Id<'equipmentTypes'>,
          variants: variantsArray
        })
      } else if (modalState?.type === 'edit' && modalState.data) {
        await updateEquipment({
          id: modalState.data._id,
          label: formData.label,
          description: formData.description,
          brandId: formData.brandId as Id<'brands'>,
          equipmentTypeId: formData.equipmentTypeId as Id<'equipmentTypes'>,
          variants: variantsArray
        })
      }
      setModalState(null)
      setFormData({ label: '', description: '', brandId: '', equipmentTypeId: '' })
      setVariants([{ label: '', price: '' }])
    } catch (error) {
      console.error('Error saving equipment:', error)
    }
  }

  const handleEdit = (equipment: Doc<'equipments'>) => {
    setModalState({ isOpen: true, type: 'edit', entity: 'equipments', data: equipment })
    setFormData({
      label: equipment.label,
      description: equipment.description,
      brandId: equipment.brandId,
      equipmentTypeId: equipment.equipmentTypeId
    })
    setVariants(equipment.variants.map(v => ({
      label: v.label || '',
      price: v.price?.toString() || ''
    })))
  }

  const handleDelete = async (id: Id<'equipments'>) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet équipement ?')) {
      await deleteEquipment({ id })
    }
  }

  const openCreateModal = () => {
    setModalState({ isOpen: true, type: 'create', entity: 'equipments' })
    setFormData({ label: '', description: '', brandId: '', equipmentTypeId: '' })
    setVariants([{ label: '', price: '' }])
  }

  const closeModal = () => {
    setModalState(null)
    setFormData({ label: '', description: '', brandId: '', equipmentTypeId: '' })
    setVariants([{ label: '', price: '' }])
  }

  const addVariant = () => {
    setVariants([...variants, { label: '', price: '' }])
  }

  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index))
    }
  }

  const updateVariant = (index: number, field: string, value: string) => {
    const updatedVariants = [...variants]
    updatedVariants[index] = { ...updatedVariants[index], [field]: value }
    setVariants(updatedVariants)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Gestion des Équipements</h2>
        <Button
          onClick={openCreateModal}
          className="bg-pink-500 hover:bg-pink-600"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Ajouter un Équipement
        </Button>
      </div>

      {/* Modal for Create/Edit */}
      {modalState?.entity === 'equipments' && (
        <Modal title='' isOpen={modalState.isOpen} onClose={closeModal}>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              {modalState.type === 'create' ? 'Créer un Équipement' : 'Modifier l\'Équipement'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="label">Libellé de l'Équipement</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="brandId">Marque</Label>
                <select
                  id="brandId"
                  value={formData.brandId}
                  onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                  className="w-full h-9 px-3 rounded-md border border-input bg-background"
                  required
                >
                  <option value="">Sélectionner une Marque</option>
                  {brands?.map((brand) => (
                    <option key={brand._id} value={brand._id}>{brand.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="equipmentTypeId">Type d'Équipement</Label>
                <select
                  id="equipmentTypeId"
                  value={formData.equipmentTypeId}
                  onChange={(e) => setFormData({ ...formData, equipmentTypeId: e.target.value })}
                  className="w-full h-9 px-3 rounded-md border border-input bg-background"
                  required
                >
                  <option value="">Sélectionner un Type d'Équipement</option>
                  {equipmentTypes?.map((type) => (
                    <option key={type._id} value={type._id}>{type.name}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Variants Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Variantes</Label>
                <Button type="button" onClick={addVariant} size="sm" variant="outline">
                  <PlusIcon className="w-4 h-4 mr-1" />
                  Ajouter une Variante
                </Button>
              </div>

              {variants.map((variant, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Variante {index + 1}</span>
                    {variants.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeVariant(index)}
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor={`variant-label-${index}`}>Libellé</Label>
                      <Input
                        id={`variant-label-${index}`}
                        value={variant.label}
                        onChange={(e) => updateVariant(index, 'label', e.target.value)}
                        placeholder="ex: 64GB, 128GB"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor={`variant-price-${index}`}>Prix</Label>
                      <Input
                        id={`variant-price-${index}`}
                        type="number"
                        step="0.01"
                        value={variant.price}
                        onChange={(e) => updateVariant(index, 'price', e.target.value)}
                        placeholder="0,00"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="submit"
                className="bg-pink-500 hover:bg-pink-600"
              >
                <SaveIcon className="w-4 h-4 mr-2" />
                {modalState.type === 'create' ? 'Créer' : 'Mettre à jour'}
              </Button>
              <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                >
                  <XIcon className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
            </div>
            </form>
          </div>
        </Modal>
      )}

      {/* Equipments List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {equipments?.map((equipment) => {
          const brand = brands?.find(b => b._id === equipment.brandId)
          const equipmentType = equipmentTypes?.find(t => t._id === equipment.equipmentTypeId)

          return (
            <Card key={equipment._id} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold">{equipment.label}</h3>
                  <p className="text-sm text-gray-600">{equipment.description}</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">Marque:</span> {brand?.name || 'Inconnue'}
                    </p>
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">Type:</span> {equipmentType?.name || 'Inconnu'}
                    </p>
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">Variantes:</span> {equipment.variants?.length || 0}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(equipment)}
                  >
                    <EditIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(equipment._id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

// Accessory Categories Tab Component
function AccessoryCategoriesTab({ modalState, setModalState }: { modalState: ModalState | null, setModalState: (state: ModalState | null) => void }) {
  const accessoryCategories = useQuery(api.accessoryCategories.getAllAccessoryCategories)
  const createAccessoryCategory = useMutation(api.accessoryCategories.createAccessoryCategory)
  const updateAccessoryCategory = useMutation(api.accessoryCategories.updateAccessoryCategory)
  const deleteAccessoryCategory = useMutation(api.accessoryCategories.deleteAccessoryCategory)

  const [formData, setFormData] = useState({ name: '', description: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (modalState?.type === 'create') {
        await createAccessoryCategory({
          name: formData.name,
          description: formData.description || undefined
        })
      } else if (modalState?.type === 'edit' && modalState.data) {
        await updateAccessoryCategory({
          id: modalState.data._id,
          name: formData.name,
          description: formData.description || undefined
        })
      }
      setModalState(null)
      setFormData({ name: '', description: '' })
    } catch (error) {
      console.error('Error saving accessory category:', error)
    }
  }

  const handleEdit = (accessoryCategory: Doc<'accessoryCategories'>) => {
    setModalState({ isOpen: true, type: 'edit', entity: 'accessoryCategories', data: accessoryCategory })
    setFormData({
      name: accessoryCategory.name,
      description: accessoryCategory.description || ''
    })
  }

  const handleDelete = async (id: Id<'accessoryCategories'>) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie d\'accessoire ?')) {
      await deleteAccessoryCategory({ id })
    }
  }

  const openCreateModal = () => {
    setModalState({ isOpen: true, type: 'create', entity: 'accessoryCategories' })
    setFormData({ name: '', description: '' })
  }

  const closeModal = () => {
    setModalState(null)
    setFormData({ name: '', description: '' })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Gestion des Catégories d'Accessoires</h2>
        <Button
          onClick={openCreateModal}
          className="bg-pink-500 hover:bg-pink-600"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Ajouter une Catégorie d'Accessoire
        </Button>
      </div>

      {/* Modal for Create/Edit */}
      {modalState?.entity === 'accessoryCategories' && (
        <Modal title='' isOpen={modalState.isOpen} onClose={closeModal}>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              {modalState.type === 'create' ? 'Créer une Catégorie d\'Accessoire' : 'Modifier la Catégorie d\'Accessoire'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nom de la Catégorie</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description (optionnelle)</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="submit"
                  className="bg-pink-500 hover:bg-pink-600"
                >
                  <SaveIcon className="w-4 h-4 mr-2" />
                  {modalState.type === 'create' ? 'Créer' : 'Mettre à jour'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                >
                  <XIcon className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* Accessory Categories List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accessoryCategories?.map((accessoryCategory) => (
          <Card key={accessoryCategory._id} className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h3 className="font-semibold">{accessoryCategory.name}</h3>
                {accessoryCategory.description && (
                  <p className="text-sm text-gray-600 mt-1">{accessoryCategory.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(accessoryCategory)}
                >
                  <EditIcon className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(accessoryCategory._id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Accessories Tab Component
function AccessoriesTab({ modalState, setModalState }: { modalState: ModalState | null, setModalState: (state: ModalState | null) => void }) {
  const accessories = useQuery(api.accessories.getAllAccessories, {})
  const accessoryCategories = useQuery(api.accessoryCategories.getAllAccessoryCategories)
  const createAccessory = useMutation(api.accessories.createAccessory)
  const updateAccessory = useMutation(api.accessories.updateAccessory)
  const deleteAccessory = useMutation(api.accessories.deleteAccessory)

  const [formData, setFormData] = useState({
    label: '',
    description: '',
    price: '',
    sku: '',
    inStock: true,
    categoryId: '',
    images: [] as Id<'_storage'>[]
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (modalState?.type === 'create') {
        await createAccessory({
          label: formData.label,
          description: formData.description,
          price: parseFloat(formData.price),
          sku: formData.sku,
          inStock: formData.inStock,
          categoryId: formData.categoryId as Id<'accessoryCategories'>,
          images: formData.images.length > 0 ? formData.images : undefined
        })
      } else if (modalState?.type === 'edit' && modalState.data) {
        await updateAccessory({
          id: modalState.data._id,
          label: formData.label,
          description: formData.description,
          price: parseFloat(formData.price),
          sku: formData.sku,
          inStock: formData.inStock,
          categoryId: formData.categoryId as Id<'accessoryCategories'>,
          images: formData.images.length > 0 ? formData.images : undefined
        })
      }
      setModalState(null)
      setFormData({
        label: '',
        description: '',
        price: '',
        sku: '',
        inStock: true,
        categoryId: '',
        images: []
      })
    } catch (error) {
      console.error('Error saving accessory:', error)
    }
  }

  const handleEdit = (accessory: Doc<'accessories'>) => {
    setModalState({ isOpen: true, type: 'edit', entity: 'accessories', data: accessory })
    setFormData({
      label: accessory.label,
      price: accessory.price.toString(),
      description: accessory.description || '',
      sku: accessory.sku || '0',
      inStock: accessory.inStock || false,
      categoryId: accessory.categoryId,
      images: accessory.images || []
    })
  }

  const handleDelete = async (id: Id<'accessories'>) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet accessoire ?')) {
      await deleteAccessory({ id })
    }
  }

  const openCreateModal = () => {
    setModalState({ isOpen: true, type: 'create', entity: 'accessories' })
    setFormData({
      label: '',
      description: '',
      inStock: true,
      price: '',
      sku: '',
      categoryId: '',
      images: []
    })
  }

  const closeModal = () => {
    setModalState(null)
    setFormData({
      label: '',
      description: '',
      price: '',
      sku: '',
      inStock: true,
      categoryId: '',
      images: []
    })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Gestion des Accessoires</h2>
        <Button
          onClick={openCreateModal}
          className="bg-pink-500 hover:bg-pink-600"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Ajouter un Accessoire
        </Button>
      </div>

      {/* Modal for Create/Edit */}
      {modalState?.entity === 'accessories' && (
        <Modal title='' isOpen={modalState.isOpen} onClose={closeModal}>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              {modalState.type === 'create' ? 'Créer un Accessoire' : 'Modifier l\'Accessoire'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="label">Libellé de l'Accessoire</Label>
                  <Input
                    id="label"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="categoryId">Catégorie</Label>
                  <select
                    id="categoryId"
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full h-9 px-3 rounded-md border border-input bg-background"
                    required
                  >
                    <option value="">Sélectionner une Catégorie</option>
                    {accessoryCategories?.map((category) => (
                      <option key={category._id} value={category._id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="price">Prix</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="sku">Quantite</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="images">Images</Label>
                  <FileUpload
                    label="Télécharger des Images"
                    value={formData.images}
                    onChange={(images) => setFormData({ ...formData, images })}
                    multiple
                    accept="image/*"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="inStock"
                    checked={formData.inStock}
                    onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="inStock">En Stock</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="submit"
                  className="bg-pink-500 hover:bg-pink-600"
                >
                  <SaveIcon className="w-4 h-4 mr-2" />
                  {modalState.type === 'create' ? 'Créer' : 'Mettre à jour'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                >
                  <XIcon className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* Accessories List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accessories?.map((accessory) => {
          const category = accessoryCategories?.find(c => c._id === accessory.categoryId)

          return (
            <Card key={accessory._id} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold">{accessory.label}</h3>
                  <p className="text-sm text-gray-600">{accessory.description}</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">Catégorie:</span> {category?.name || 'Inconnue'}
                    </p>
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">Prix:</span> {accessory.price}€
                    </p>
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">Référence :</span> {accessory.sku}
                    </p>
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">Stock :</span> {accessory.inStock ? 'En Stock' : 'Rupture de Stock'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(accessory)}
                  >
                    <EditIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(accessory._id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Images */}
              {accessory.images && accessory.images.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Images:</p>
                  <ImageGallery
                    storageIds={accessory.images}
                    alt={accessory.label}
                    maxImages={4}
                    imageClassName="border"
                  />
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
