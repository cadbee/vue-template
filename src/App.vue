<template>
  <v-app>
    <v-main>
      <v-layout class="h-screen d-flex flex-column" :fluid="true">
        <nav class="ma-3 pa-0 h-auto">
          <router-link to="/">Home</router-link> |
          <router-link to="/about">About</router-link>
        </nav>
        <router-view />
      </v-layout>
    </v-main>
  </v-app>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}

/* Custom scrollbar for Chrome, Edge, Safari and Opera */
/* Turn on custom 8px wide scrollbar */
::-webkit-scrollbar {
  width: 8px; /* 1px wider than Lion. */
  /* This is more usable for users trying to click it. */
  background-color: rgba(0,0,0,0);
  -webkit-border-radius: 100px;
  //display: none;
}
/* hover effect for both scrollbar area, and scrollbar 'thumb' */
::-webkit-scrollbar:hover {
  background-color: rgba(0, 0, 0, 0.09);
}

/* The scrollbar 'thumb' ...that marque oval shape in a scrollbar */
::-webkit-scrollbar-thumb:vertical {
  /* This is the EXACT color of Mac OS scrollbars.
     Yes, I pulled out digital color meter */
  background: rgba(0, 0, 0, 0.16);
  -webkit-border-radius: 100px;
  //visibility: hidden;
}
::-webkit-scrollbar-thumb:vertical:active {
  background: rgba(0, 0, 0, 0.12); /* Some darker color when you click it */
  -webkit-border-radius: 100px;
}

div:hover::-webkit-scrollbar-thumb:vertical {
  //visibility: visible;
}
div:hover::-webkit-scrollbar {
  //display: block;
}
</style>

<script setup>
</script>
