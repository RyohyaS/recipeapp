<script>
  import Spinner from "../lib/Spinner.svelte";
  import { resetMessages } from "../lib/gpt";
  import Ingredients from "./Ingredients.svelte";
  import Recipes from "./Recipes.svelte";
  import Instruction from "./Instruction.svelte";

  const pages = [Ingredients, Recipes, Instruction];
  let page = pages[0];

  let data = {
    thinking: false,
    recipes: [],
    selection: "",
    instruction: "",
  };

  function nextPage() {
    page = pages[pages.indexOf(page) + 1];
  }

  function reset() {
    resetMessages();
    page = pages[0];
  }
</script>

<content>
  <h1>Recipe Assistant</h1>
  {#if data.thinking}
    <Spinner />
  {:else}
    <svelte:component this={page} bind:data on:continue={nextPage} />
    <button on:click={reset}>Reset</button>
  {/if}
</content>

<style>
</style>
