<script>
  import { dles, favorites } from "$lib/stores"
  import { useFavorites } from "$lib/composables/useFavorites.js"
  import ImportModal from "./Dles/ImportModal.svelte"
  import IconCopy from "./Icons/IconCopy.svelte"
  import IconCopied from "./Icons/IconCopied.svelte"
  import IconImport from "./Icons/IconImport.svelte"

  let showImportModal = false
  let copied = false
  let modalX = 400;
  let modalY = 200;
  let importCode = "";
  let importing = false;
  let invalidCode = false;
  let codeEntered = false;
  let addedFavorites = 0;

  const faves = useFavorites()

  async function copyToClipboard() {
    const text = $favorites.map(fav => fav.id.toString(36).padStart(3, '0')).join('');
    await navigator.clipboard.writeText(text);
    copied = true;
    setTimeout(() => {
      copied = false;
    }, 5000);
  }

  function openImportModal(event) {
    const rect = event.target.closest('button').getBoundingClientRect();
    modalX = rect.left + rect.width / 2;
    modalY = rect.bottom - 10;

    showImportModal = true;
  }

  function triggerImport() {
    importing = true;
  }

  function closeImportModal() {
    showImportModal = false;
  }

  function focusInput(element) {
    element.focus()
  }

  function handleKeydown(event) {
    if (importing) {
      if (event.key === 'Escape') {
        importing = false
        importCode = ""
      } else if (event.key === 'Enter') {
        processImport(importCode)
        importing = false
        importCode = ""
        codeEntered = true
        setTimeout(() => {
          if (!importing) {
            addedFavorites = 0
            invalidCode = false
            codeEntered = false
          }
        }, 5000);
      }
    }
  }

  function addFavorite(dle) {
    const result = faves.addToFavorites(dle)

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
          if (!faves.isFavorited(newFav)) {
            addedFavorites++;
          }
          addFavorite(newFav);
        }
      });
    } else {
      invalidCode = true;
    }
  }
</script>

{#if showImportModal}
    <ImportModal onClose={closeImportModal} pageX={modalX} pageY={modalY} />
{/if}

<div class="flex justify-center items-center gap-1">
  <button on:click={copyToClipboard} class="btn-menu-item">
    {#if copied}
      <IconCopied />
      Copied to clipboard!
    {:else}
      <IconCopy />
      Export favorites to clipboard
    {/if}
  </button>
</div>
<div data-sveltekit-reload class="flex justify-center items-center gap-1">
  {#if importing}
    <input
      type="text"
      placeholder="Import code..."
      bind:value={importCode}
      class="btn-menu-item"
      use:focusInput
    />
  {:else if invalidCode}
  <button on:click={triggerImport} class="btn-menu-item">
    Invalid code!
  </button>
  {:else if addedFavorites > 0}
  <button on:click={triggerImport} class="btn-menu-item">
    Added {addedFavorites} new favorites!
  </button>
  {:else if codeEntered}
  <button on:click={triggerImport} class="btn-menu-item">
    No new favorites to add!
  </button>
  {:else}
  <button on:click={triggerImport} class="btn-menu-item">
    <IconImport />
    Import favorites
  </button>
  {/if}
</div>

<svelte:window on:keydown={handleKeydown} />

<style lang="postcss">
  button,
  a {
    @apply !p-2 w-full text-center rounded-md !bg-colorCardA;
  }

  input.btn-menu-item {
    @apply !p-2 w-full text-center rounded-md !bg-colorCardA;
  }

</style>
