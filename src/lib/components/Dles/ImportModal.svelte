<script>
  import { dles, favoriteIds } from "$lib/stores"
  import { categoryIcons } from "$lib/js/categoryIcons"
  import { categoryColors } from "$lib/stores"
  import { clickOutside } from "$lib/js/clickOutside"
  import { useFavorites } from "$lib/composables/useFavorites.js"
  import { useTracking } from "$lib/composables/useTracking.js"
  import { onMount } from "svelte"
  import IconClose from "../Icons/IconClose.svelte"
  import IconPlus from "../Icons/IconPlus.svelte"
  import DleList from "./DleList.svelte"

  export let onClose
  export let pageX
  export let pageY

  const favorites = useFavorites()
  const tracking = useTracking()

  let importCode = ""
  let invalidCode = false
  let response = false
  let newlyToggledInSession = new Set()
  let isTouchDevice = false
  let addedFavorites = 0

  let width = 320
  let baseHeight = 120
  let maxHeight = 150

  $: currentHeight = response ? maxHeight : baseHeight

  $: isMobile = typeof window !== 'undefined' && window.innerWidth <= 768

  let adjustedPageX, adjustedPageY, transformX, transformY

  $: {
    if (isMobile) {
      adjustedPageX = '50%'
      adjustedPageY = '2%'
      transformX = '-50%'
      transformY = '0%'
    } else {
      if (pageX < width / 2) {
        pageX = width / 2 + 5
      }
      if (pageX + width / 2 > document.documentElement.clientWidth) {
        pageX = document.documentElement.clientWidth - width / 2 - 5
      }

      const viewportY = pageY - window.scrollY

      adjustedPageY = viewportY - 68
      transformY = "0%"

      adjustedPageX = pageX
      transformX = '-50%'
    }
  }

  function toggleFavorite(dle) {
    const result = favorites.toggleFavorite(dle)

    if (result.success) {
      newlyToggledInSession.add(dle.id)

      tracking.trackFavoriteAction(
        dle,
        result.action,
        'import-modal',
        'favorites-import',
        null,
        result.totalFavorites
      )
    }
  }

  function addFavorite(dle) {
    const result = favorites.addToFavorites(dle)

    if (result.success) {
      newlyToggledInSession.add(dle.id)

      tracking.trackFavoriteAction(
        dle,
        result.action,
        'import-modal',
        'favorites-import',
        null,
        result.totalFavorites
      )
    }
  }

  function decodeFavorites(str) {
    const ids = [];
    for (let i = 0; i < str.length; i += 3) {
      ids.push(parseInt(str.substr(i, 3), 36));
    }
    return ids;
  }

  function processImport(favList) {
    const favs = decodeFavorites(favList);
    addedFavorites = 0;
    if (/^[a-zA-Z0-9]+$/.test(favList)) {
      favs.forEach(key => {
        let newFav = $dles.find(dle => dle.id === Number(key))
        if (newFav) {
          if (!favorites.isFavorited(newFav)) {
            addedFavorites++;
            response = true;
          }
          addFavorite(newFav);
        }
      });
    } else {
      invalidCode = true;
      response = true;
    }
  }

  function handleKeydown(event) {
    if (event.key === 'Escape') {
      onClose()
    } else if (event.key === 'Enter') {
      processImport(importCode)
    }
  }

  function handleClickOutside() {
    onClose()
  }

  onMount(() => {
    isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  })

  function focusInput(element) {
    element.focus()
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div
  class="importPopup"
  style="left: {adjustedPageX}{typeof adjustedPageX === 'number' ? 'px' : ''}; top: {adjustedPageY}{typeof adjustedPageY === 'number' ? 'px' : ''}; width: {width}px; height: {currentHeight}px; transform: translate({transformX}, {transformY});"
  use:clickOutside
  on:click_outside={handleClickOutside}
>
  <div class="flex justify-around items-center mb-2">
    <div class="w-6"></div> <!-- Placeholder for balance -->
    <h3 class="text-lg font-semibold text-colorText">Enter your code here!</h3>
    <button on:click={onClose}>
      <IconClose />
    </button>
  </div>

  <div class="import-header">
    <input
      type="text"
      placeholder="Import code..."
      bind:value={importCode}
      class="import-input"
      use:focusInput
    />
  </div>

  <div class="import-container" name="import-response">
    {#if invalidCode}
      <div class="reponses">
        <p
          class="repsonse-item"
          text-color="red">
            Invalid code
        </p>
      </div>
    {:else if addedFavorites > 0}
      <div class="reponses">
        <p
          class="repsonse-item"
          text-color="red">
            Added {addedFavorites} new favorites!
        </p>
      </div>
    {/if}
  </div>
</div>

<style lang="postcss">
  .importPopup {
    @apply fixed p-3 flex flex-col bg-colorCardC rounded-lg border border-colorNeutralSoft;
    z-index: 100;
    box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }

  :global(.dark) .importPopup {
    @apply border-colorTextSoftest;
    box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1);
  }

  .import-header {
    @apply flex-shrink-0 mb-2 flex justify-center;
  }

  .import-input {
    @apply p-2 border border-colorTextSoftest rounded bg-colorCardB text-colorText placeholder-colorTextSofter focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm;
    width: 80%;
    max-width: 300px;
  }

  .response-container {
    @apply flex-1 overflow-y-auto;
    min-height: 0; /* Important for flex child to shrink */
  }

  .response-item {
    @apply flex items-center justify-between p-2 pr-4 rounded cursor-pointer border-none w-full text-left;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }

</style>
