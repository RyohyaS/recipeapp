<script>
  import { createEventDispatcher } from "svelte";
  import { getRecipes } from "../lib/gpt";
  import { isdebug } from "../lib/store";

  const dispatch = createEventDispatcher();
  export function goNextPage() {
    dispatch("continue");
  }

  export let data;

  let ingredients = [""];
  let preference = "";
  if ($isdebug) {
    ingredients = [
      "1 cup of tomato sauce",
      "3 pieces of potato",
      "1 clove of garlic",
    ];
    preference = "Japanese";
  }

  function addIngredient() {
    ingredients = [...ingredients, ""];
  }
  async function handleSubmit() {
    data.thinking = true;
    try {
      data.recipes = await getRecipes(
        ingredients.filter((i) => i),
        preference
      );
    } catch (e) {
      let msg = e.response?.data?.message ?? e.message;
      console.error(msg);
      alert("Something went wrong. Please try again. \n" + msg);
    }
    data.thinking = false;
    goNextPage();
  }
</script>

<div class="card">
  <h2>Ingredients</h2>
  Please provide available ingredients and additional information.
  <form on:submit|preventDefault={handleSubmit}>
    <ul>
      {#each ingredients as ingredient, i}
        <li>
          <label>
            ingredient {i + 1}:
            <input type="text" id="input" bind:value={ingredient} />
            <button on:click|preventDefault={addIngredient}>+</button>
          </label>
        </li>
      {/each}
    </ul>
    <label>additional information (ex. mexican food, kids meal): <input type="text" bind:value={preference} /></label>
    <hr />
    <button id="submit">Submit</button>
  </form>
</div>

<style>
  li button {
    display: none;
    padding: 0.2em;
  }
  li:last-child button {
    display: inline;
  }
</style>
