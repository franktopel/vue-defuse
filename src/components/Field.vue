<template>
  <div class="field" :class="{ 'has-bomb': field.hasBomb, 'is-open': field.isOpen, 'is-marked': field.isMarked }"></div>
</template>

<script>
  export default {
    name: 'MField',
    props: { field: Object }
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
