<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import { abort, getRecipes, transcribeVoice } from "../lib/gpt";
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
    data.thinking = "looking up recipes";
    data.recipes = await getRecipes(
      ingredients.filter((i) => i),
      preference
    );
    data.thinking = "";
    goNextPage();
  }

  onMount(() => {
    startListening();
    return () => {
      abort();
    };
  });

  async function startListening() {
    console.log("startListen");
    try {
      const userinput = await transcribeVoice(
        navigator.language,
        ({ listening, transcribing }) => {
          if (listening) {
            data.thinking = "listening";
          }
          if (transcribing) {
            data.thinking = "transcribing voice";
          }
        }
      );
      console.info("userinput", userinput);
      data.thinking = "looking up recipes";
      data.recipes = await getRecipes([userinput]);
      data.thinking = "";
      goNextPage();
    } catch (e) {
      console.error("error", e);
    }
  }

  function listAvailableModels() {
    if ("speechSynthesis" in window) {
      console.log("xxxxxxxxxxxx");
      var synthesis = window.speechSynthesis;

      // Regex to match all English language tags e.g en, en-US, en-GB
      var langRegex = /^en(-[a-z]{2})?$/i;
      langRegex = /^ja-/i;

      // Get the available voices and filter the list to only have English speakers
      var voices = synthesis
        .getVoices()
        .filter((voice) => langRegex.test(voice.lang));
      console.log(voices);

      // Log the properties of the voices in the list
      voices.forEach(function (voice) {
        console.log({
          name: voice.name,
          lang: voice.lang,
          uri: voice.voiceURI,
          local: voice.localService,
          default: voice.default,
        });
      });
    } else {
      console.log("Text-to-speech not supported.");
    }
  }

  /**
   * speak 'Please provide available ingredients and preference' using browser tts
   * in english.
   */
  function speak() {
    listAvailableModels();
    var synthesis = window.speechSynthesis;

    const text = "Please provide available ingredients and preference.";
    const utterance = new SpeechSynthesisUtterance(text);
    // utterance.lang = "en-US";
    var voice = synthesis
      .getVoices()
      .filter(
        (voice) =>
          voice.lang === navigator.language && voice.name.match(/Natural/)
      )[0];
    utterance.voice = voice;

    synthesis.speak(utterance);
  }
</script>

<div class="card">
  <h2>Ingredients</h2>
  Please provide available ingredients and preference.
  <button on:click|preventDefault={speak}>Speak</button>
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
    <label>preference: <input type="text" bind:value={preference} /></label>
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
