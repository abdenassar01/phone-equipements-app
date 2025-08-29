/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as accessories from "../accessories.js";
import type * as accessoryCategories from "../accessoryCategories.js";
import type * as brands from "../brands.js";
import type * as equipmentTypes from "../equipmentTypes.js";
import type * as equipments from "../equipments.js";
import type * as files from "../files.js";
import type * as healthCheck from "../healthCheck.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  accessories: typeof accessories;
  accessoryCategories: typeof accessoryCategories;
  brands: typeof brands;
  equipmentTypes: typeof equipmentTypes;
  equipments: typeof equipments;
  files: typeof files;
  healthCheck: typeof healthCheck;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
