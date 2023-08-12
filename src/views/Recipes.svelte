<script>
  import { createEventDispatcher } from "svelte";
  import { getInstruction } from "../lib/gpt";

  export let data;
  const recipes = data.recipes;
  const dispatch = createEventDispatcher();
  export async function goNextPage(name) {
    data.thinking = true;
    data.instruction = await getInstruction(name);
    data.thinking = false;
    dispatch("continue");
  }
</script>

<div>
  <h1>Recipes</h1>
  Please select one of the recipes below.
  {#each recipes as recipe, i}
    <div class="card">
      <h2>{i + 1}. {recipe.name} [{recipe.time_to_cook} min.]</h2>
      <h3>Ingredients</h3>
      <ul>
        {#each recipe.ingredients as ingredient}
          <li>
            {ingredient.name}: {ingredient.amount} [{ingredient.unit}]
            <span class="need-to-buy">
              {ingredient.need_to_buy ? " < need to purchase" : ""}
            </span>
          </li>
        {/each}
      </ul>
      <button on:click|preventDefault={() => goNextPage(data.recipes[i].name)}
        >Select</button
      >
      <br />
    </div>
  {/each}
</div>

<style>
  /* flush right */
  button {
    float: right;
  }
  .need-to-buy {
    color: red;
  }
</style>
