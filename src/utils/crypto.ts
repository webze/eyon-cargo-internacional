/**
 * ============================================================================
 * MÓDULO DE SEGURIDAD Y CRIPTOGRAFÍA - EYON CARGO INTERNACIONAL
 * ============================================================================
 * @file src/utils/crypto.ts
 * @description
 * Proporciona hashing nativo de contraseñas mediante la Web Crypto API (SHA-256).
 * No expone contraseñas en texto plano ni requiere librerías externas pesadas.
 * 
 * ¿Cómo modificar en el futuro?
 * Si deseas cambiar la sal de seguridad (salt) o el algoritmo (ej: a SHA-512),
 * puedes modificar la constante `SALT_PREFIX` o el tipo de digest en este archivo.
 * ============================================================================
 */

/** Sal fija de protección para evitar ataques de tablas arcoíris */
const SALT_PREFIX = 'eyon_cargo_secure_salt_v1_';

/**
 * Genera un hash SHA-256 en formato Hexadecimal para una contraseña en texto plano.
 *
 * @param password - La contraseña ingresada por el usuario en el formulario.
 * @returns Promise<string> - Representación hash hexadecimal de 64 caracteres.
 *
 * @example
 * const hash = await hashPassword('miClave123');
 * console.log(hash); // 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${SALT_PREFIX}${password}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
