<template>
  <div
    class="field"
    :class="[
    {
      'has-bomb': field.hasBomb && field.isOpen,
      'is-open': field.isOpen,
      'is-marked': field.isMarked,
    }, coordinates]"
    v-touch:longtap="emitLongtap(field)">
    {{ field.numNeighbourBombs ? field.numNeighbourBombs : null }}
  </div>
</template>

<script>
  export default {
    name: 'MField',
    props: { field: Object, longtap: Function },
    computed: {
      coordinates () {
        return `x${this.field.x}-y${this.field.y}`
      }
    },
    methods: {
      emitLongtap (field) {
        return (event) => {
          event.preventDefault()
          this.$emit('longtap', field, event)
        }
      }
    }
  }
</script>

<style lang="scss">
  :root {
    --fieldwidth: 60px;
    --iconsize: calc(var(--fieldwidth) / 3 * 2);
  }

  .field {
    align-items: center;
    background-color: #ddd;
    // border: 1px solid #aaa;
    border-collapse: collapse;
    color: #aaa;
    display: flex;
    font-size: var(--fieldwidth);
    height: var(--fieldwidth);
    justify-content: center;
    margin: 0 1px 1px 0;
    text-align: center;
    transition: all .1s linear;
    width: var(--fieldwidth);
    &:last-child {
      margin-right: 0;
    }
  }

  .has-bomb {
    font-size: var(--iconsize);
    line-height: var(--fieldwidth);
    &::after {
      content: "💣";
      position: relative;
      top: 6%;
    }
  }

  .is-open {
    background-color: #fff;
  }

  .is-marked {
    font-size: var(--iconsize);
    line-height: var(--fieldwidth);
    &::after {
      content: "🚩";
      position: relative;
      top: 6%;
    }
  }

  .is-highlighted,
  .field:not(.is-open):hover {
    background-color: #f0f0f0;
    box-shadow: 0 0 2px #333;
    transform: scale(1.15);
    z-index: 5;
  }
</style>
