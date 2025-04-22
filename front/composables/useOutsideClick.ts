import type { Ref } from 'vue';
import { onMounted, onBeforeUnmount } from 'vue'

/**
 * Composable to detect clicks outside of a specified element
 * @param elementRef Reference to the element to check clicks against
 * @param callback Function to call when a click outside occurs
 */
export function useOutsideClick(elementRef: Ref<HTMLElement | null>, callback: () => void) {
  const handleClickOutside = (event: MouseEvent) => {
    if (elementRef.value && !elementRef.value.contains(event.target as Node)) {
      callback()
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
  })

  return {
    handleClickOutside
  }
}
