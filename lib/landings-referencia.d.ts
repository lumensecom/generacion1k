// Las landings de referencia se importan como texto plano (ver la regla de
// webpack en next.config.mjs).
declare module '*.liquid' {
  const contenido: string;
  export default contenido;
}
