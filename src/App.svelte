<script lang="ts">
  import { InitApi, messages, resetMessages } from "./lib/gpt";
  import Home from "./views/Home.svelte";
  import Chat from "./views/Chat.svelte";
  import { view, isdebug, apikey } from "./lib/store";
  import { onMount } from "svelte";

  let key0 = "";

  let key = apikey.get();

  onMount(() => {
    if (key) {
      InitApi(key);
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

  function reset() {
    view.set("home");
    resetMessages();
  }

  function setApiKey(event) {
    event.preventDefault();
    key = key0;
    apikey.set(key);
    InitApi(key);
    document.querySelector("dialog").close();
  }
</script>

<main>
  {#if key}
    {#if $view == "home"}
      <Home />
    {:else}
      <Chat />
    {/if}

    {#if $isdebug}
      <hr />
      {#each $messages as message}
        <p>role: {message.role}, content: {message.content}</p>
      {/each} 
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
  <button on:click={renew_key}>renew apikey</button>

  <hr />
  <button on:click={reset}>reset</button>
</main>

<style>
  dialog::backdrop {
    background-color: grey;
  }
</style>
