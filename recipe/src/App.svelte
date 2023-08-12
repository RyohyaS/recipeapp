<script>
  import { InitApis, abort, messages } from "./lib/gpt";
  import Home from "./views/Home.svelte";
  import { isdebug, apikey } from "./lib/store";
  import { onMount } from "svelte";

  let key0 = "";
  let key = apikey.get();

  $isdebug = !!document.location.hash.match(/debug/);

  onMount(() => {
    console.info("============== starting app ===============");
    abort();
    if (key) {
      InitApis(key);
    } else {
      document.querySelector("dialog").showModal();
    }
  });

  function renew_key(event) {
    event.preventDefault();
    key0 = "";
    apikey.set("");
    document.querySelector("dialog").showModal();
  }

  function setApiKey(event) {
    event.preventDefault();
    key = key0;
    apikey.set(key);
    InitApis(key);
    document.querySelector("dialog").close();
  }
</script>

<main>
  {#if key}
    <Home />

    {#if $isdebug}
      <hr />
      <div class="debug">
        <h2>## DEBUG ##</h2>
        {#each $messages as message}
          <p>role: {message.role}, content: {message.content}</p>
        {/each}
      </div>
    {/if}
  {/if}

  <dialog>
    <form on:submit={setApiKey}>
      <p>Please enter your api key</p>
      <label
        >api_key:
        <input type="text" bind:value={key0} />
      </label>
      <br />
      <button type="submit">set openai apikey</button>
    </form>
  </dialog>

  <hr />
  <button on:click={renew_key}>renew apikey</button>
</main>

<style>
  dialog::backdrop {
    background-color: grey;
  }
</style>
