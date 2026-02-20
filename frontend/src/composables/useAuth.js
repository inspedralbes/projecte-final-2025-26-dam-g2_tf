// useAuth.js — Composable compartit per a l'autenticació
// L'estat es defineix FORA de la funció perquè sigui global (singleton)
import { ref } from 'vue';

// Estat reactiu global — compartit entre tots els components que importin useAuth
const usuari = ref(null);

// Inicialitzar des de localStorage (només la primera vegada)
try {
    const guardat = localStorage.getItem('usuari');
    if (guardat) {
        usuari.value = JSON.parse(guardat);
    }
} catch (e) {
    console.error("Error llegint usuari de localStorage:", e);
    localStorage.removeItem('usuari');
}

export function useAuth() {
    function login(dadesUsuari) {
        usuari.value = dadesUsuari;
        localStorage.setItem('usuari', JSON.stringify(dadesUsuari));
    }

    function logout() {
        usuari.value = null;
        localStorage.removeItem('usuari');
    }

    return { usuari, login, logout };
}
