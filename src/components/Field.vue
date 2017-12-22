<template>
  <div class="field" :class="{ 'has-bomb': hasBomb, 'is-open': isOpen, 'is-marked': isMarked }"></div>
</template>

<script>
  export default {
    name: 'MField',
    props: { field: Object },
    data () {
      return {
        ...this.field
      }
    }
  }
</script>

<style>
  .field {
    background-color: #ddd;
    height: 20px;
    margin: 1px;
    width: 20px;
  }

  .has-bomb::after {
    content: "💣";
  }
  .is-open {
    background-color: #666;
  }
</style>
