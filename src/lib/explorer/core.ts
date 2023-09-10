import type { Readable } from 'svelte/store'

import {
  isEqual,
  type GeoLocation,
  type BoundaryLocations,
} from '@/lib/geo-location'

export enum NodeType {
  Folder = 'folder',
  Point = 'point',
}

export const NODE_TYPE_TITLES: Record<NodeType, string> = {
  [NodeType.Folder]: 'folder',
  [NodeType.Point]: 'point',
}

export type ExplorerNodeId = string

export interface AbstractNode<T extends NodeType> {
  id: ExplorerNodeId
  type: T
  title: string
}

export interface FolderNode extends AbstractNode<NodeType.Folder> {
  children: ExplorerNode[]
}

export interface PointNode extends AbstractNode<NodeType.Point> {
  location: GeoLocation
  address: string
}

export interface CreateFolderNode {
  type: NodeType.Folder
  title: string
  parentId: ExplorerNodeId | null
}

export interface CreatePointNode {
  type: NodeType.Point
  title: string
  parentId: ExplorerNodeId | null
  location: GeoLocation
  address: string
}

export type CreateNode = CreateFolderNode | CreatePointNode

export type ExplorerNode = FolderNode | PointNode

export enum MapType {
  Yandex = 'yandex',
  Google = 'google',
  DoubleGis = '2gis',
}

export const MAP_TYPES = Object.values(MapType)

export interface IMapUrlGenerator {
  generate(locations: GeoLocation[]): string
}

export interface IMapUrlGeneratorFactory {
  create(type: MapType): IMapUrlGenerator
}

export interface IExplorerService {
  nodes: Readable<ExplorerNode[]>
  open: Readable<Set<ExplorerNodeId>>
  selected: Readable<Set<ExplorerNodeId>>
  mapType: Readable<MapType>
  setMapType (mapType: MapType): void
  openFolder(folder: FolderNode): void
  selectNode(node: ExplorerNode): void
  createAndInsertNode(node: CreateNode): void
  removeNode(node: ExplorerNode): void
  clearSelection(): void
  openMapWithSelectedPoints(mapType: MapType, options?: BoundaryLocations): void
}

export interface PlaceLocation {
  location: GeoLocation
  address: string
}

export interface ILocationService {
  isUserLocationAvailable: boolean
  getUserLocation(): Promise<GeoLocation>
  searchPlaceByAddress(
    address: string,
    near?: GeoLocation
  ): Promise<PlaceLocation[]>
  searchPlaceByLocation(location: GeoLocation): Promise<PlaceLocation>
}

export function isPoint(node: ExplorerNode): node is PointNode {
  return node.type === NodeType.Point
}

export function isFolder(node: ExplorerNode): node is FolderNode {
  return node.type === NodeType.Folder
}

export function getNodeId(node: ExplorerNode): ExplorerNodeId {
  return node.id
}

export function getNodeTitle(node: ExplorerNode): string {
  return node.title
}

export function isMapType(value: unknown): value is MapType {
  return MAP_TYPES.includes(value as MapType)
}

export function traverse(
  nodes: ExplorerNode[],
  callback: (node: ExplorerNode) => void
): void {
  for (const node of nodes) {
    callback(node)
    if (isFolder(node)) {
      traverse(node.children, callback)
    }
  }
}

export interface ExtractNodesOptions<R> {
  nodes: ExplorerNode[]
  selector?: (node: ExplorerNode) => boolean
  transform?: (node: ExplorerNode) => R
}

export function extractNodes<R>({
  nodes,
  selector,
  transform,
}: ExtractNodesOptions<R>): R[] {
  const results: R[] = []
  let visit: (node: ExplorerNode) => void = transform
    ? (node) => results.push(transform(node))
    : (node) => results.push(node as R)
  if (selector) {
    const v = visit
    visit = (node) => {
      if (selector(node)) {
        v(node)
      }
    }
  }
  traverse(nodes, visit)
  return results
}

export function extractNodeIds(
  node: ExplorerNode,
  selector?: (node: ExplorerNode) => boolean
): ExplorerNodeId[] {
  const ids = isFolder(node)
    ? extractNodes({
        nodes: node.children,
        transform: getNodeId,
        selector,
      })
    : []
  if (!selector || selector(node)) {
    ids.unshift(node.id)
  }
  return ids
}

export function extractPointIds(node: ExplorerNode): ExplorerNodeId[] {
  return extractNodeIds(node, isPoint)
}

export function compareNodes(a: ExplorerNode, b: ExplorerNode): number {
  if (a.type === b.type) {
    return a.title.localeCompare(b.title)
  }
  return a.type === NodeType.Folder ? -1 : 1
}

export function createFolderNode(data: CreateFolderNode): FolderNode {
  return {
    id: Date.now().toString(16),
    type: NodeType.Folder,
    title: data.title,
    children: [],
  }
}

export function createPointNode(data: CreatePointNode): PointNode {
  return {
    id: Date.now().toString(16),
    title: data.title,
    type: NodeType.Point,
    location: data.location,
    address: data.address,
  }
}

function insertNodeIntoSortedArray(
  nodes: ExplorerNode[],
  node: ExplorerNode
): void {
  for (let i = 0; i < nodes.length; i++) {
    const child = nodes[i]
    if (compareNodes(child, node) > 0) {
      nodes.splice(i, 0, node)
      return
    }
  }
  nodes.push(node)
}

function insertNodeIntoParentNode(
  nodes: ExplorerNode[],
  parentId: ExplorerNodeId,
  node: ExplorerNode
): boolean {
  for (const child of nodes) {
    if (child.id === parentId) {
      if (!isFolder(child)) {
        throw new Error('Parent node is not a folder')
      }
      insertNodeIntoSortedArray(child.children, node)
      return true
    } else if (isFolder(child)) {
      if (insertNodeIntoParentNode(child.children, parentId, node)) {
        return true
      }
    }
  }
  return false
}
export function insertNode(
  nodes: ExplorerNode[],
  node: ExplorerNode,
  parentId: ExplorerNodeId | null = null
): void {
  if (parentId) {
    insertNodeIntoParentNode(nodes, parentId, node)
  } else {
    insertNodeIntoSortedArray(nodes, node)
  }
}

export function removeNode(
  nodes: ExplorerNode[],
  nodeId: ExplorerNodeId
): boolean {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if (node.id === nodeId) {
      nodes.splice(i, 1)
      return true
    } else if (isFolder(node)) {
      if (removeNode(node.children, nodeId)) {
        return true
      }
    }
  }
  return false
}

export function getNodeById(
  nodes: ExplorerNode[],
  nodeId: ExplorerNodeId
): ExplorerNode | null {
  for (const node of nodes) {
    if (node.id === nodeId) {
      return node
    } else if (isFolder(node)) {
      const result = getNodeById(node.children, nodeId)
      if (result) {
        return result
      }
    }
  }
  return null
}

export type RecursiveVisitorNode<R> =
  | PointNode
  | (Omit<FolderNode, 'children'> & {
      children: R[]
    })

export type RecursiveVisitor<R> = (node: RecursiveVisitorNode<R>) => R

export type RecursiveTraverser<R> = (nodes: ExplorerNode[]) => R[]

export function makeRecursiveTraverser<R>(
  visitor: RecursiveVisitor<R>
): RecursiveTraverser<R> {
  const traverse: RecursiveTraverser<R> = (nodes) =>
    nodes.map((node) =>
      isPoint(node)
        ? visitor(node)
        : visitor({ ...node, children: traverse(node.children) })
    )
  return traverse
}

function getMetadataForMerge(nodes: ExplorerNode[]) {
  const map = new Map<ExplorerNodeId, number>()
  const points: PointNode[] = []
  const folders: FolderNode[] = []
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    map.set(node.id, i)
    if (isPoint(node)) {
      points.push(node)
    } else {
      folders.push(node)
    }
  }
  return {
    map,
    points,
    folders,
  }
}

export function extractSelectedSubTree(
  nodes: ExplorerNode[],
  selected: Set<ExplorerNodeId>
) {
  function isSelectedOrHasSelectedNode(node: ExplorerNode) {
    return isPoint(node) ? selected.has(node.id) : node.children.length > 0
  }
  function visit(node: RecursiveVisitorNode<ExplorerNode>): ExplorerNode {
    if (isPoint(node)) {
      return node
    }
    return {
      ...node,
      children: node.children.filter(isSelectedOrHasSelectedNode),
    }
  }
  return makeRecursiveTraverser(visit)(nodes).filter(
    isSelectedOrHasSelectedNode
  )
}

export function mergeTrees(
  a: ExplorerNode[],
  b: ExplorerNode[]
): ExplorerNode[] {
  const result = a.slice()
  const { map, points, folders } = getMetadataForMerge(a)
  for (const node of b) {
    const index = map.get(node.id)
    if (index !== undefined) {
      const existedNode = result[index]
      if (isFolder(existedNode) && isFolder(node)) {
        existedNode.children = mergeTrees(existedNode.children, node.children)
      }
      continue
    }
    if (isFolder(node)) {
      const sameFolders = folders.filter((f) => f.title === node.title)
      if (sameFolders.length > 0) {
        const firstFolder = sameFolders[0]
        firstFolder.children = mergeTrees(firstFolder.children, node.children)
      } else {
        insertNodeIntoSortedArray(result, node)
      }
    } else {
      const samePoints = points.filter((p) =>
        isEqual(p.location, node.location)
      )
      if (samePoints.length === 0) {
        insertNodeIntoSortedArray(result, node)
      }
    }
  }
  return result
}
