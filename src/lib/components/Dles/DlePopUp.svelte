<script>
  import { poppedUpDle } from "$lib/stores"
  import { useTracking } from "$lib/composables/useTracking.js"
  import { useCompletes } from "$lib/composables/useCompletes.js"
  import IconClose from "../Icons/IconClose.svelte"
  import DleFavorite from "../Buttons/FavoriteButton.svelte"
  import DleCompleted from "../Buttons/CompleteButton.svelte"
  import { clickOutside } from "$lib/js/clickOutside"

  export let dle, pageX, pageY, clientY, handleClickOutside
  export let section = 'regular'
  export let position = null

  const tracking = useTracking()
  const completed = useCompletes()

  function trackGameClick(dle, clickType) {
    if (section === 'sponsors') {
      tracking.trackSponsorClick(dle, clickType, position);
    } else {
      tracking.trackGameClick(dle, clickType, 'popup', section, position)
    }
    completed.addToCompleted(dle)
  }

  let width = 310
  let height =
    30 +
    2 * 8 +
    2 * 12 +
    Math.floor(Math.ceil(28 * dle.name.length) / 10) +
    Math.floor(Math.ceil(24 * dle.description.length) / 26) +
    Math.floor(Math.ceil(24 * dle.url.length) / 26)

  $: adjustedPageX = (() => {
    let x = pageX
    if (x < width / 2) {
      x = width / 2 + 5
    }
    if (x + width / 2 > document.documentElement.clientWidth) {
      x = document.documentElement.clientWidth - width / 2 - 5
    }
    return x
  })()

  $: adjustedPageY = (() => {
    let y = pageY
    if (clientY < height) {
      y += height - clientY
    }
    return y
  })()

  function closePopup() {
    $poppedUpDle = ""
  }
</script>

<div class="dlePopUp bevel" style="left: {adjustedPageX}px; top: {adjustedPageY}px; width: {width}px" use:clickOutside on:click_outside={handleClickOutside}>
  <div class="flex justify-around items-start gap-2">
    <DleFavorite {dle} {section} {position} />

    <div class="text-center text-xl font-bold">
      {dle.name}
    </div>
    <button on:click={closePopup}>
      <IconClose />
    </button>
  </div>

  <div class="text-center text-base text-colorTextSoft">
    {dle.description}
  </div>

  <div class="text-center flex justify-center gap-2">
    <DleCompleted {dle} {section} {position} size="icon" />
    <a class:is-completed={completed.isCompleted(dle)} href={dle.url} target="_blank" on:click={() => trackGameClick(dle, 'popup-link')} on:auxclick={() => trackGameClick(dle, 'popup-middle-click')}>
      {dle.url}
    </a>
  </div>
</div>

<style lang="postcss">
  .dlePopUp {
    @apply absolute p-3 flex flex-col gap-2 bg-colorCardC rounded-lg shadow-sm shadow-colorTextSoftest z-50;
    transform: translate(-50%, -99%);
  }

  a {
    @apply text-center text-base underline break-words;
  }

  a.is-completed {
    @apply text-gray-500
  }

  a.is-completed:hover {
    @apply text-green-200
  }
</style>
