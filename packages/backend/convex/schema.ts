import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	// Brand table for phone manufacturers
  brands: defineTable({
    name: v.string(),
    logo: v.optional(v.id("_storage")), // Convex storage ID for brand logo
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_name", ["name"]),

	// Equipment types (screen, battery, back cover, etc.)
	equipmentTypes: defineTable({
		name: v.string(),
		description: v.optional(v.string()),
		createdAt: v.number(),
		updatedAt: v.number(),
	}).index("by_name", ["name"]),

	// Equipment products with variants
	equipments: defineTable({
		label: v.string(), // Product name/title
		description: v.string(),
		brandId: v.id("brands"), // Reference to brand
		equipmentTypeId: v.id("equipmentTypes"), // Reference to equipment type
		variants: v.array(v.object({
			label: v.string(), // Variant name (e.g., "iPhone 14 Pro", "Black", "128GB")
			price: v.number(),
			stock: v.optional(v.string()),
			attributes: v.optional(v.object({
				color: v.optional(v.string()),
				size: v.optional(v.string()),
				material: v.optional(v.string()),
				compatibility: v.optional(v.array(v.string())), // Compatible phone models
			})),
		})),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_brand", ["brandId"])
		.index("by_equipment_type", ["equipmentTypeId"])
		.index("by_brand_and_type", ["brandId", "equipmentTypeId"])
		.index("by_updated_at", ["updatedAt"]),

	// Accessory categories (airpods, chargers, cases, etc.)
	accessoryCategories: defineTable({
		name: v.string(),
		description: v.optional(v.string()),
		icon: v.optional(v.string()), // Icon name or URL
		createdAt: v.number(),
		updatedAt: v.number(),
	}).index("by_name", ["name"]),

	// Accessories table
	accessories: defineTable({
		label: v.string(), // Product name
		description: v.optional(v.string()),
		categoryId: v.id("accessoryCategories"), // Reference to category
		images: v.optional(v.array(v.id("_storage"))), // Array of Convex storage IDs
		price: v.number(), // Price in cents
		sku: v.optional(v.string()),
		features: v.optional(v.array(v.string())), // Product features
		specifications: v.optional(v.object({
			brand: v.optional(v.string()),
			model: v.optional(v.string()),
			color: v.optional(v.string()),
			material: v.optional(v.string()),
			dimensions: v.optional(v.string()),
			weight: v.optional(v.string()),
			connectivity: v.optional(v.array(v.string())), // Bluetooth, USB-C, etc.
			compatibility: v.optional(v.array(v.string())), // Compatible devices
		})),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_category", ["categoryId"])
		.index("by_price", ["price"])
		.index("by_updated_at", ["updatedAt"]),
});
