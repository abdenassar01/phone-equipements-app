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

type TabType = 'brands' | 'equipmentTypes' | 'equipments' | 'accessoryCategories' | 'accessories'

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
    { id: 'brands' as const, label: 'Brands' },
    { id: 'equipmentTypes' as const, label: 'Equipment Types' },
    { id: 'equipments' as const, label: 'Equipments' },
    { id: 'accessoryCategories' as const, label: 'Accessory Categories' },
    { id: 'accessories' as const, label: 'Accessories' },
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
      default:
        return <div>Select a tab to manage data</div>
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 border-b">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-2 rounded-lg font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-pink-500/10 text-pink-500"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {renderTabContent()}
        </div>
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
    setFormData({ name: equipmentType.name, description: equipmentType.description || '' })
  }

  const handleDelete = async (id: Id<'equipmentTypes'>) => {
    if (confirm('Are you sure you want to delete this equipment type?')) {
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
        <h2 className="text-2xl font-semibold">Equipment Types Management</h2>
        <Button
          onClick={openCreateModal}
          className="bg-pink-500 hover:bg-pink-600"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Equipment Type
        </Button>
      </div>

      {/* Modal for Create/Edit */}
      {modalState?.entity === 'equipmentTypes' && (
        <Modal title={modalState.type === 'create' ? 'Create Equipment Type' : 'Edit Equipment Type'} isOpen={modalState.isOpen} onClose={closeModal}>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              {modalState.type === 'create' ? 'Create Equipment Type' : 'Edit Equipment Type'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Equipment Type Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-green-500 hover:bg-green-600">
                  <SaveIcon className="w-4 h-4 mr-2" />
                  {modalState.type === 'create' ? 'Create' : 'Update'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                >
                  <XIcon className="w-4 h-4 mr-2" />
                  Cancel
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
                  variant="destructive"
                  onClick={() => handleDelete(equipmentType._id)}
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Created: {new Date(equipmentType.createdAt).toLocaleDateString()}
            </p>
          </Card>
        ))}
      </div>
    </div>
  )
}

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
    equipmentTypeId: '',
    images: ''
  })

  const [variants, setVariants] = useState<Array<{
    label: string
    price: string
    sku: string
    inStock: boolean
  }>>([{ label: '', price: '', sku: '', inStock: true }])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const imagesArray = formData.images.split(',').map(img => img.trim()).filter(Boolean)
      const variantsArray = variants.map(v => ({
        label: v.label,
        price: parseFloat(v.price),
        sku: v.sku,
        inStock: v.inStock
      })).filter(v => v.label && v.price)

      if (modalState?.type === 'create') {
        await createEquipment({
          label: formData.label,
          description: formData.description,
          brandId: formData.brandId as Id<'brands'>,
          equipmentTypeId: formData.equipmentTypeId as Id<'equipmentTypes'>,
          images: imagesArray,
          variants: variantsArray
        })
      } else if (modalState?.type === 'edit' && modalState.data) {
        await updateEquipment({
          id: modalState.data._id,
          label: formData.label,
          description: formData.description,
          brandId: formData.brandId as Id<'brands'>,
          equipmentTypeId: formData.equipmentTypeId as Id<'equipmentTypes'>,
          images: imagesArray,
          variants: variantsArray
        })
      }
      setModalState(null)
      setFormData({ label: '', description: '', brandId: '', equipmentTypeId: '', images: '' })
      setVariants([{ label: '', price: '', sku: '', inStock: true }])
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
      equipmentTypeId: equipment.equipmentTypeId,
      images: equipment.images.join(', ')
    })
    setVariants(equipment.variants.map(v => ({
      label: v.label || '',
      price: v.price?.toString() || '',
      sku: v.sku || '',
      inStock: v.inStock ?? true
    })))
  }

  const handleDelete = async (id: Id<'equipments'>) => {
    if (confirm('Are you sure you want to delete this equipment?')) {
      await deleteEquipment({ id })
    }
  }

  const openCreateModal = () => {
    setModalState({ isOpen: true, type: 'create', entity: 'equipments' })
    setFormData({ label: '', description: '', brandId: '', equipmentTypeId: '', images: '' })
    setVariants([{ label: '', price: '', sku: '', inStock: true }])
  }

  const closeModal = () => {
    setModalState(null)
    setFormData({ label: '', description: '', brandId: '', equipmentTypeId: '', images: '' })
    setVariants([{ label: '', price: '', sku: '', inStock: true }])
  }

  const addVariant = () => {
    setVariants([...variants, { label: '', price: '', sku: '', inStock: true }])
  }

  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index))
    }
  }

  const updateVariant = (index: number, field: string, value: string | boolean) => {
    const updatedVariants = [...variants]
    updatedVariants[index] = { ...updatedVariants[index], [field]: value }
    setVariants(updatedVariants)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Equipments Management</h2>
        <Button
          onClick={openCreateModal}
          className="bg-pink-500 hover:bg-pink-600"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Equipment
        </Button>
      </div>

      {/* Modal for Create/Edit */}
      {modalState?.entity === 'equipments' && (
        <Modal title='' isOpen={modalState.isOpen} onClose={closeModal}>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              {modalState.type === 'create' ? 'Create Equipment' : 'Edit Equipment'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="label">Equipment Label</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="brandId">Brand</Label>
                <select
                  id="brandId"
                  value={formData.brandId}
                  onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                  className="w-full h-9 px-3 rounded-md border border-input bg-background"
                  required
                >
                  <option value="">Select Brand</option>
                  {brands?.map((brand) => (
                    <option key={brand._id} value={brand._id}>{brand.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="equipmentTypeId">Equipment Type</Label>
                <select
                  id="equipmentTypeId"
                  value={formData.equipmentTypeId}
                  onChange={(e) => setFormData({ ...formData, equipmentTypeId: e.target.value })}
                  className="w-full h-9 px-3 rounded-md border border-input bg-background"
                  required
                >
                  <option value="">Select Equipment Type</option>
                  {equipmentTypes?.map((type) => (
                    <option key={type._id} value={type._id}>{type.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="images">Images (comma-separated URLs)</Label>
                <Input
                  id="images"
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background"
                required
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-3">
                <Label>Variants</Label>
                <Button
                  type="button"
                  onClick={addVariant}
                  className="bg-blue-500 hover:bg-blue-600 text-xs px-2 py-1 h-auto"
                >
                  <PlusIcon className="w-3 h-3 mr-1" />
                  Add Variant
                </Button>
              </div>
              <div className="space-y-3">
                {variants.map((variant, index) => (
                  <div key={index} className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Variant {index + 1}</span>
                      {variants.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeVariant(index)}
                          variant="destructive"
                          className="text-xs px-2 py-1 h-auto"
                        >
                          <XIcon className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                      <div>
                        <Label htmlFor={`variant-label-${index}`} className="text-xs">Label</Label>
                        <Input
                          id={`variant-label-${index}`}
                          value={variant.label}
                          onChange={(e) => updateVariant(index, 'label', e.target.value)}
                          placeholder="e.g., 64GB"
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`variant-price-${index}`} className="text-xs">Price</Label>
                        <Input
                          id={`variant-price-${index}`}
                          type="number"
                          step="0.01"
                          value={variant.price}
                          onChange={(e) => updateVariant(index, 'price', e.target.value)}
                          placeholder="0.00"
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`variant-sku-${index}`} className="text-xs">SKU</Label>
                        <Input
                          id={`variant-sku-${index}`}
                          value={variant.sku}
                          onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                          placeholder="SKU001"
                          className="text-sm"
                        />
                      </div>
                      <div className="flex items-center space-x-2 pt-5">
                        <input
                          id={`variant-instock-${index}`}
                          type="checkbox"
                          checked={variant.inStock}
                          onChange={(e) => updateVariant(index, 'inStock', e.target.checked)}
                          className="rounded"
                        />
                        <Label htmlFor={`variant-instock-${index}`} className="text-xs">In Stock</Label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-green-500 hover:bg-green-600">
                  <SaveIcon className="w-4 h-4 mr-2" />
                  {modalState.type === 'create' ? 'Create' : 'Update'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                >
                  <XIcon className="w-4 h-4 mr-2" />
                  Cancel
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
                  <p className="text-sm text-gray-600 mt-1">{equipment.description}</p>
                  <div className="text-xs text-gray-500 mt-2">
                    <p>Brand: {brand?.name}</p>
                    <p>Type: {equipmentType?.name}</p>
                    <p>Variants: {equipment.variants.length}</p>
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
                    variant="destructive"
                    onClick={() => handleDelete(equipment._id)}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Created: {new Date(equipment.createdAt).toLocaleDateString()}
              </p>
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

  const [formData, setFormData] = useState({ name: '', description: '', icon: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (modalState?.type === 'create') {
        await createAccessoryCategory({
          name: formData.name,
          description: formData.description || undefined,
          icon: formData.icon || undefined
        })
      } else if (modalState?.type === 'edit' && modalState.data) {
        await updateAccessoryCategory({
          id: modalState.data._id,
          name: formData.name,
          description: formData.description || undefined,
          icon: formData.icon || undefined
        })
      }
      setModalState(null)
      setFormData({ name: '', description: '', icon: '' })
    } catch (error) {
      console.error('Error saving accessory category:', error)
    }
  }

  const handleEdit = (category: Doc<'accessoryCategories'>) => {
    setModalState({ isOpen: true, type: 'edit', entity: 'accessoryCategories', data: category })
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || ''
    })
  }

  const handleDelete = async (id: Id<'accessoryCategories'>) => {
    if (confirm('Are you sure you want to delete this accessory category?')) {
      await deleteAccessoryCategory({ id })
    }
  }

  const openCreateModal = () => {
    setModalState({ isOpen: true, type: 'create', entity: 'accessoryCategories' })
    setFormData({ name: '', description: '', icon: '' })
  }

  const closeModal = () => {
    setModalState(null)
    setFormData({ name: '', description: '', icon: '' })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Accessory Categories Management</h2>
        <Button
          onClick={openCreateModal}
          className="bg-pink-500 hover:bg-pink-600"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Modal for Create/Edit */}
      {modalState?.entity === 'accessoryCategories' && (
        <Modal title='' isOpen={modalState.isOpen} onClose={closeModal}>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              {modalState.type === 'create' ? 'Create Accessory Category' : 'Edit Accessory Category'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="icon">Icon (optional)</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="Icon name or URL"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-green-500 hover:bg-green-600">
                  <SaveIcon className="w-4 h-4 mr-2" />
                  {modalState.type === 'create' ? 'Create' : 'Update'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                >
                  <XIcon className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* Categories List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accessoryCategories?.map((category) => (
          <Card key={category._id} className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h3 className="font-semibold">{category.name}</h3>
                {category.description && (
                  <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                )}
                {category.icon && (
                  <p className="text-xs text-gray-500 mt-1">Icon: {category.icon}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(category)}
                >
                  <EditIcon className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(category._id)}
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Created: {new Date(category.createdAt).toLocaleDateString()}
            </p>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Accessories Tab Component
function AccessoriesTab({ modalState, setModalState }: { modalState: ModalState | null, setModalState: (state: ModalState | null) => void }) {
  const accessories = useQuery(api.accessories.getAllAccessories, {limit: 100})
  const accessoryCategories = useQuery(api.accessoryCategories.getAllAccessoryCategories)
  const createAccessory = useMutation(api.accessories.createAccessory)
  const updateAccessory = useMutation(api.accessories.updateAccessory)
  const deleteAccessory = useMutation(api.accessories.deleteAccessory)

  const [formData, setFormData] = useState({
    label: '',
    description: '',
    categoryId: '',
    images: '',
    price: '',
    sku: '',
    inStock: true,
    features: '',
    specifications: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const imagesArray = formData.images.split(',').map(img => img.trim()).filter(Boolean)
      const featuresArray = formData.features ? formData.features.split(',').map(f => f.trim()).filter(Boolean) : []
      const specificationsObj = formData.specifications ? JSON.parse(formData.specifications) : undefined

      if (modalState?.type === 'create') {
        await createAccessory({
          label: formData.label,
          description: formData.description || undefined,
          categoryId: formData.categoryId as Id<'accessoryCategories'>,
          images: imagesArray,
          price: parseInt(formData.price),
          sku: formData.sku || undefined,
          inStock: formData.inStock,
          features: featuresArray.length > 0 ? featuresArray : undefined,
          specifications: specificationsObj
        })
      } else if (modalState?.type === 'edit' && modalState.data) {
        await updateAccessory({
          id: modalState.data._id,
          label: formData.label,
          description: formData.description || undefined,
          categoryId: formData.categoryId as Id<'accessoryCategories'>,
          images: imagesArray,
          price: parseInt(formData.price),
          sku: formData.sku || undefined,
          inStock: formData.inStock,
          features: featuresArray.length > 0 ? featuresArray : undefined,
          specifications: specificationsObj
        })
      }
      setModalState(null)
      setFormData({ label: '', description: '', categoryId: '', images: '', price: '', sku: '', inStock: true, features: '', specifications: '' })
    } catch (error) {
      console.error('Error saving accessory:', error)
    }
  }

  const handleEdit = (accessory: Doc<'accessories'>) => {
    setModalState({ isOpen: true, type: 'edit', entity: 'accessories', data: accessory })
    setFormData({
      label: accessory.label,
      description: accessory.description || '',
      categoryId: accessory.categoryId,
      images: accessory.images.join(', '),
      price: accessory.price.toString(),
      sku: accessory.sku || '',
      inStock: accessory.inStock ?? true,
      features: accessory.features?.join(', ') || '',
      specifications: accessory.specifications ? JSON.stringify(accessory.specifications, null, 2) : ''
    })
  }

  const handleDelete = async (id: Id<'accessories'>) => {
    if (confirm('Are you sure you want to delete this accessory?')) {
      await deleteAccessory({ id })
    }
  }

  const openCreateModal = () => {
    setModalState({ isOpen: true, type: 'create', entity: 'accessories' })
    setFormData({ label: '', description: '', categoryId: '', images: '', price: '', sku: '', inStock: true, features: '', specifications: '' })
  }

  const closeModal = () => {
    setModalState(null)
    setFormData({ label: '', description: '', categoryId: '', images: '', price: '', sku: '', inStock: true, features: '', specifications: '' })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Accessories Management</h2>
        <Button
          onClick={openCreateModal}
          className="bg-pink-500 hover:bg-pink-600"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Accessory
        </Button>
      </div>

      {/* Modal for Create/Edit */}
      {modalState?.entity === 'accessories' && (
        <Modal title='' isOpen={modalState.isOpen} onClose={closeModal}>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              {modalState.type === 'create' ? 'Create Accessory' : 'Edit Accessory'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="label">Accessory Label</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="categoryId">Category</Label>
                <select
                  id="categoryId"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full h-9 px-3 rounded-md border border-input bg-background"
                  required
                >
                  <option value="">Select Category</option>
                  {accessoryCategories?.map((category) => (
                    <option key={category._id} value={category._id}>{category.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="price">Price (in cents)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="sku">SKU (optional)</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="images">Images (comma-separated URLs)</Label>
                <Input
                  id="images"
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="inStock"
                  checked={formData.inStock}
                  onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                />
                <Label htmlFor="inStock">In Stock</Label>
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background"
              />
            </div>
            <div>
              <Label htmlFor="features">Features (comma-separated, optional)</Label>
              <Input
                id="features"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                placeholder="Feature 1, Feature 2, Feature 3"
              />
            </div>
            <div>
              <Label htmlFor="specifications">Specifications (JSON format, optional)</Label>
              <textarea
                id="specifications"
                value={formData.specifications}
                onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                className="w-full min-h-[120px] px-3 py-2 rounded-md border border-input bg-background font-mono text-sm"
                placeholder='{"brand": "Apple", "color": "Black", "material": "Silicone"}'
              />
            </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-green-500 hover:bg-green-600">
                  <SaveIcon className="w-4 h-4 mr-2" />
                  {modalState.type === 'create' ? 'Create' : 'Update'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                >
                  <XIcon className="w-4 h-4 mr-2" />
                  Cancel
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
                  {accessory.description && (
                    <p className="text-sm text-gray-600 mt-1">{accessory.description}</p>
                  )}
                  <div className="text-xs text-gray-500 mt-2">
                    <p>Category: {category?.name}</p>
                    <p>Price: ${(accessory.price / 100).toFixed(2)}</p>
                    <p>In Stock: {accessory.inStock ? 'Yes' : 'No'}</p>
                    {accessory.sku && <p>SKU: {accessory.sku}</p>}
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
                    variant="destructive"
                    onClick={() => handleDelete(accessory._id)}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Created: {new Date(accessory.createdAt).toLocaleDateString()}
              </p>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function BrandsTab({ modalState, setModalState }: { modalState: ModalState | null, setModalState: (state: ModalState | null) => void }) {
  const brands = useQuery(api.brands.getAllBrands)
  const createBrand = useMutation(api.brands.createBrand)
  const updateBrand = useMutation(api.brands.updateBrand)
  const deleteBrand = useMutation(api.brands.deleteBrand)

  const [formData, setFormData] = useState({ name: '', logo: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (modalState?.type === 'create') {
        await createBrand({ name: formData.name, logo: formData.logo || undefined })
      } else if (modalState?.type === 'edit' && modalState.data) {
        await updateBrand({
          id: modalState.data._id,
          name: formData.name,
          logo: formData.logo || undefined
        })
      }
      setModalState(null)
      setFormData({ name: '', logo: '' })
    } catch (error) {
      console.error('Error saving brand:', error)
    }
  }

  const handleEdit = (brand: Doc<'brands'>) => {
    setModalState({ isOpen: true, type: 'edit', entity: 'brands', data: brand })
    setFormData({ name: brand.name, logo: brand.logo || '' })
  }

  const handleDelete = async (id: Id<'brands'>) => {
    if (confirm('Are you sure you want to delete this brand?')) {
      await deleteBrand({ id })
    }
  }

  const openCreateModal = () => {
    setModalState({ isOpen: true, type: 'create', entity: 'brands' })
    setFormData({ name: '', logo: '' })
  }

  const closeModal = () => {
    setModalState(null)
    setFormData({ name: '', logo: '' })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Brands Management</h2>
        <Button
          onClick={openCreateModal}
          className="bg-pink-500 hover:bg-pink-600"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Brand
        </Button>
      </div>

      {/* Modal for Create/Edit */}
      {modalState?.entity === 'brands' && (
        <Modal title='' isOpen={modalState.isOpen} onClose={closeModal}>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              {modalState.type === 'create' ? 'Create Brand' : 'Edit Brand'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Brand Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="logo">Logo URL (optional)</Label>
                <Input
                  id="logo"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-green-500 hover:bg-green-600">
                  <SaveIcon className="w-4 h-4 mr-2" />
                  {modalState.type === 'create' ? 'Create' : 'Update'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                >
                  <XIcon className="w-4 h-4 mr-2" />
                  Cancel
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
                  <img src={brand.logo} alt={brand.name} className="w-16 h-16 object-contain mt-2" />
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
                  variant="destructive"
                  onClick={() => handleDelete(brand._id)}
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Created: {new Date(brand.createdAt).toLocaleDateString()}
            </p>
          </Card>
        ))}
      </div>
    </div>
  )
}
