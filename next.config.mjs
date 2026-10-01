/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  webpack(config) {
    // Las landings de referencia viven como .liquid de verdad en
    // lib/landings-referencia/, no como strings dentro de un .ts. Así se
    // pegan tal cual salieron de Shopify, el editor las colorea bien y meter
    // una nueva es soltar el archivo. Esta regla las importa como texto.
    config.module.rules.push({
      test: /\.liquid$/,
      type: 'asset/source',
    });
    return config;
  },
};

export default nextConfig;
