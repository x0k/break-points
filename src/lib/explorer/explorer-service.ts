import { get, type Writable } from 'svelte/store'
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
} from './core'
import {
  type GeoLocation,
  type BoundaryLocations,
  insertBoundaryLocations,
} from '../geo-location'

export interface ExplorerServiceOptions {
  nodes: Writable<ExplorerNode[]>
  open: Writable<Set<ExplorerNodeId>>
  selected: Writable<Set<ExplorerNodeId>>
}

const BASE_MAP_LINK = 'https://yandex.com/maps/'
export class ExplorerService implements IExplorerService {
  constructor(private options: ExplorerServiceOptions) {}

  get nodes() {
    return this.options.nodes
  }

  get open() {
    return this.options.open
  }

  get selected() {
    return this.options.selected
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

  openMapWithSelectedPoints = (bounds: BoundaryLocations = {}): void => {
    const selected = get(this.options.selected)
    const nodes = get(this.options.nodes)
    const locations = extractNodes<GeoLocation>({
      nodes,
      selector: (node) => selected.has(node.id) && isPoint(node),
      transform: (node) => (node as PointNode).location,
    })
    insertBoundaryLocations(locations, bounds)
    const points = locations
      .map((n) => `${n.latitude}%2C${n.longitude}`)
      .join('~')
    window.open(`${BASE_MAP_LINK}?rtext=${points}&mode=routes&rtt=auto&z=11`)
  }
}
