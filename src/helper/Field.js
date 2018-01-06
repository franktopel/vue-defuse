let Field = function (x, y) {
  this.x = x
  this.y = y
  this.isOpen = false
  this.hasBomb = false
  this.isMarked = false
  this.numNeighbourBombs = null
}

module.exports = Field
