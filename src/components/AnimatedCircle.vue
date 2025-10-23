<script setup lang="ts">
</script>

<template>
  <div class="absolute inset-0 z-10 pointer-events-none circle-hover-group">
    <svg class="w-full h-full animate-spin-slow circle-svg" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="graygradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#e5e7eb"/>
          <stop offset="50%" stop-color="#a3a3a3"/>
          <stop offset="100%" stop-color="#525252"/>
        </linearGradient>
      </defs>
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        stroke="url(#graygradient)"
        stroke-width="2"
        stroke-dasharray="2 9.78"
        stroke-linecap="round"
        class="circle-stroke"
      />
    </svg>
  </div>
</template>
