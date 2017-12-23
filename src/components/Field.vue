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
    align-items: center;
    background-color: #ddd;
    display: flex;
    height: 40px;
    justify-content: center;
    margin: 1px 1px 0 0;
    text-align: center;
    width: 40px;
  }

  .has-bomb::after {
    content: "💣";
  }
  .is-open {
    background-color: #666;
  }
</style>
