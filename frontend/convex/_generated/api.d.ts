/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auditLogs from "../auditLogs.js";
import type * as biometrics from "../biometrics.js";
import type * as correctionRequests from "../correctionRequests.js";
import type * as crons from "../crons.js";
import type * as documents from "../documents.js";
import type * as http from "../http.js";
import type * as nextOfKin from "../nextOfKin.js";
import type * as notifications from "../notifications.js";
import type * as pensioners from "../pensioners.js";
import type * as scheduler from "../scheduler.js";
import type * as storage from "../storage.js";
import type * as users from "../users.js";
import type * as verification from "../verification.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auditLogs: typeof auditLogs;
  biometrics: typeof biometrics;
  correctionRequests: typeof correctionRequests;
  crons: typeof crons;
  documents: typeof documents;
  http: typeof http;
  nextOfKin: typeof nextOfKin;
  notifications: typeof notifications;
  pensioners: typeof pensioners;
  scheduler: typeof scheduler;
  storage: typeof storage;
  users: typeof users;
  verification: typeof verification;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
