import React, { useState, useEffect } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@phone-equipements-app/backend/convex/_generated/api'
import { useSearchParams } from 'react-router'
import { Input } from '../../ui/input'
import { Button } from '../../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '../../ui/dropdown-menu'
import { ChevronDownIcon, SearchIcon, XIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AccessoryFilterState {
  search: string
  category: string
  priceRange: string
  inStock: string
}

interface AccessoriesFilterProps {
  onFilterChange?: (filters: AccessoryFilterState) => void
}

export function AccessoriesFilter({ onFilterChange }: AccessoriesFilterProps) {
  const [searchParams] = useSearchParams()
  const accessoryCategories = useQuery(api.accessoryCategories.getAllAccessoryCategories)

  const [filters, setFilters] = useState<AccessoryFilterState>({
    search: '',
    category: 'Toutes les Catégories',
    priceRange: 'Tous les Prix',
    inStock: 'Tous les Stocks'
  })

  // Initialize filters from URL parameters
  useEffect(() => {
    const urlFilters = {
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || 'Toutes les Catégories',
      priceRange: searchParams.get('priceRange') || 'Tous les Prix',
      inStock: searchParams.get('inStock') || 'Tous les Stocks'
    }
    setFilters(urlFilters)
  }, [searchParams])

  // Create arrays with "All" options and database data
  const categoryOptions = ['Toutes les Catégories', ...(accessoryCategories?.map(category => category.name) || [])]
  const priceRangeOptions = ['Tous les Prix', '0-100 DH', '100-500 DH', '500-1000 DH', '1000+ DH']
  const stockOptions = ['Tous les Stocks', 'En Stock', 'Rupture de Stock']

  const updateFilter = (key: keyof AccessoryFilterState, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      category: 'Toutes les Catégories',
      priceRange: 'Tous les Prix',
      inStock: 'Tous les Stocks'
    }
    setFilters(clearedFilters)
    onFilterChange?.(clearedFilters)
  }

  const hasActiveFilters = filters.search || 
    filters.category !== 'Toutes les Catégories' || 
    filters.priceRange !== 'Tous les Prix' || 
    filters.inStock !== 'Tous les Stocks'

  return (
    <div className="p-2 bg-card rounded-lg border border-pink-500/20">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filtrer les Accessoires</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <XIcon className="w-4 h-4 mr-1" />
            Tout Effacer
          </Button>
        )}
      </div>

      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Rechercher un accessoire par nom ou description..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Category Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Catégorie</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-between",
                  filters.category !== 'Toutes les Catégories' && "border-pink-500/50 bg-pink-500/5"
                )}
              >
                <span className="truncate">{filters.category}</span>
                <ChevronDownIcon className="w-4 h-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuLabel>Sélectionner une Catégorie</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {categoryOptions.map((category) => (
                <DropdownMenuItem
                  key={category}
                  onClick={() => updateFilter('category', category)}
                  className={cn(
                    "cursor-pointer",
                    filters.category === category && "bg-pink-500/10 text-pink-500"
                  )}
                >
                  {category}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Price Range Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Gamme de Prix</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-between",
                  filters.priceRange !== 'Tous les Prix' && "border-pink-500/50 bg-pink-500/5"
                )}
              >
                <span className="truncate">{filters.priceRange}</span>
                <ChevronDownIcon className="w-4 h-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuLabel>Sélectionner une Gamme</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {priceRangeOptions.map((range) => (
                <DropdownMenuItem
                  key={range}
                  onClick={() => updateFilter('priceRange', range)}
                  className={cn(
                    "cursor-pointer",
                    filters.priceRange === range && "bg-pink-500/10 text-pink-500"
                  )}
                >
                  {range}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Stock Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Disponibilité</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-between",
                  filters.inStock !== 'Tous les Stocks' && "border-pink-500/50 bg-pink-500/5"
                )}
              >
                <span className="truncate">{filters.inStock}</span>
                <ChevronDownIcon className="w-4 h-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuLabel>Sélectionner la Disponibilité</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {stockOptions.map((stock) => (
                <DropdownMenuItem
                  key={stock}
                  onClick={() => updateFilter('inStock', stock)}
                  className={cn(
                    "cursor-pointer",
                    filters.inStock === stock && "bg-pink-500/10 text-pink-500"
                  )}
                >
                  {stock}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          <span className="text-sm text-muted-foreground">Filtres actifs :</span>
          {filters.search && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-pink-500/10 text-pink-500 rounded-md text-xs">
              Recherche : "{filters.search}"
              <button
                onClick={() => updateFilter('search', '')}
                className="hover:bg-pink-500/20 rounded-full p-0.5"
              >
                <XIcon className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.category !== 'Toutes les Catégories' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-pink-500/10 text-pink-500 rounded-md text-xs">
              Catégorie : {filters.category}
              <button
                onClick={() => updateFilter('category', 'Toutes les Catégories')}
                className="hover:bg-pink-500/20 rounded-full p-0.5"
              >
                <XIcon className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.priceRange !== 'Tous les Prix' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-pink-500/10 text-pink-500 rounded-md text-xs">
              Prix : {filters.priceRange}
              <button
                onClick={() => updateFilter('priceRange', 'Tous les Prix')}
                className="hover:bg-pink-500/20 rounded-full p-0.5"
              >
                <XIcon className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.inStock !== 'Tous les Stocks' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-pink-500/10 text-pink-500 rounded-md text-xs">
              Stock : {filters.inStock}
              <button
                onClick={() => updateFilter('inStock', 'Tous les Stocks')}
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