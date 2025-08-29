import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAllBrands = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query("brands").order("asc").collect();
	},
});

export const getBrandById = query({
	args: { id: v.id("brands") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	},
});

export const getBrandByName = query({
	args: { name: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("brands")
			.withIndex("by_name", (q) => q.eq("name", args.name))
			.first();
	},
});

export const createBrand = mutation({
	args: {
		name: v.string(),
		logo: v.optional(v.id("_storage")),
	},
	handler: async (ctx, args) => {
		const now = Date.now();
		return await ctx.db.insert("brands", {
			name: args.name,
			logo: args.logo,
			createdAt: now,
			updatedAt: now,
		});
	},
});

export const updateBrand = mutation({
	args: {
		id: v.id("brands"),
		name: v.optional(v.string()),
		logo: v.optional(v.id("_storage")),
	},
	handler: async (ctx, args) => {
		const { id, ...updates } = args;
		return await ctx.db.patch(id, {
			...updates,
			updatedAt: Date.now(),
		});
	},
});

export const deleteBrand = mutation({
	args: { id: v.id("brands") },
	handler: async (ctx, args) => {
		const equipmentsWithBrand = await ctx.db
			.query("equipments")
			.withIndex("by_brand", (q) => q.eq("brandId", args.id))
			.first();

		if (equipmentsWithBrand) {
			throw new Error("Cannot delete brand that is used by equipments");
		}

		return await ctx.db.delete(args.id);
	},
});