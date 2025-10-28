<script>
  import { settings } from "$lib/stores"
  import { onMount } from "svelte"
  import ThemeButton from "./Buttons/ThemeButton.svelte"
  import { isLocalStorageAvailable } from "$lib/js/utilities"
  import { page } from "$app/stores"
  import { base } from "$app/paths"
  import IconFavoriteOutline from "./Icons/IconFavoriteOutline.svelte"
  import IconCompleteOutline from "./Icons/IconCompleteOutline.svelte"

  onMount(() => {
    if (isLocalStorageAvailable()) {
      $settings.view = localStorage.view || "Category View"
      $settings.autoComplete = localStorage.autoComplete || "Manual Only"
      if (
        $settings.view !== "Category View" &&
        $settings.view !== "Detailed View"
      ) {
        $settings.view = "Category View"
      }
    } else {
      $settings.view = "Category View"
    }
  })

  function updateLocalStorage() {
    if (isLocalStorageAvailable()) {
      localStorage.view = $settings.view
      localStorage.autoComplete = $settings.autoComplete
    }
  }

  $: otherView =
    $settings.view === "Category View" ? "Detailed View" : "Category View"

  function toggleView() {
    $settings.view = otherView
    updateLocalStorage()
  }

  function toggleAutoComplete() {
    $settings.autoComplete = $settings.autoComplete === "On Visit" ? "Manual Only" : "On Visit"
    updateLocalStorage()
  }
</script>

<ThemeButton />
<div class="flex justify-center items-center gap-1">
  {#if $page.route.id === "/"}
    <button on:click={toggleView} class="btn-menu-item">
      Switch to {otherView}
    </button>
  {:else}
    <a data-sveltekit-reload class="btn-menu-item" href="{base}/">Go home </a>
  {/if}
</div>
<div class="flex justify-center items-center gap-1">
  <button on:click={toggleAutoComplete} class="flex justify-center items-center gap-1 btn-menu-item">
    <IconCompleteOutline />
    Mark complete: { $settings.autoComplete }
  </button>
</div>
<div data-sveltekit-reload class="flex justify-center items-center gap-1">
  <a class="menu-link btn-menu-item" href="{base}/favorites"
    ><IconFavoriteOutline /> Favorites</a
  >
</div>

<style lang="postcss">
  button,
  a {
    @apply !p-2 w-full text-center rounded-md !bg-colorCardA;
  }
</style>
