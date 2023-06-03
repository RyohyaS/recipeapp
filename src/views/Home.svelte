<script lang="ts">
  import { getGptResponse } from "../lib/gpt";
  import { nextView } from "../lib/store";

  let input = "what is 1+1";
  let message = "empty response";
  async function handleSubmit(event) {
    event.preventDefault();
    const resp = await getGptResponse(input);
    message = resp;
    nextView();
  }
</script>

<div>
  <h1>Home</h1>

  <form on:submit={handleSubmit}>
    <input type="text" id="input" bind:value={input} />
    <button id="submit">Submit</button>
  </form>
</div>
