import { assignSearchBarHandler } from "./centres-search.js";
import { assignCentreSelectHandlers } from "./centres-handlers.js";

export async function assignEventHandlers() {
  assignSearchBarHandler();
  await assignCentreSelectHandlers();
}
