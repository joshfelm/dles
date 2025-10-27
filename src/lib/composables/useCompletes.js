import { completedIds } from "$lib/stores"
import { isLocalStorageAvailable } from "$lib/js/utilities"
import { get } from "svelte/store"

export function useCompletes() {

  function isCompleted(dle) {
    const currentCompleted = get(completedIds)
    return currentCompleted.includes(dle.id)
  }

  function resetCompleted() {
    const currentCompleted = get(completedIds)
    completedIds.update(() => []);

    if (isLocalStorageAvailable()) {
      localStorage.completed = JSON.stringify(get(completedIds))
    }
  }

  function addToCompleted(dle) {
    try {
      const currentCompleted = get(completedIds)

      if (currentCompleted.includes(dle.id)) {
        return true
      }

      completedIds.update(completed => [...completed, dle.id])

      if (isLocalStorageAvailable()) {
        localStorage.completed = JSON.stringify(get(completedIds))
      }

      return true
    } catch (error) {
      console.error('Failed to toggle completed:', error)
      return false
    }
  }

  function removeFromCompleted(dle) {
    try {
      completedIds.update(completed => completed.filter(id => id !== dle.id))

      if (isLocalStorageAvailable()) {
        localStorage.completed = JSON.stringify(get(completedIds))
      }

      return true
    } catch (error) {
      console.error('Failed to remove completed:', error)
      return false
    }
  }

  function toggleCompleted(dle) {
    const wasInCompleted = isCompleted(dle)
    let success = false

    if (wasInCompleted) {
      success = removeFromCompleted(dle)
    } else {
      success = addToCompleted(dle)
    }

    return {
      success,
      action: wasInCompleted ? 'incomplete' : 'completed',
      wasInCompleted,
      totalCompleted: get(completedIds).length
    }
  }

  function getCompletedCount() {
    return get(completedIds).length
  }

  return {
    isCompleted,
    addToCompleted,
    removeFromCompleted,
    toggleCompleted,
    getCompletedCount,
    resetCompleted,
  }
}
