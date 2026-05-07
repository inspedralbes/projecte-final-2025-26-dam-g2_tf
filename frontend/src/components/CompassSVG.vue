<template>
  <svg 
    :width="size" 
    :height="size" 
    viewBox="0 0 300 300" 
    class="compass-svg"
  >
    <defs>
      <filter id="softShadow">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.2"/>
      </filter>
    </defs>

    <circle cx="150" cy="150" r="140" fill="none" stroke="#ffffff" stroke-width="0.5" opacity="0.3" />
    <circle cx="150" cy="150" r="135" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.8" />
    
    <circle cx="150" cy="150" r="120" fill="none" stroke="#ffffff" stroke-width="1.5" />
    
    <g v-for="i in 72" :key="`tick-${i}`" :transform="`rotate(${i * 5} 150 150)`">
      <line 
        x1="150" 
        y1="30" 
        x2="150" 
        :y2="i % 6 === 0 ? '40' : (i % 2 === 0 ? '35' : '33')" 
        stroke="#ffffff" 
        :stroke-width="i % 6 === 0 ? '2' : '1'" 
      />
    </g>

    <g font-family="'Times New Roman', serif" font-size="14" fill="#ffffff" font-weight="bold">
      <text x="150" y="25" text-anchor="middle">0°</text>
      <text x="245" y="155" text-anchor="middle">90°</text>
      <text x="150" y="280" text-anchor="middle">180°</text>
      <text x="60" y="155" text-anchor="middle">270°</text>
    </g>

    <g>
      <circle v-for="i in 8" :key="`dot-outer-${i}`" 
        :cx="150 + 100 * Math.cos((i * 45 - 90) * Math.PI / 180)" 
        :cy="150 + 100 * Math.sin((i * 45 - 90) * Math.PI / 180)" 
        r="2.5" 
        fill="#ffffff" 
      />
      <circle v-for="i in 8" :key="`dot-inner-${i}`" 
        :cx="150 + 75 * Math.cos((i * 45 - 67.5) * Math.PI / 180)" 
        :cy="150 + 75 * Math.sin((i * 45 - 67.5) * Math.PI / 180)" 
        r="1.5" 
        fill="#e0e0e0" 
        opacity="0.6"
      />
    </g>

    <circle cx="150" cy="150" r="100" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.7" />
    <circle cx="150" cy="150" r="95" fill="none" stroke="#ffffff" stroke-width="0.5" opacity="0.4" />

    <g class="compass-rose-rotating" :class="{ 'spinning': isSpinning }">
      
      <g>
        <path d="M 150 150 L 145 60 L 150 30 L 155 60 Z" fill="#ffffff" stroke="#ffffff" stroke-width="1.5" />
        <line x1="148" y1="150" x2="148" y2="40" stroke="#d0d0d0" stroke-width="0.5" />
        <line x1="150" y1="150" x2="150" y2="35" stroke="#ffffff" stroke-width="1" />
        <line x1="152" y1="150" x2="152" y2="40" stroke="#d0d0d0" stroke-width="0.5" />
        <text x="150" y="25" text-anchor="middle" font-size="18" font-weight="bold" fill="#ffffff" font-family="'Times New Roman', serif">N</text>
      </g>

      <g>
        <path d="M 150 150 L 145 240 L 150 270 L 155 240 Z" fill="none" stroke="#ffffff" stroke-width="1.5" />
        <line x1="150" y1="150" x2="150" y2="265" stroke="#ffffff" stroke-width="0.8" />
        <text x="150" y="292" text-anchor="middle" font-size="18" font-weight="bold" fill="#ffffff" font-family="'Times New Roman', serif">S</text>
      </g>

      <g>
        <path d="M 150 150 L 240 145 L 270 150 L 240 155 Z" fill="#ffffff" stroke="#ffffff" stroke-width="1.5" opacity="0.9" />
        <text x="285" y="155" text-anchor="middle" font-size="18" font-weight="bold" fill="#ffffff" font-family="'Times New Roman', serif">E</text>
      </g>

      <g>
        <path d="M 150 150 L 60 145 L 30 150 L 60 155 Z" fill="none" stroke="#ffffff" stroke-width="1.5" />
        <text x="18" y="155" text-anchor="middle" font-size="18" font-weight="bold" fill="#ffffff" font-family="'Times New Roman', serif">W</text>
      </g>

      <g v-for="angle in [45, 135, 225, 315]" :key="`sec-${angle}`" :transform="`rotate(${angle} 150 150)`">
        <path d="M 150 150 L 147 80 L 150 65 L 153 80 Z" fill="none" stroke="#ffffff" stroke-width="1" />
        <line x1="150" y1="150" x2="150" y2="70" stroke="#ffffff" stroke-width="0.6" opacity="0.5" />
      </g>

      <g v-for="i in 16" :key="`mini-star-${i}`" :transform="`rotate(${i * 22.5} 150 150)`">
        <path d="M 150 150 L 149 135 L 150 130 L 151 135 Z" fill="#ffffff" opacity="0.5" />
      </g>
    </g>

    <circle cx="150" cy="150" r="12" fill="none" stroke="#ffffff" stroke-width="2" />
    <circle cx="150" cy="150" r="8" fill="#ffffff" opacity="0.8" />
    <circle cx="150" cy="150" r="4" fill="none" stroke="#ffffff" />
    <circle cx="150" cy="150" r="2" fill="#ffffff" />
  </svg>
</template>

<script setup>
const props = defineProps({
  size: { type: Number, default: 300 },
  isSpinning: { type: Boolean, default: false }
});
</script>

<style scoped>
.compass-svg {
  filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.3));
}

.compass-rose-rotating {
  transform-origin: 150px 150px;
  transition: transform 0.3s ease-out;
}

.compass-rose-rotating.spinning {
  animation: searchNorth 2.5s ease-in-out forwards;
}

@keyframes searchNorth {
  0% { transform: rotate(0deg); }
  30% { transform: rotate(300deg); }
  60% { transform: rotate(720deg); }
  75% { transform: rotate(735deg); }
  85% { transform: rotate(715deg); }
  92% { transform: rotate(725deg); }
  100% { transform: rotate(720deg); }
}
</style>
