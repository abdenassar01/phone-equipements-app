import type { Route } from "./+types/accessories";
import { AccessoryCard, AccessoriesFilter } from "../components";
import { useQuery } from "convex/react";
import { api } from "@phone-equipements-app/backend/convex/_generated/api";
import { useSearchParams } from "react-router";
import { useMemo } from "react";
import type { Id } from "@phone-equipements-app/backend/convex/_generated/dataModel";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Accessoires - phone-equipements-app" },
		{
			name: "description",
			content: "Découvrez notre gamme complète d'accessoires pour téléphones",
		},
	];
}

interface AccessoryFilterState {
	search: string
	category: string
	priceRange: string
	inStock: string
}

export default function Accessories() {
	const [searchParams, setSearchParams] = useSearchParams();
	const accessoryCategories = useQuery(api.accessoryCategories.getAllAccessoryCategories);

	const currentFilters: AccessoryFilterState = {
		search: searchParams.get('search') || '',
		category: searchParams.get('category') || 'Toutes les Catégories',
		priceRange: searchParams.get('priceRange') || 'Tous les Prix',
		inStock: searchParams.get('inStock') || 'Tous les Stocks'
	};

	// Get all accessories and apply filters
	const allAccessories = useQuery(api.accessories.getAllAccessories, {});

	const filteredAccessories = useMemo(() => {
		if (!allAccessories) return undefined;

		let filtered = [...allAccessories];

		// Apply search filter
		if (currentFilters.search) {
			const searchTerm = currentFilters.search.toLowerCase();
			filtered = filtered.filter(accessory =>
				accessory.label.toLowerCase().includes(searchTerm) ||
				(accessory.description && accessory.description.toLowerCase().includes(searchTerm))
			);
		}

		// Apply category filter
		if (currentFilters.category !== 'Toutes les Catégories' && accessoryCategories) {
			const selectedCategory = accessoryCategories.find(cat => cat.name === currentFilters.category);
			if (selectedCategory) {
				filtered = filtered.filter(accessory => accessory.categoryId === selectedCategory._id);
			}
		}

		// Apply price range filter
		if (currentFilters.priceRange !== 'Tous les Prix') {
			switch (currentFilters.priceRange) {
				case '0-100 DH':
					filtered = filtered.filter(accessory => accessory.price >= 0 && accessory.price <= 100);
					break;
				case '100-500 DH':
					filtered = filtered.filter(accessory => accessory.price > 100 && accessory.price <= 500);
					break;
				case '500-1000 DH':
					filtered = filtered.filter(accessory => accessory.price > 500 && accessory.price <= 1000);
					break;
				case '1000+ DH':
					filtered = filtered.filter(accessory => accessory.price > 1000);
					break;
			}
		}

		// Apply stock filter
		if (currentFilters.inStock !== 'Tous les Stocks') {
			switch (currentFilters.inStock) {
				case 'En Stock':
					filtered = filtered.filter(accessory => accessory.inStock === true);
					break;
				case 'Rupture de Stock':
					filtered = filtered.filter(accessory => accessory.inStock === false);
					break;
			}
		}

		return filtered;
	}, [allAccessories, currentFilters, accessoryCategories]);

	// Enrich accessories with category information
	const enrichedAccessories = useMemo(() => {
		if (!filteredAccessories || !accessoryCategories) return undefined;

		return filteredAccessories.map(accessory => ({
			...accessory,
			category: accessoryCategories.find(cat => cat._id === accessory.categoryId)
		}));
	}, [filteredAccessories, accessoryCategories]);

	const handleFilterChange = (filters: AccessoryFilterState) => {
		const newParams = new URLSearchParams();

		if (filters.search) newParams.set('search', filters.search);
		if (filters.category !== 'Toutes les Catégories') newParams.set('category', filters.category);
		if (filters.priceRange !== 'Tous les Prix') newParams.set('priceRange', filters.priceRange);
		if (filters.inStock !== 'Tous les Stocks') newParams.set('inStock', filters.inStock);

		setSearchParams(newParams);
	};

	return (
		<div className="">
			<AccessoriesFilter onFilterChange={handleFilterChange} />
			<div className="py-2 gap-2 flex flex-col sm:flex-row sm:flex-wrap sm:justify-between">
				{enrichedAccessories === undefined && <div>Chargement...</div>}
				{enrichedAccessories && enrichedAccessories.length === 0 && (
					<div className="text-center py-8 text-gray-500">
						Aucun accessoire trouvé avec les filtres sélectionnés.
					</div>
				)}
				{enrichedAccessories?.map((accessory) => (
					<AccessoryCard key={accessory._id} accessory={accessory} />
				))}
			</div>
		</div>
	);
}
