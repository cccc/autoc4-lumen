import type { Appliance } from "@/lib/appliances/types";
import plenar from "./plenar";
import wohnzimmer from "./wohnzimmer";
import fnord from "./fnord";
import keller from "./keller";

// order within a room is the render order
export const appliances: Appliance[] = [
    ...plenar,
    ...wohnzimmer,
    ...fnord,
    ...keller,
];