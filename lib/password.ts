import 'server-only';
import { scrypt, randomBytes, timingSafeEqual, type ScryptOptions } from 'node:crypto';

// Hash de contraseñas con scrypt, que viene en Node — sin dependencias.
//
// scrypt es deliberadamente lento y usa mucha memoria, que es justo lo que
// hace caro un ataque por fuerza bruta contra la tabla de estudiantes si
// algún día se filtra. Estos parámetros tardan ~100 ms por verificación en
// el runtime de Vercel: imperceptible al entrar, carísimo para probar
// millones de claves.
//
// Formato guardado:  scrypt$N$r$p$saltHex$hashHex
// Guardar los parámetros junto al hash permite subirlos en el futuro sin
// invalidar las contraseñas ya creadas.

// promisify() pierde la sobrecarga de scrypt que acepta opciones, así que se
// envuelve a mano para poder pasar N/r/p.
function scryptAsync(clave: string | Buffer, salt: Buffer, longitud: number, opciones: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(clave, salt, longitud, opciones, (err, derivada) => (err ? reject(err) : resolve(derivada)));
  });
}

const N = 16384; // coste de CPU/memoria
const r = 8;
const p = 1;
const LONGITUD = 32;

export const MIN_PASSWORD = 8;

export async function hashPassword(plano: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scryptAsync(plano.normalize("NFKC"), salt, LONGITUD, { N, r, p });
  return `scrypt$${N}$${r}$${p}$${salt.toString('hex')}$${hash.toString('hex')}`;
}

export async function verifyPassword(plano: string, guardado: string | null): Promise<boolean> {
  if (!guardado) return false;

  const partes = guardado.split('$');
  if (partes.length !== 6 || partes[0] !== 'scrypt') return false;

  const [, nStr, rStr, pStr, saltHex, hashHex] = partes;
  const params = { N: Number(nStr), r: Number(rStr), p: Number(pStr) };
  if (!Number.isFinite(params.N) || !Number.isFinite(params.r) || !Number.isFinite(params.p)) return false;

  const esperado = Buffer.from(hashHex, 'hex');
  let calculado: Buffer;
  try {
    calculado = await scryptAsync(plano.normalize("NFKC"), Buffer.from(saltHex, "hex"), esperado.length, params);
  } catch {
    return false;
  }

  // timingSafeEqual revienta si las longitudes difieren, y esa excepción ya
  // filtraría información; se compara la longitud antes, que no es secreta.
  if (calculado.length !== esperado.length) return false;
  return timingSafeEqual(calculado, esperado);
}

/**
 * Contraseña legible para entregarle al estudiante por WhatsApp.
 * Sin caracteres que se confundan al dictarla (0/O, 1/l/I).
 */
export function generarPassword(): string {
  const abc = 'abcdefghjkmnpqrstuvwxyz';
  const num = '23456789';
  const bytes = randomBytes(10);
  const letras = [...bytes.subarray(0, 6)].map((b) => abc[b % abc.length]).join('');
  const digitos = [...bytes.subarray(6, 10)].map((b) => num[b % num.length]).join('');
  return `${letras}${digitos}`;
}
