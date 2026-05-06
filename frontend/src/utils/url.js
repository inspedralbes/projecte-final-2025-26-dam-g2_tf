/**
 * Utilitat per netejar i normalitzar les URLs de les imatges.
 * Substitueix localhost per la URL de producció si cal i assegura que els espais estiguin codificats.
 */
export function netejarUrl(url) {
  if (!url) return '';

  const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const API_URL = (import.meta.env && import.meta.env.VITE_API_URL) || (isLocalhost ? 'http://localhost:8088' : 'https://north.dam.inspedralbes.cat');

  let cleanUrl = url;

  if (isLocalhost && (!import.meta.env || !import.meta.env.VITE_API_URL)) {
    // Si estem en localhost, reescrivim qualsevol URL de producció a localhost perquè ens carreguin les fotos locals
    cleanUrl = url.replace(/https:\/\/north\.dam\.inspedralbes\.cat/g, 'http://localhost:8088');
    cleanUrl = cleanUrl.replace(/http:\/\/localhost:\d+/g, 'http://localhost:8088');
  } else {
    // 1. Substituir localhost per la API_URL si es troba a la cadena
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
