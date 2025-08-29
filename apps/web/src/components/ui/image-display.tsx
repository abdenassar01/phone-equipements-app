import React from 'react'
import { useQuery } from 'convex/react'
import { api } from '@phone-equipements-app/backend/convex/_generated/api'
import type { Id } from '@phone-equipements-app/backend/convex/_generated/dataModel'

interface ImageDisplayProps {
  storageId: Id<'_storage'>
  alt?: string
  className?: string
  width?: number
  height?: number
}

export function ImageDisplay({
  storageId,
  alt = 'Image',
  className = '',
  width,
  height
}: ImageDisplayProps) {
  const imageUrl = useQuery(api.files.getFileUrl, { storageId })

  if (!imageUrl) {
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-pink-600"></div>
      </div>
    )
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      width={width}
      height={height}
    />
  )
}

interface ImageGalleryProps {
  storageIds: Id<'_storage'>[]
  alt?: string
  className?: string
  imageClassName?: string
  maxImages?: number
}

export function ImageGallery({
  storageIds,
  alt = 'Image',
  className = '',
  imageClassName = '',
  maxImages
}: ImageGalleryProps) {
  const displayIds = maxImages ? storageIds.slice(0, maxImages) : storageIds
  const remainingCount = storageIds.length - displayIds.length

  if (storageIds.length === 0) {
    return (
      <div className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center ${className}`}>
        <span className="text-gray-500 text-sm">Aucune image</span>
      </div>
    )
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {displayIds.map((storageId, index) => (
        <ImageDisplay
          key={storageId}
          storageId={storageId}
          alt={`${alt} ${index + 1}`}
          className={`rounded-md object-cover ${imageClassName}`}
          width={80}
          height={80}
        />
      ))}
      {remainingCount > 0 && (
        <div className="w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center">
          <span className="text-gray-600 text-xs font-medium">+{remainingCount}</span>
        </div>
      )}
    </div>
  )
}