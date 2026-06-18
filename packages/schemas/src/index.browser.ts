// Browser-safe barrel: pure Zod schemas + inferred types only.
// Excludes every *.dto.ts file, which imports `nestjs-zod` (a server-only
// package that crashes in the browser). Resolved via the `browser` export
// condition in package.json — see also the full barrel in ./index.ts.
export * from "./animal/animal";
export * from "./clinic/clinic";
export * from "./supplier/supplier";
export * from "./veterinarian-contracts/veterinarian-contracts";
export * from "./food-supplier-contracts/food-supplier-contracts";
export * from "./complementary-service-contracts/complementary-service-contracts";
export * from "./active-veterinarians/active-veterinarians";
export * from "./animal-care-schedule/animal-care-schedule";
export * from "./revenue-plan/revenue-plan";
export * from "./contract/contract";
export * from "./service-offered/service-offered";
export * from "./transport-service/transport-service";
export * from "./veterinarian/veterinarian";
export * from "./activity-schedule/activity-schedule";
export * from "./donation/donation";
export * from "./adoption/adoption";
