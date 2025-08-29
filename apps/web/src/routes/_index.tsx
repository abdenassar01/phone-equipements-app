import type { Route } from "./+types/_index";
import {  EquipmentCard, EquipmentsFilter } from "../components";
import { useQuery } from "convex/react";
import { api } from "@phone-equipements-app/backend/convex/_generated/api";
import { useSearchParams } from "react-router";
import { useMemo } from "react";
import type { Id } from "@phone-equipements-app/backend/convex/_generated/dataModel";
import { HugeiconsIcon } from "@hugeicons/react";
import { DocumentAttachmentFreeIcons } from "@hugeicons/core-free-icons";
import { exportEquipmentsToPDF } from "../utils/export";
import { toast } from "sonner";

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
	const allEquipments = useQuery(api.equipments.getAllEquipments, { limit: 10000 });

	const handleFilterChange = (filters: { search: string; phoneMark: string;equipmentType: string }) => {
		const newParams = new URLSearchParams();

		if (filters.search) newParams.set('search', filters.search);
		if (filters.phoneMark !== 'Toutes les Marques') newParams.set('brand', filters.phoneMark);
		if (filters.equipmentType !== 'Tous les Types') newParams.set('type', filters.equipmentType);

		setSearchParams(newParams);
	};

	const handleDownloadPDF = async () => {
		try {
			if (!allEquipments || allEquipments.length === 0) {
				toast.error('Aucun équipement à exporter');
				return;
			}

			toast.info('Génération du PDF en cours...');
			await exportEquipmentsToPDF(allEquipments);
			toast.success('PDF téléchargé avec succès!');
		} catch (error) {
			console.error('Erreur lors du téléchargement PDF:', error);
			toast.error(`Erreur lors du téléchargement: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
		}
	};

	return (
		<div className="relative">
			<EquipmentsFilter onFilterChange={handleFilterChange} />
			<div className="py-2 gap-2 flex flex-col sm:flex-row sm:flex-wrap sm:justify-between">
				{equipments === undefined && <div>chargement...</div>}
				{equipments?.map((equipment) => (
					<EquipmentCard key={equipment._id} equipment={equipment} />
				))}
			</div>
			<button
				onClick={handleDownloadPDF}
				className="absolute bottom-1 right-1 p-2 px-4 rounded-lg bg-purple-500/10 items-center text-purple-500 flex gap-2 hover:bg-purple-500/20 transition-colors cursor-pointer"
			>
				<HugeiconsIcon icon={DocumentAttachmentFreeIcons} size={20}  />
				<span>Telecharger PDF</span>
			</button>
		</div>
	);
}
