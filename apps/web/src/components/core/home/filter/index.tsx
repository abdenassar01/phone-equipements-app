import React, { useState, useEffect } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@phone-equipements-app/backend/convex/_generated/api'
import { useSearchParams } from 'react-router'
import { Input } from '../../../ui/input'
import { Button } from '../../../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '../../../ui/dropdown-menu'
import { ChevronDownIcon, SearchIcon, XIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FilterState {
  search: string
  phoneMark: string
  equipmentType: string
}

interface EquipmentsFilterProps {
  onFilterChange?: (filters: FilterState) => void
}



export function EquipmentsFilter({ onFilterChange }: EquipmentsFilterProps) {
  const [searchParams] = useSearchParams()
  const brands = useQuery(api.brands.getAllBrands)
  const equipmentTypes = useQuery(api.equipmentTypes.getAllEquipmentTypes)

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    phoneMark: 'All Brands',
    equipmentType: 'All Types'
  })

  // Initialize filters from URL parameters
  useEffect(() => {
    const urlFilters = {
      search: searchParams.get('search') || '',
      phoneMark: searchParams.get('brand') || 'All Brands',
      equipmentType: searchParams.get('type') || 'All Types'
    }
    setFilters(urlFilters)
  }, [searchParams])

  // Create arrays with "All" options and database data
  const phoneMarks = ['All Brands', ...(brands?.map(brand => brand.name) || [])]
  const equipmentTypeOptions = ['All Types', ...(equipmentTypes?.map(type => type.name) || [])]

  const updateFilter = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      phoneMark: 'All Brands',
      equipmentType: 'All Types'
    }
    setFilters(clearedFilters)
    onFilterChange?.(clearedFilters)
  }

  const hasActiveFilters = filters.search || filters.phoneMark !== 'All Brands' || filters.equipmentType !== 'All Types'

  return (
    <div className="p-2 bg-card rounded-lg border border-pink-500/20">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filter Equipment</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <XIcon className="w-4 h-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search equipment by name or model..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Phone Brand</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-between",
                  filters.phoneMark !== 'All Brands' && "border-pink-500/50 bg-pink-500/5"
                )}
              >
                <span className="truncate">{filters.phoneMark}</span>
                <ChevronDownIcon className="w-4 h-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuLabel>Select Brand</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {phoneMarks.map((mark) => (
                <DropdownMenuItem
                  key={mark}
                  onClick={() => updateFilter('phoneMark', mark)}
                  className={cn(
                    "cursor-pointer",
                    filters.phoneMark === mark && "bg-pink-500/10 text-pink-500"
                  )}
                >
                  {mark}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Equipment Type</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-between",
                  filters.equipmentType !== 'All Types' && "border-pink-500/50 bg-pink-500/5"
                )}
              >
                <span className="truncate">{filters.equipmentType}</span>
                <ChevronDownIcon className="w-4 h-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuLabel>Select Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {equipmentTypeOptions.map((type) => (
                <DropdownMenuItem
                  key={type}
                  onClick={() => updateFilter('equipmentType', type)}
                  className={cn(
                    "cursor-pointer",
                    filters.equipmentType === type && "bg-pink-500/10 text-pink-500"
                  )}
                >
                  {type}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filters.search && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-pink-500/10 text-pink-500 rounded-md text-xs">
              Search: "{filters.search}"
              <button
                onClick={() => updateFilter('search', '')}
                className="hover:bg-pink-500/20 rounded-full p-0.5"
              >
                <XIcon className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.phoneMark !== 'All Brands' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-pink-500/10 text-pink-500 rounded-md text-xs">
              Brand: {filters.phoneMark}
              <button
                onClick={() => updateFilter('phoneMark', 'All Brands')}
                className="hover:bg-pink-500/20 rounded-full p-0.5"
              >
                <XIcon className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.equipmentType !== 'All Types' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-pink-500/10 text-pink-500 rounded-md text-xs">
              Type: {filters.equipmentType}
              <button
                onClick={() => updateFilter('equipmentType', 'All Types')}
                className="hover:bg-pink-500/20 rounded-full p-0.5"
              >
                <XIcon className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}