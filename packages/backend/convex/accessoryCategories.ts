import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Queries
export const getAllAccessoryCategories = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query("accessoryCategories").order("asc").collect();
	},
});

export const getAccessoryCategoryById = query({
	args: { id: v.id("accessoryCategories") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	},
});

export const getAccessoryCategoryByName = query({
	args: { name: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("accessoryCategories")
			.withIndex("by_name", (q) => q.eq("name", args.name))
			.first();
	},
});

// Mutations
export const createAccessoryCategory = mutation({
	args: {
		name: v.string(),
		description: v.optional(v.string()),
		icon: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const now = Date.now();
		return await ctx.db.insert("accessoryCategories", {
			name: args.name,
			description: args.description,
			icon: args.icon,
			createdAt: now,
			updatedAt: now,
		});
	},
});

export const updateAccessoryCategory = mutation({
	args: {
		id: v.id("accessoryCategories"),
		name: v.optional(v.string()),
		description: v.optional(v.string()),
		icon: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const { id, ...updates } = args;
		return await ctx.db.patch(id, {
			...updates,
			updatedAt: Date.now(),
		});
	},
});

export const deleteAccessoryCategory = mutation({
	args: { id: v.id("accessoryCategories") },
	handler: async (ctx, args) => {
		// Check if category is used in accessories
		const accessoriesWithCategory = await ctx.db
			.query("accessories")
			.withIndex("by_category", (q) => q.eq("categoryId", args.id))
			.first();

		if (accessoriesWithCategory) {
			throw new Error("Cannot delete category that is used by accessories");
		}

		return await ctx.db.delete(args.id);
	},
});