<script>
  import { onMount } from "svelte"
  import { useCompletes } from "$lib/composables/useCompletes.js"
  import { completedIds } from "$lib/stores"
  import { useTracking } from "$lib/composables/useTracking.js"
  import IconComplete from "../Icons/IconCompleteOutline.svelte"
  import IconIncomplete from "../Icons/IconIncomplete.svelte"

  export let dle
  export let size = "normal" // "normal" or "small"
  export let section = 'regular'
  export let position = null

  const completed = useCompletes()
  const tracking = useTracking()

  let favoriteFill
  let favoriteColor = "rgb(var(--colors-colorTextSofter))"
  let unFavoriteColor = "transparent"
  let isHovered = false
  let isTouchDevice = false

  $: isCompleted = $completedIds.includes(dle.id)
  $: setFill(isCompleted)

  onMount(() => {
    setFill(completed.isCompleted(dle))

    isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  })

  function setFill(isFavorited) {
    favoriteFill = isFavorited ? favoriteColor : unFavoriteColor
  }

  function toggleCompleted() {
    const result = completed.toggleCompleted(dle)

    if (result.success) {
      setFill(!result.wasInCompleted)

      tracking.trackCompleteAction(
        dle,
        result.action,
        'button',
        section,
        position,
      )
    }
  }
</script>

<button
  style="fill: {favoriteFill ?? 'transparent'};"
  on:click={toggleCompleted}
  on:mouseenter={() => !isTouchDevice && (isHovered = true)}
  on:mouseleave={() => isHovered = false}
  class="hover:scale-105 flex items-center justify-center complete-button"
  class:small={size === "small"}
  class:icon={size === "icon"}
  class:is-completed={isCompleted}
  title={isCompleted ? "Mark incomplete" : "Mark complete"}
>
  {#if isCompleted && isHovered && !isTouchDevice}
    <IconIncomplete />
  {:else}
    <IconComplete />
  {/if}
</button
>

<style lang="postcss">
  .small {
    @apply h-5 w-5 min-h-0;
  }

  .icon {
    @apply h-7 w-6 min-h-0;
  }

  .icon :global(svg) {
    @apply w-4 h-4;
  }

  .small :global(svg) {
    @apply w-5 h-5;
  }
</style>
