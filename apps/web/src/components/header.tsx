import { NavLink } from "react-router";
import { ModeToggle } from "./mode-toggle";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {  Airpod03FreeIcons, HoldPhoneFreeIcons } from "@hugeicons/core-free-icons";

export default function Header() {
	const links = [
		{ to: "/", label: "Pièces de rechange", icon: HoldPhoneFreeIcons },
		{ to: "/accessories", label: "Accessoires", icon: Airpod03FreeIcons },
	] as const;

	return (
		<div>
			<div className="flex flex-row items-center justify-between pb-3">
				<div className="">logo</div>
				<div className="flex items-center gap-2">
					<ModeToggle />
				</div>
			</div>
			<hr />
			<nav className="flex text-base my-3 justify-between sm:justify-start">
					{links.map(({ to, label, icon }) => {
						return (
							<NavLink
								key={to}
								to={to}
								className={({ isActive }) => cn('p-2 rounded-lg flex gap-1 w-[49%] justify-center text-sm items-center sm:w-fit', isActive ? 'bg-pink-500/10 text-pink-500' : '')}
								end
							>
								<HugeiconsIcon icon={icon} size={20} />
								<span>{label}</span>
							</NavLink>
						);
					})}
				</nav>
		</div>
	);
}
