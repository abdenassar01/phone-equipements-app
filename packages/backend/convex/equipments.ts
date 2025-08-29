import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const variantSchema = v.object({
	label: v.string(),
	price: v.number(),
	sku: v.optional(v.string()),
	inStock: v.optional(v.boolean()),
	attributes: v.optional(v.object({
		color: v.optional(v.string()),
		size: v.optional(v.string()),
		material: v.optional(v.string()),
		compatibility: v.optional(v.array(v.string())),
	})),
});

export const getAllEquipments = query({
	args: {
		limit: v.optional(v.number()),
		search: v.optional(v.string()),
		brandId: v.optional(v.id("brands")),
		equipmentTypeId: v.optional(v.id("equipmentTypes")),
	},
	handler: async (ctx, args) => {
		const nbrOfItems = args.limit || 100;
		let equipments;

		if (args.brandId && args.equipmentTypeId) {
			equipments = await ctx.db
				.query("equipments")
				.withIndex("by_brand_and_type", (q) =>
					q.eq("brandId", args.brandId!).eq("equipmentTypeId", args.equipmentTypeId!)
				)
				.order("desc")
				.take(nbrOfItems);
		}

		else if (args.brandId) {
			equipments = await ctx.db
				.query("equipments")
				.withIndex("by_brand", (q) => q.eq("brandId", args.brandId!))
				.order("desc")
				.take(nbrOfItems);
		}

		else if (args.equipmentTypeId) {
			equipments = await ctx.db
				.query("equipments")
				.withIndex("by_equipment_type", (q) => q.eq("equipmentTypeId", args.equipmentTypeId!))
				.order("desc")
				.take(nbrOfItems);
		}

		else {
			equipments = await ctx.db
				.query("equipments")
				.order("desc")
				.take(nbrOfItems);
		}

		if (args.search && args.search.trim()) {
			const searchTerm = args.search.toLowerCase().trim();
			equipments = equipments.filter(equipment =>
				equipment.label.toLowerCase().includes(searchTerm) ||
				equipment.description.toLowerCase().includes(searchTerm)
			);
		}

		return equipments;
	},
});

export const getEquipmentById = query({
	args: { id: v.id("equipments") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	},
});

export const getEquipmentsByBrand = query({
	args: { brandId: v.id("brands") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("equipments")
			.withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
			.collect();
	},
});

export const getEquipmentsByType = query({
	args: { equipmentTypeId: v.id("equipmentTypes") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("equipments")
			.withIndex("by_equipment_type", (q) => q.eq("equipmentTypeId", args.equipmentTypeId))
			.collect();
	},
});

export const getEquipmentsByBrandAndType = query({
	args: {
		brandId: v.id("brands"),
		equipmentTypeId: v.id("equipmentTypes"),
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query("equipments")
			.withIndex("by_brand_and_type", (q) =>
				q.eq("brandId", args.brandId).eq("equipmentTypeId", args.equipmentTypeId)
			)
			.collect();
	},
});

export const searchEquipments = query({
	args: { searchTerm: v.string() },
	handler: async (ctx, args) => {
		const equipments = await ctx.db.query("equipments").collect();
		return equipments.filter(equipment =>
			equipment.label.toLowerCase().includes(args.searchTerm.toLowerCase()) ||
			equipment.description.toLowerCase().includes(args.searchTerm.toLowerCase())
		);
	},
});

// Mutations
export const createEquipment = mutation({
	args: {
		label: v.string(),
		description: v.string(),
		brandId: v.id("brands"),
		equipmentTypeId: v.id("equipmentTypes"),
		images: v.array(v.string()),
		variants: v.array(variantSchema),
	},
	handler: async (ctx, args) => {
		const now = Date.now();
		return await ctx.db.insert("equipments", {
			...args,
			createdAt: now,
			updatedAt: now,
		});
	},
});

export const updateEquipment = mutation({
	args: {
		id: v.id("equipments"),
		label: v.optional(v.string()),
		description: v.optional(v.string()),
		brandId: v.optional(v.id("brands")),
		equipmentTypeId: v.optional(v.id("equipmentTypes")),
		images: v.optional(v.array(v.string())),
		variants: v.optional(v.array(variantSchema)),
	},
	handler: async (ctx, args) => {
		const { id, ...updates } = args;
		return await ctx.db.patch(id, {
			...updates,
			updatedAt: Date.now(),
		});
	},
});

export const deleteEquipment = mutation({
	args: { id: v.id("equipments") },
	handler: async (ctx, args) => {
		return await ctx.db.delete(args.id);
	},
});

export const addVariantToEquipment = mutation({
	args: {
		equipmentId: v.id("equipments"),
		variant: variantSchema,
	},
	handler: async (ctx, args) => {
		const equipment = await ctx.db.get(args.equipmentId);
		if (!equipment) {
			throw new Error("Equipment not found");
		}

		return await ctx.db.patch(args.equipmentId, {
			variants: [...equipment.variants, args.variant],
			updatedAt: Date.now(),
		});
	},
});

export const removeVariantFromEquipment = mutation({
	args: {
		equipmentId: v.id("equipments"),
		variantIndex: v.number(),
	},
	handler: async (ctx, args) => {
		const equipment = await ctx.db.get(args.equipmentId);
		if (!equipment) {
			throw new Error("Equipment not found");
		}

		const newVariants = equipment.variants.filter((_, index) => index !== args.variantIndex);

		return await ctx.db.patch(args.equipmentId, {
			variants: newVariants,
			updatedAt: Date.now(),
		});
	},
});