/**
 * Utilitat per netejar i normalitzar les URLs de les imatges.
 * Substitueix localhost per la URL de producció si cal i assegura que els espais estiguin codificats.
 */
export function netejarUrl(url) {
  if (!url) return '';
  
  const API_URL = import.meta.env.VITE_API_URL || 'https://north.dam.inspedralbes.cat';
  
  // 1. Substituir localhost per la API_URL si es troba a la cadena
  let cleanUrl = url.replace(/http:\/\/localhost:\d+/g, API_URL);
  
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
