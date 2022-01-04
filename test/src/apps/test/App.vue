<template>
  <div class="test-build-app">
    This is just testing that webpack is processing vue SFC's.
    <ul>
      <li v-for="item in items" :key="item">
        {{ item }}
      </li>
    </ul>
    <AppComponent />
  </div>
</template>

<script>
  import AppComponent from "./AppComponent.vue"; // intentionally not having extension to test resolve
  import data from "./data.yaml";

  export default {
    name: 'App',
    components : {
      AppComponent
    },
    data() {
      return data;
    }
  }
</script>

<style lang="scss">
  // @import "~@Scss/vars";
  .test-build-app {
    color: teal;
  }
</style>