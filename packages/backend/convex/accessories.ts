import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const specificationsSchema = v.object({
	brand: v.optional(v.string()),
	model: v.optional(v.string()),
	color: v.optional(v.string()),
	material: v.optional(v.string()),
	dimensions: v.optional(v.string()),
	weight: v.optional(v.string()),
	connectivity: v.optional(v.array(v.string())),
	compatibility: v.optional(v.array(v.string())),
});

// Queries
export const getAllAccessories = query({
	args: {
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		let query = ctx.db.query("accessories").order("desc");

		// if (args.limit) {
		// 	query = query.take(args.limit);
		// }

		return await query.collect();
	},
});

export const getAccessoryById = query({
	args: { id: v.id("accessories") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	},
});

export const getAccessoriesByCategory = query({
	args: { categoryId: v.id("accessoryCategories") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("accessories")
			.withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
			.collect();
	},
});

export const getAccessoriesByPriceRange = query({
	args: {
		minPrice: v.number(),
		maxPrice: v.number(),
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query("accessories")
			.withIndex("by_price")
			.filter((q) =>
				q.gte(q.field("price"), args.minPrice) &&
				q.lte(q.field("price"), args.maxPrice)
			)
			.collect();
	},
});

export const searchAccessories = query({
	args: { searchTerm: v.string() },
	handler: async (ctx, args) => {
		const accessories = await ctx.db.query("accessories").collect();
		return accessories.filter(accessory =>
			accessory.label.toLowerCase().includes(args.searchTerm.toLowerCase()) ||
			(accessory.description && accessory.description.toLowerCase().includes(args.searchTerm.toLowerCase()))
		);
	},
});

// Mutations
export const createAccessory = mutation({
	args: {
		label: v.string(),
		description: v.optional(v.string()),
		categoryId: v.id("accessoryCategories"),
		images: v.optional(v.array(v.id("_storage"))),
		price: v.number(),
		sku: v.optional(v.string()),
		inStock: v.optional(v.boolean()),
		features: v.optional(v.array(v.string())),
		specifications: v.optional(specificationsSchema),
	},
	handler: async (ctx, args) => {
		const now = Date.now();
		return await ctx.db.insert("accessories", {
			...args,
			createdAt: now,
			updatedAt: now,
		});
	},
});

export const updateAccessory = mutation({
	args: {
		id: v.id("accessories"),
		label: v.optional(v.string()),
		description: v.optional(v.string()),
		categoryId: v.optional(v.id("accessoryCategories")),
		images: v.optional(v.array(v.id("_storage"))),
		price: v.optional(v.number()),
		sku: v.optional(v.string()),
		inStock: v.optional(v.boolean()),
		features: v.optional(v.array(v.string())),
		specifications: v.optional(specificationsSchema),
	},
	handler: async (ctx, args) => {
		const { id, ...updates } = args;
		return await ctx.db.patch(id, {
			...updates,
			updatedAt: Date.now(),
		});
	},
});

export const deleteAccessory = mutation({
	args: { id: v.id("accessories") },
	handler: async (ctx, args) => {
		return await ctx.db.delete(args.id);
	},
});

export const updateAccessoryStock = mutation({
	args: {
		id: v.id("accessories"),
		inStock: v.boolean(),
	},
	handler: async (ctx, args) => {
		return await ctx.db.patch(args.id, {
			inStock: args.inStock,
			updatedAt: Date.now(),
		});
	},
});