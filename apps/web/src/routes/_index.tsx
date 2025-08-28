import type { Route } from "./+types/_index";
import {  EquipmentsFilter } from "../components";

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

	return (
		<div className="container mx-auto max-w-3xl py-2">
			<EquipmentsFilter />
			<div className="">The List of products</div>
		</div>
	);
}
