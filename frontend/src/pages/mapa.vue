<template>
  <div class="relative w-full h-[calc(100vh-80px)] overflow-hidden">
    
    <div v-if="cargando" class="absolute inset-0 z-[2000] flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
      <div class="w-12 h-12 border-4 border-[#9f6795] border-t-transparent rounded-full animate-spin mb-4"></div>
      <p class="text-[#402749] font-bold animate-pulse text-lg">Carregant mapa...</p>
    </div>
    
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
import { onMounted, ref, nextTick, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const router = useRouter();
const BCN_CENTRE = [41.3871, 2.1701];
const laMevaPosicio = ref(BCN_CENTRE);
const cargando = ref(true); 
let mapa = null;

const API_URL = import.meta.env.VITE_API_URL || 'https://north.dam.inspedralbes.cat';

onMounted(async () => {
  window.anarADetall = (id) => router.push(`/lloc/${id}`);

  await nextTick();

  iniciarMapa(BCN_CENTRE[0], BCN_CENTRE[1]);

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      laMevaPosicio.value = [latitude, longitude];
      
      if (mapa && typeof mapa.remove === 'function') {
        try {
          mapa.setView([latitude, longitude], 15);
          L.circleMarker([latitude, longitude], { 
            color: '#3b82f6', 
            radius: 10,
            fillOpacity: 0.8 
          }).addTo(mapa).bindPopup("<b>Ets aquí</b>");
        } catch (e) {
          console.warn("Leaflet error in geolocation callback (safe to ignore):", e);
        }
      }
      cargando.value = false; 
    },
    (error) => {
      console.warn("GPS denegat:", error);
      cargando.value = false; 
    }
  );
});

onUnmounted(() => {
  delete window.anarADetall;
  if (mapa) {
    try {
      mapa.remove();
    } catch (e) {
      console.warn("Error removing map:", e);
    }
    mapa = null;
  }
});

async function iniciarMapa(lat, lng) {
  if (mapa) return;

  mapa = L.map('map', { zoomControl: false }).setView([lat, lng], 15);
  L.control.zoom({ position: 'bottomright' }).addTo(mapa);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapa);

  await carregarPuntsDeLaBD();
}

async function carregarPuntsDeLaBD() {
  try {
    const resposta = await fetch(`${API_URL}/api/mapa/punts`);
    const llocs = await resposta.json();
    
    llocs.forEach(lloc => {
      const [lng, lat] = lloc.ubicacio.coordinates;
      
      const popupContent = `
        <div class="custom-popup p-1">
          <img 
            src="${lloc.imatge_referencia || 'https://via.placeholder.com/150'}" 
            class="w-full h-24 object-cover rounded-md mb-2" 
          />
          <h3 class="text-base font-bold text-[#402749] mb-1">${lloc.nom}</h3>
          
          <p class="text-[10px] font-bold text-[#9f6795] uppercase mb-1">
            ${lloc.tags ? lloc.tags.join(' • ') : ''}
          </p>
          
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
  } catch (e) {
    console.error("Error BD:", e);
  }
}

function tornarACasa() {
  if (mapa) mapa.flyTo(laMevaPosicio.value, 16);
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