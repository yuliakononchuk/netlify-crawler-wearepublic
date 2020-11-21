<template>
  <div id="app">
      <Header msg="Finally a digestible list of WeArePublic events!" />
      <EventGrid v-bind:events="events" />
  </div>
</template>

<script>
import Header from "./components/Header";
import EventGrid from "./components/EventGrid.vue";
import { parseData } from "./helpers";
import data from "../data.json";

export default {
  name: "app",
  data: function() {
    return {
      data: data.data
    };
  },
  computed: {
    events: function() {
      return parseData(this.data);
    }
  },
  components: {
    Header,
    EventGrid
  }
};
</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Gochi+Hand|IBM+Plex+Sans|Nunito+Sans|Rubik|Work+Sans&display=swap');
#app {
  font-family: 'Rubik', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: white;
}
* {
  margin: 0;
  padding: 0;
  border: 0;
  outline: 0;
  font-size: 100%;
  vertical-align: baseline;
  background: transparent;
  background-color: #FFEE90;
}
</style>
