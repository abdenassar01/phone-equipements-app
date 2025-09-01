import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  brands: defineTable({
    name: v.string(),
    logo: v.optional(v.id("_storage")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_name", ["name"]),

	equipmentTypes: defineTable({
		name: v.string(),
		description: v.optional(v.string()),
		createdAt: v.number(),
		updatedAt: v.number(),
	}).index("by_name", ["name"]),

	equipments: defineTable({
		label: v.string(),
		description: v.string(),
		brandId: v.id("brands"),
		equipmentTypeId: v.id("equipmentTypes"),
		variants: v.array(v.object({
			label: v.string(),
			price: v.number(),
			stock: v.optional(v.string()),
			attributes: v.optional(v.object({
				color: v.optional(v.string()),
				size: v.optional(v.string()),
				material: v.optional(v.string()),
				compatibility: v.optional(v.array(v.string())),
			})),
		})),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_brand", ["brandId"])
		.index("by_equipment_type", ["equipmentTypeId"])
		.index("by_brand_and_type", ["brandId", "equipmentTypeId"])
		.index("by_updated_at", ["updatedAt"]),

	accessoryCategories: defineTable({
		name: v.string(),
		description: v.optional(v.string()),
		icon: v.optional(v.string()),
		createdAt: v.number(),
		updatedAt: v.number(),
	}).index("by_name", ["name"]),

	accessories: defineTable({
		label: v.string(),
		description: v.optional(v.string()),
		categoryId: v.id("accessoryCategories"),
		images: v.optional(v.array(v.id("_storage"))),
		price: v.number(),
		sku: v.optional(v.string()),
		inStock: v.optional(v.boolean()),
		features: v.optional(v.array(v.string())),
		specifications: v.optional(v.object({
			brand: v.optional(v.string()),
			model: v.optional(v.string()),
			color: v.optional(v.string()),
			material: v.optional(v.string()),
			dimensions: v.optional(v.string()),
			weight: v.optional(v.string()),
			connectivity: v.optional(v.array(v.string())),
			compatibility: v.optional(v.array(v.string())),
		})),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_category", ["categoryId"])
		.index("by_price", ["price"])
		.index("by_updated_at", ["updatedAt"]),
});
