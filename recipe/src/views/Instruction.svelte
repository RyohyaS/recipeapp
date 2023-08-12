<script>
  export let data;
  const instruction = data.instruction;
</script>

<div>
  <h2>Instruction</h2>
  {instruction.name} [{instruction.time_to_cook} min.]
  <h3>Ingredients</h3>
  <ul>
    {#each instruction.ingredients as ingredient, i}
      <li>{ingredient.name}: {ingredient.amount} [{ingredient.unit}]</li>
    {/each}
  </ul>
  <h3>Steps</h3>
  <ol>
    {#each instruction.steps as step, i}
      <li>{step}</li>
    {/each}
  </ol>
</div>

<style>
</style>
