// Composable: Gestió centralitzada de l'estat d'autenticació (patró Singleton).
import { ref } from 'vue';

const usuari = ref(null);

// Hidratació inicial de l'estat des de l'emmagatzematge local persistit.
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
