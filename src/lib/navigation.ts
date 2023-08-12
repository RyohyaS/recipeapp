import { createEventDispatcher } from "svelte";

const dispatch = createEventDispatcher();
export function goNextPage() {
  dispatch("continue");
}
