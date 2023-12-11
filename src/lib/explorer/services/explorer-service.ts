import { get, type Writable } from 'svelte/store'

import {
  type GeoLocation,
  insertBoundaryLocations,
  type BoundaryLocations,
} from '@/lib/geo-location'

import {
  extractPointIds,
  type ExplorerNode,
  type ExplorerNodeId,
  type FolderNode,
  type CreateNode,
  createPointNode,
  createFolderNode,
  NodeType,
  insertNode,
  removeNode,
  type IExplorerService,
  extractNodeIds,
  isPoint,
  type PointNode,
  extractNodes,
  type IMapUrlGeneratorFactory,
  MapType,
  updateNode,
} from '../core'

export interface ExplorerServiceOptions {
  nodes: Writable<ExplorerNode[]>
  open: Writable<Set<ExplorerNodeId>>
  selected: Writable<Set<ExplorerNodeId>>
  mapType: Writable<MapType>
}

export class ExplorerService implements IExplorerService {
  constructor(
    private options: ExplorerServiceOptions,
    private readonly mapUrlGeneratorFactory: IMapUrlGeneratorFactory
  ) {}

  get nodes() {
    return this.options.nodes
  }

  get open() {
    return this.options.open
  }

  get selected() {
    return this.options.selected
  }

  get mapType() {
    return this.options.mapType
  }

  setMapType = (mapType: MapType): void => {
    this.options.mapType.set(mapType)
  }

  openFolder = (folder: FolderNode) => {
    this.options.open.update((s) => {
      if (s.has(folder.id)) {
        s.delete(folder.id)
      } else {
        s.add(folder.id)
      }
      return s
    })
  }

  selectNode = (node: ExplorerNode) => {
    const nodeIds = extractPointIds(node)
    this.options.selected.update((s) => {
      if (nodeIds.some((id) => s.has(id))) {
        nodeIds.forEach((id) => s.delete(id))
      } else {
        nodeIds.forEach((id) => s.add(id))
      }
      return s
    })
  }

  createAndInsertNode = (data: CreateNode) => {
    const { parentId } = data
    const node =
      data.type === NodeType.Point
        ? createPointNode(data)
        : createFolderNode(data)
    this.options.nodes.update((ns) => {
      insertNode(ns, node, parentId)
      return ns
    })
    if (parentId) {
      this.options.open.update((s) => {
        s.add(parentId)
        return s
      })
    }
  }

  updateNode (node: ExplorerNode): void {
    this.options.nodes.update((ns) => {
      updateNode(ns, node)
      return ns
    })
  }

  removeNode = (node: ExplorerNode) => {
    const nodeIds = extractNodeIds(node)
    this.options.nodes.update((ns) => {
      removeNode(ns, node.id)
      return ns
    })
    this.options.open.update((s) => {
      nodeIds.forEach((id) => s.delete(id))
      return s
    })
    this.options.selected.update((s) => {
      nodeIds.forEach((id) => s.delete(id))
      return s
    })
  }

  clearSelection = (): void => {
    this.options.selected.update((s) => {
      s.clear()
      return s
    })
  }

  openMapWithSelectedPoints = (
    mapType: MapType,
    bounds: BoundaryLocations = {}
  ): void => {
    const selected = get(this.options.selected)
    const nodes = get(this.options.nodes)
    const locations = extractNodes<GeoLocation>({
      nodes,
      selector: (node) => selected.has(node.id) && isPoint(node),
      transform: (node) => (node as PointNode).location,
    })
    insertBoundaryLocations(locations, bounds)
    const generator = this.mapUrlGeneratorFactory.create(mapType)
    const url = generator.generate(locations)
    window.open(url)
  }
}
