const test = require('node:test')
const assert = require('node:assert/strict')
const { createDragHandlers } = require('../js/graph-force.js')

test('drag reheats force simulation and release returns an ordinary node to the web', () => {
  let reheats = 0
  const graph = { d3ReheatSimulation: () => { reheats += 1 } }
  const handlers = createDragHandlers(graph, () => false)
  const node = { fx: 120, fy: 80 }

  handlers.onNodeDrag(node)
  handlers.onNodeDragEnd(node)

  assert.equal(reheats, 2)
  assert.equal(node.fx, undefined)
  assert.equal(node.fy, undefined)
})

test('release preserves an intentional focus pin', () => {
  const graph = { d3ReheatSimulation: () => {} }
  const focused = { fx: 0, fy: 0 }
  const handlers = createDragHandlers(graph, node => node === focused)

  handlers.onNodeDragEnd(focused)

  assert.equal(focused.fx, 0)
  assert.equal(focused.fy, 0)
})
