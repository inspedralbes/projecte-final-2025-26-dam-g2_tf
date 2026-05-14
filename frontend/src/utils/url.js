export const isCapacitor = typeof window !== 'undefined' && (!!window.Capacitor || window.location.protocol === 'capacitor:');

export const BASE_API_URL = import.meta.env.VITE_API_URL || 
  (isCapacitor 
    ? 'https://north.dam.inspedralbes.cat' 
    : (window.location.hostname === 'north.dam.inspedralbes.cat' 
        ? 'https://north.dam.inspedralbes.cat' 
        : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:8088'
            : `http://${window.location.hostname}:8088`)));

export function netejarUrl(url) {
  if (!url) return '';

  const API_URL = BASE_API_URL;

  let cleanUrl = url;

  if ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && !window.Capacitor && (!import.meta.env || !import.meta.env.VITE_API_URL)) {
    // Si estem en localhost (Web), reescrivim qualsevol URL de producció a localhost perquè ens carreguin les fotos locals
    cleanUrl = url.replace(/https:\/\/north\.dam\.inspedralbes\.cat/g, 'http://localhost:8088');
    cleanUrl = cleanUrl.replace(/http:\/\/localhost:\d+/g, 'http://localhost:8088');
  } else {
    // 1. Substituir qualsevol referència a localhost per la BASE_API_URL correcta (Producció si estem en mòbil)
    cleanUrl = url.replace(/http:\/\/localhost:\d+/g, API_URL);
  }

  // 2. Si la URL és relativa (comença per /), afegir el prefix de la API_URL
  if (cleanUrl.startsWith('/') && !cleanUrl.startsWith('//')) {
    cleanUrl = API_URL + cleanUrl;
  }

  // 3. Codificar espais i caràcters especials (però no la URL sencera per no trencar http://)
  // Només codifiquem la part del camí
  try {
    const urlObj = new URL(cleanUrl);
    return urlObj.toString();
  } catch (e) {
    // Si no és una URL vàlida (ex: només un path), codifiquem espais manualment
    return cleanUrl.replace(/ /g, '%20');
  }
}
