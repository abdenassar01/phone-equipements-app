import React from 'react'
import type { Doc } from '@phone-equipements-app/backend/convex/_generated/dataModel'
import { ImageDisplay } from '../../ui/image-display'

type Accessory = Doc<"accessories"> & {
  category?: Doc<"accessoryCategories">
}

interface AccessoryCardProps {
  accessory: Accessory
}

export function AccessoryCard({ accessory }: AccessoryCardProps) {
  return (
    <div className="sm:w-[32.9%] rounded-xl p-2 border border-pink-500/20">
      <div className="space-y-2">
        {/* Image Display */}
        {accessory.images && accessory.images.length > 0 && (
          <div className="w-full h-48 rounded-lg overflow-hidden bg-gray-100">
            <ImageDisplay
              storageId={accessory.images[0]}
              alt={accessory.label}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <h3 className="font-semibold text-lg">{accessory.label}</h3>

        {accessory.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{accessory.description}</p>
        )}

        <div className="flex items-center gap-2 text-sm text-gray-500">
          {accessory.category && <span>{accessory.category.name}</span>}
          {accessory.sku && (
            <>
              <span>•</span>
              <span>Réf: {accessory.sku}</span>
            </>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-pink-600">
            {accessory.price} DH
          </div>
          <div className={`text-sm px-2 py-1 rounded ${
            accessory.inStock 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {accessory.inStock ? 'En Stock' : 'Rupture'}
          </div>
        </div>

        {accessory.features && accessory.features.length > 0 && (
          <div className="space-y-1">
            <p className="text-sm font-medium">Caractéristiques :</p>
            <div className="flex flex-wrap gap-1">
              {accessory.features.slice(0, 3).map((feature, index) => (
                <span
                  key={index}
                  className="text-xs bg-purple-500/10 text-purple-500 px-2 py-1 rounded"
                >
                  {feature}
                </span>
              ))}
              {accessory.features.length > 3 && (
                <span className="text-xs text-gray-500">+{accessory.features.length - 3} autres</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}