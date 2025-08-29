import React from 'react'
import type { Doc } from '@phone-equipements-app/backend/convex/_generated/dataModel'
import { ImageDisplay } from '@/components/ui/image-display'

type Equipment = Doc<"equipments"> & {
  brand: Doc<"brands"> | null
  equipmentType: Doc<"equipmentTypes"> | null
}

interface EquipmentCardProps {
  equipment: Equipment
}

export function EquipmentCard({ equipment }: EquipmentCardProps) {
  return (
    <div className="sm:w-[32.9%] rounded-xl p-2 border border-pink-500/20">
      {equipment.brand?.logo && (
        <ImageDisplay storageId={equipment.brand.logo} alt={equipment.brand.name} className="w-12 h-12 object-contain rounded-lg" />
      )}
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">{equipment.label}</h3>

        {equipment.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{equipment.description}</p>
        )}

        <div className="flex items-center gap-2 text-sm text-gray-500">
          {equipment.brand && <span>{equipment.brand.name}</span>}
          {equipment.brand && equipment.equipmentType && <span>•</span>}
          {equipment.equipmentType && <span>{equipment.equipmentType.name}</span>}
        </div>

        {equipment.variants && equipment.variants.length > 0 && (
          <div className="space-y-1">
            <p className="text-sm font-medium">Variantes disponibles :</p>
            <div className="flex flex-wrap gap-1">
              {equipment.variants.slice(0, 3).map((variant, index) => (
                <span
                  key={index}
                  className="text-xs bg-purple-500/10 text-purple-500 px-2 py-1 rounded"
                >
                  {variant.label} - {variant.price} DH
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
