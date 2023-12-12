<script lang="ts">
  import { Label } from '@/lib/components/label'
  import { Input } from '@/lib/components/input'
  import { Button } from '@/lib/components/button'

  import type { FolderNode } from '../core'

  export let node: FolderNode
  export let onSubmit: (node: FolderNode) => void

  let title = node.title
</script>

<form on:submit|preventDefault={() => onSubmit({ ...node, title })}>
  <h3 class="font-bold text-lg">Edit folder</h3>

  <div class="flex flex-col w-full gap-2">
    <Label for="folder-name">Folder name</Label>
    <Input
      type="text"
      id="folder-name"
      placeholder="My folder"
      bind:value={title}
    />
  </div>
  <Button type="submit" class="w-full">Save</Button>
</form>
