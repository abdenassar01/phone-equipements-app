import type { Route } from "./+types/_index";
import {  EquipmentCard, EquipmentsFilter } from "../components";
import { useQuery } from "convex/react";
import { api } from "@phone-equipements-app/backend/convex/_generated/api";

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
	const equipments = useQuery(api.equipments.getAllEquipments, {limit: 100})

	return (
		<div className="">
			<EquipmentsFilter />
			<div className="py-2 gap-2 flex flex-col sm:flex-row sm:flex-wrap sm:justify-between">
				{equipments === undefined && <div>loading...</div>}
				{equipments?.map((equipment) => (
					<EquipmentCard key={equipment._id} equipment={equipment} />
				))}
			</div>
		</div>
	);
}
