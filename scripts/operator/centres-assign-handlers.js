import { assignSearchBarHandler } from "./centres-search.js";
import { assignCentreSelectHandlers } from "./centres-display.js";
import { assignFilterButtonHandler, assignStallNumberInputHandler, assignStallNumberInputGroupHandler } from "./centres-filter.js";

export async function assignEventHandlers() {
  assignSearchBarHandler();
  await assignCentreSelectHandlers();
  assignFilterButtonHandler();
  assignStallNumberInputHandler();
  assignStallNumberInputGroupHandler();
}
