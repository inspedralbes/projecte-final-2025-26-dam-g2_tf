<template>
  <div class="relative w-full h-[calc(100vh-80px)] overflow-hidden">
    <div id="map" class="w-full h-full z-10"></div>

    <button 
      @click="tornarACasa" 
      class="absolute top-5 right-5 z-[1000] bg-[#402749] text-white px-5 py-3 rounded-full font-bold shadow-lg hover:bg-[#5a3766] transition-colors active:scale-95"
    >
      Tornar a la meva posició
    </button>
  </div>
</template>

<script setup>
import { onMounted, ref,nextTick,onUnmounted} from 'vue';
import { useRouter } from 'vue-router';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const router = useRouter();
const BCN_CENTRE = [41.3871, 2.1701];
let mapa = null;
const laMevaPosicio = ref(BCN_CENTRE);

onMounted(() => {
  window.anarADetall = (id) => {
    router.push(`/lloc/${id}`);
  };
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      laMevaPosicio.value = [lat, lng];

      await nextTick(); 
      iniciarMapa(lat, lng);
    },
    async () => {
      await nextTick();
      iniciarMapa(BCN_CENTRE[0], BCN_CENTRE[1]);
    }
  );
});
onUnmounted(() => {
  delete window.anarADetall;
});

async function iniciarMapa(lat, lng) {
  if (mapa) return;

  mapa = L.map('map', { zoomControl: false }).setView([lat, lng], 15);
  
  L.control.zoom({ position: 'bottomright' }).addTo(mapa);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapa);

  L.circleMarker([lat, lng], {
    color: '#3b82f6',
    fillColor: '#3b82f6',
    fillOpacity: 0.8,
    radius: 10
  }).addTo(mapa).bindPopup("<b>Ets aquí</b>");

  carregarPuntsDeLaBD();
}

async function carregarPuntsDeLaBD() {
  try {
    const resposta = await fetch('http://localhost:8088/api/mapa/punts');
    const llocs = await resposta.json();
    llocs.forEach(lloc => {
      const lng = lloc.ubicacio.coordinates[0];
      const lat = lloc.ubicacio.coordinates[1];

      const popupContent = `
        <div class="custom-popup p-1">
          <img src="${lloc.imatge_referencia || 'https://via.placeholder.com/150'}" class="w-full h-24 object-cover rounded-md mb-2" />
          <h3 class="text-base font-bold text-[#402749] mb-1">${lloc.nom}</h3>
          <p class="text-[10px] font-bold text-[#9f6795] uppercase mb-1">${lloc.tags ? lloc.tags.join(' • ') : ''}</p>
          
          <div class="bg-[#fdf6ff] p-2 rounded-md text-[11px] mb-2 border border-[#f0e0f5]">
            <span><b>Dificultat:</b> ${lloc.dificultat || 'N/A'}</span>
          </div>

          <button 
            onclick="anarADetall('${lloc._id}')" 
            class="w-full bg-[#9f6795] text-white py-2 rounded-md font-bold text-sm hover:bg-[#8a5982] transition-colors"
          >
            Més info
          </button>
        </div>
      `;

      L.marker([lat, lng]).addTo(mapa).bindPopup(popupContent);
    });
  } catch (error) {
    console.error("Error connectant amb el backend:", error);
  }
}

function tornarACasa() {
  if (mapa) {
    mapa.flyTo(laMevaPosicio.value, 16);
  }
}
</script>

<style>
.leaflet-popup-content-wrapper {
  border-radius: 12px;
}
.custom-popup {
  width: 180px;
}
</style>