import { expect, test } from 'vitest'
import { NodeType, extractPointIds, type ExplorerNode } from './core'

test('Should correct extract points ids', () => {
  const nodes: ExplorerNode[] = [
    {
      id: '1',
      type: NodeType.Folder,
      title: 'Folder 1',
      children: [
        {
          id: '1.1',
          type: NodeType.Folder,
          title: 'Folder 1.1',
          children: [
            {
              id: '1.1.1',
              type: NodeType.Point,
              title: 'Point 1.1.1',
              location: {
                longitude: 0,
                latitude: 0,
              },
              address: 'address 1.1.1',
            },
          ],
        },
        {
          id: '1.2',
          type: NodeType.Point,
          title: 'Point 1.2',
          location: {
            longitude: 0,
            latitude: 0,
          },
          address: 'address 1.2',
        },
      ],
    },
    {
      id: '2',
      type: NodeType.Point,
      title: 'Point 2',
      location: {
        longitude: 0,
        latitude: 0,
      },
      address: 'address 2',
    },
  ]
  expect(extractPointIds(nodes[0])).toEqual(['1.1.1', '1.2'])
})
