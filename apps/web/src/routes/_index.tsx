import type { Route } from "./+types/_index";
import {  EquipmentCard, EquipmentsFilter } from "../components";
import { useQuery } from "convex/react";
import { api } from "@phone-equipements-app/backend/convex/_generated/api";
import { useSearchParams } from "react-router";
import { useMemo } from "react";
import type { Id } from "@phone-equipements-app/backend/convex/_generated/dataModel";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "phone-equipements-app" },
		{
			name: "description",
			content: "phone-equipements-app is a web application",
		},
	];
}

export default function Home() {
	const [searchParams, setSearchParams] = useSearchParams();
	const brands = useQuery(api.brands.getAllBrands);
	const equipmentTypes = useQuery(api.equipmentTypes.getAllEquipmentTypes);

	const currentFilters = {
		search: searchParams.get('search') || '',
		phoneMark: searchParams.get('brand') || 'Toutes les Marques',
		equipmentType: searchParams.get('type') || 'Tous les Types'
	};

	const queryParams = useMemo(() => {
		const params: {
			limit: number;
			search?: string;
			brandId?: Id<"brands">;
			equipmentTypeId?: Id<"equipmentTypes">;
		} = { limit: 100 };

		if (currentFilters.search) {
			params.search = currentFilters.search;
		}

		if (currentFilters.phoneMark !== 'Toutes les Marques' && brands) {
			const selectedBrand = brands.find(brand => brand.name === currentFilters.phoneMark);
			if (selectedBrand) {
				params.brandId = selectedBrand._id;
			}
		}

		if (currentFilters.equipmentType !== 'Tous les Types' && equipmentTypes) {
			const selectedType = equipmentTypes.find(type => type.name === currentFilters.equipmentType);
			if (selectedType) {
				params.equipmentTypeId = selectedType._id;
			}
		}

		return params;
	}, [currentFilters.search, currentFilters.phoneMark, currentFilters.equipmentType, brands, equipmentTypes]);


	const equipments = useQuery(api.equipments.getAllEquipments, queryParams);

	const handleFilterChange = (filters: { search: string; phoneMark: string;equipmentType: string }) => {
		const newParams = new URLSearchParams();

		if (filters.search) newParams.set('search', filters.search);
		if (filters.phoneMark !== 'Toutes les Marques') newParams.set('brand', filters.phoneMark);
		if (filters.equipmentType !== 'Tous les Types') newParams.set('type', filters.equipmentType);

		setSearchParams(newParams);
	};

	return (
		<div className="">
			<EquipmentsFilter onFilterChange={handleFilterChange} />
			<div className="py-2 gap-2 flex flex-col sm:flex-row sm:flex-wrap sm:justify-between">
				{equipments === undefined && <div>chargement...</div>}
				{equipments?.map((equipment) => (
					<EquipmentCard key={equipment._id} equipment={equipment} />
				))}
			</div>
		</div>
	);
}
