import type { SourceModule } from "../types.js";
import { isedBenefitsFinder } from "./business/ised-benefits-finder.js";
import { isedSupports } from "./business/ised-supports.js";
import { educanada } from "./student/educanada.js";
import { indigenousBursaries } from "./student/indigenous-bursaries.js";
import { nserc } from "./professor/nserc.js";
import { sshrc } from "./professor/sshrc.js";

// Adding a future source: drop a new module under sources/<role>/ and append it here.
// No other orchestrator edits are required.
export const SOURCES: SourceModule[] = [
  isedBenefitsFinder,
  isedSupports,
  educanada,
  indigenousBursaries,
  nserc,
  sshrc,
];
