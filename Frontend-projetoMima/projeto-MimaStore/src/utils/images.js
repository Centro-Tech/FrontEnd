/**
 * Utilitário para normalizar URLs de imagens
 * Garante que imagens do S3 sejam acessadas com URL completa
 */

const S3_BASE = import.meta.env.VITE_S3_BUCKET_URL || 'https://mmmimastore-bucket-raw-2025.s3.us-east-1.amazonaws.com';

/**
 * Converte um path relativo ou URL em uma URL completa do S3
 * @param {string} pathOrUrl - Path relativo (/uploads/foto.jpg) ou URL completa
 * @returns {string} URL completa da imagem ou string vazia
 */
export function getImageUrl(pathOrUrl) {
  if (!pathOrUrl) return '';
  
  // Se já é uma URL completa, retorna como está
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl;
  }
  
  // Remove leading slash para evitar duplicação
  const cleanPath = pathOrUrl.startsWith('/') ? pathOrUrl.slice(1) : pathOrUrl;
  
  return `${S3_BASE}/${cleanPath}`;
}

/**
 * Retorna a URL base do S3 configurada
 * @returns {string} URL base do bucket S3
 */
export function getS3BaseUrl() {
  return S3_BASE;
}
