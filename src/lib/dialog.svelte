<script lang="ts">
  export let open = false

  export let onClose: () => void
</script>

<dialog {open} class="modal">
  <form method="dialog" class="modal-box" on:submit|preventDefault={onClose}>
    <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
      ✕
    </button>
    <slot />
  </form>
  <form
    method="dialog"
    class="modal-backdrop"
    on:submit|preventDefault={onClose}
  >
    <button>close</button>
  </form>
</dialog>
