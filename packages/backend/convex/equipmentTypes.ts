import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAllEquipmentTypes = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query("equipmentTypes").order("asc").collect();
	},
});

export const getEquipmentTypeById = query({
	args: { id: v.id("equipmentTypes") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	},
});

export const getEquipmentTypeByName = query({
	args: { name: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("equipmentTypes")
			.withIndex("by_name", (q) => q.eq("name", args.name))
			.first();
	},
});

export const createEquipmentType = mutation({
	args: {
		name: v.string(),
		description: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const now = Date.now();
		return await ctx.db.insert("equipmentTypes", {
			name: args.name,
			description: args.description,
			createdAt: now,
			updatedAt: now,
		});
	},
});

export const updateEquipmentType = mutation({
	args: {
		id: v.id("equipmentTypes"),
		name: v.optional(v.string()),
		description: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const { id, ...updates } = args;
		return await ctx.db.patch(id, {
			...updates,
			updatedAt: Date.now(),
		});
	},
});

export const deleteEquipmentType = mutation({
	args: { id: v.id("equipmentTypes") },
	handler: async (ctx, args) => {
		const equipmentsWithType = await ctx.db
			.query("equipments")
			.withIndex("by_equipment_type", (q) => q.eq("equipmentTypeId", args.id))
			.first();

		if (equipmentsWithType) {
			throw new Error("Cannot delete equipment type that is used by equipments");
		}

		return await ctx.db.delete(args.id);
	},
});