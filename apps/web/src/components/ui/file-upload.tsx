import React, { useState, useRef } from 'react'
import { useMutation } from 'convex/react'
import { api } from '@phone-equipements-app/backend/convex/_generated/api'
import { Button } from './button'
import { Input } from './input'
import { Label } from './label'
import { XIcon, UploadIcon } from 'lucide-react'
import type { Id } from '@phone-equipements-app/backend/convex/_generated/dataModel'

interface FileUploadProps {
  label: string
  value: Id<'_storage'>[]
  onChange: (files: Id<'_storage'>[]) => void
  multiple?: boolean
  accept?: string
  className?: string
}

export function FileUpload({ 
  label, 
  value = [], 
  onChange, 
  multiple = true, 
  accept = 'image/*',
  className 
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const generateUploadUrl = useMutation(api.files.generateUploadUrl)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Generate upload URL
        const uploadUrl = await generateUploadUrl()
        
        // Upload file
        const result = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': file.type },
          body: file,
        })
        
        const { storageId } = await result.json()
        return storageId as Id<'_storage'>
      })

      const newFileIds = await Promise.all(uploadPromises)
      
      if (multiple) {
        onChange([...value, ...newFileIds])
      } else {
        onChange(newFileIds.slice(0, 1))
      }
    } catch (error) {
      console.error('Échec du téléchargement:', error)
      alert('Échec du téléchargement. Veuillez réessayer.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeFile = (indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove))
  }

  return (
    <div className={className}>
      <Label>{label}</Label>
      
      <div className="space-y-2">
        {/* Upload Button */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2"
          >
            <UploadIcon className="w-4 h-4" />
            {uploading ? 'Téléchargement...' : 'Télécharger des Fichiers'}
          </Button>
          
          <Input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* File List */}
        {value.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">
              Fichiers Téléchargés ({value.length})
            </Label>
            <div className="grid grid-cols-1 gap-2">
              {value.map((fileId, index) => (
                <div
                  key={fileId}
                  className="flex items-center justify-between p-2 border rounded-md bg-muted/50"
                >
                  <span className="text-sm font-mono truncate">
                    {fileId}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <XIcon className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}