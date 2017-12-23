<template>
  <div class="field" :class="{ 'has-bomb': field.hasBomb, 'is-open': field.isOpen, 'is-marked': field.isMarked }"></div>
</template>

<script>
  export default {
    name: 'MField',
    props: { field: Object }
  }
</script>

<style lang="scss">
  .field {
    align-items: center;
    background-color: #ddd;
    display: flex;
    height: 40px;
    justify-content: center;
    margin: 1px 1px 0 0;
    text-align: center;
    transition: all .4s ease;
    width: 40px;
  }

  .has-bomb {
    &::after {
      content: "💣";
    }
  }

  .is-open {
    background-color: #666;
  }

  .is-highlighted,
  .field:hover {
    box-shadow: 0 0 10px #a00;
    transform: scale(1.1);
    z-index: 5;
  }
</style>
