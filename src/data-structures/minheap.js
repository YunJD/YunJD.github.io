//Adapted from Google Closure library
import Node from './node'

export default class MinHeap {
  constructor() {
    this.nodes_ = []
  }

  insert(key, value) {
    const node = new Node(key, value)
    const nodes = this.nodes_
    nodes.push(node)
    this.moveUp_(nodes.length - 1)
  }

  remove() {
    const nodes = this.nodes_
    const count = nodes.length
    const rootNode = nodes[0]
    if (count <= 0) {
      return undefined
    } else if (count === 1) {
      nodes.length = 0
    } else {
      nodes[0] = nodes.pop()
      this.moveDown_(0)
    }
    return rootNode.value
  }

  peek() {
    return this.nodes_?.[0]?.value
  }

  peekKey() {
    return this.nodes_?.[0]?.key
  }

  moveDown_(index) {
    const nodes = this.nodes_
    const count = nodes.length

    // Save the node being moved down.
    const node = nodes[index]
    // While the current node has a child.
    while (index < count >> 1) {
      const leftChildIndex = this.getLeftChildIndex_(index)
      const rightChildIndex = this.getRightChildIndex_(index)

      // Determine the index of the smaller child.
      const smallerChildIndex =
        rightChildIndex < count && nodes[rightChildIndex].key < nodes[leftChildIndex].key
          ? rightChildIndex
          : leftChildIndex

      // If the node being moved down is smaller than its children, the node
      // has found the correct index it should be at.
      if (nodes[smallerChildIndex].key > node.key) {
        break
      }

      // If not, then take the smaller child as the current node.
      nodes[index] = nodes[smallerChildIndex]
      index = smallerChildIndex
    }
    nodes[index] = node
  }

  moveUp_(index) {
    const nodes = this.nodes_
    const node = nodes[index]

    // While the node being moved up is not at the root.
    while (index > 0) {
      // If the parent is greater than the node being moved up, move the parent
      // down.
      const parentIndex = this.getParentIndex_(index)
      if (nodes[parentIndex].key > node.key) {
        nodes[index] = nodes[parentIndex]
        index = parentIndex
      } else {
        break
      }
    }
    nodes[index] = node
  }

  getLeftChildIndex_(index) {
    return (index << 1) + 1
  }

  getRightChildIndex_(index) {
    return (index << 1) + 2
  }

  getParentIndex_(index) {
    return (index - 1) >> 1
  }

  getValues() {
    const nodes = this.nodes_
    return nodes.map(({ value }) => value)
  }

  getKeys() {
    const nodes = this.nodes_
    return nodes.map(({ key }) => key)
  }

  getCount() {
    return this.nodes_.length
  }

  isEmpty() {
    return this.nodes_.length === 0
  }

  clear() {
    this.nodes_.length = 0
  }
}
