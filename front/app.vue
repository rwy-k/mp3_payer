<script setup lang="ts">
const route = useRoute();
console.log(route);

</script>

<template>
   <header>
    <nav class="w-full">
      <div class="flex items-center justify-evenly p-2">
        <NuxtLink 
          to="/" 
          class="border-blue-200 border-2 py-2 px-24 rounded-2xl"
          :class="{ 'bg-blue-200': route.path === '/' }"
        >
          Home
        </NuxtLink>
        <NuxtLink 
          to="/tracks" 
          class="border-blue-200 border-2 py-2 px-24 rounded-2xl"
          :class="{ 'bg-blue-200': route.path === '/tracks' }"
        >
          Tracks
        </NuxtLink>
        <!-- <li><NuxtLink to="/posts/2">Post 2</NuxtLink></li> -->
      </div>
    </nav>
  </header>
  <main>
    <NuxtPage />
  </main>
  <footer>
    <p>&copy; 2023 My Music App</p>
  </footer>
</template>
