import React from 'react'
import type { Doc } from '@phone-equipements-app/backend/convex/_generated/dataModel'

type Equipment = Doc<"equipments"> & {
  brand?: Doc<"brands">
  equipmentType?: Doc<"equipmentTypes">
}

interface EquipmentCardProps {
  equipment: Equipment
}

export function EquipmentCard({ equipment }: EquipmentCardProps) {
  return (
    <div className="sm:w-[32.9%] rounded-xl p-2 border border-pink-500/20">
      {equipment.images && equipment.images.length > 0 && (
        <div className="aspect-square mb-3 overflow-hidden rounded-md">
          <img
            src={equipment.images[0]}
            alt={equipment.label}
            className="w-full h-full object-cover"
          />
        </div>
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
            <p className="text-sm font-medium">Available variants:</p>
            <div className="flex flex-wrap gap-1">
              {equipment.variants.slice(0, 3).map((variant, index) => (
                <span
                  key={index}
                  className="text-xs bg-purple-500/10 text-purple-500 px-2 py-1 rounded"
                >
                  {variant.label} - {variant.price} MAD
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
