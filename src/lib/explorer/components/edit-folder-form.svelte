<script lang="ts">
  import type { FolderNode } from '../core'

  export let node: FolderNode
  export let onSubmit: (node: FolderNode) => void

  let title = node.title
</script>

<form on:submit|preventDefault={() => onSubmit({ ...node, title })}>
  <h3 class="font-bold text-lg">Edit folder</h3>

  <div class="form-control w-full">
    <input
      placeholder="Folder name"
      type="text"
      class="mt-2 input input-bordered w-full"
      required
      bind:value={title}
    />
  </div>
  <div class="modal-action">
    <button type="submit" class="btn btn-primary">Save</button>
  </div>
</form>
