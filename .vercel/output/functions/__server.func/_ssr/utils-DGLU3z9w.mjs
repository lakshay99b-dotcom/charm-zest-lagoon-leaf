import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/utils-DGLU3z9w.js
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function slugifyConcept(input) {
	return input.trim().toLowerCase().replace(/['']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}
//#endregion
export { slugifyConcept as n, cn as t };
