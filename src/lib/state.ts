import type { Writable } from 'svelte/store'

import { MapType, type ExplorerNode, type ExplorerNodeId } from './explorer'
import { localWritable } from './svelte-storable-stores'

export const nodes: Writable<ExplorerNode[]> = localWritable('nodes', [])

export const selected: Writable<Set<ExplorerNodeId>> = localWritable(
  'selected',
  new Set()
)

export const open: Writable<Set<ExplorerNodeId>> = localWritable(
  'open',
  new Set()
)

export const mapType: Writable<MapType> = localWritable(
  'mapType',
  MapType.Yandex
)
