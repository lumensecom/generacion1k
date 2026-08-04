'use client';

import { ExplainerFrame } from './ExplainerFrame';
import { DropiFlow } from './DropiFlow';
import { ShopifyStoreBuild } from './ShopifyStoreBuild';
import { PixelEventsFlow } from './PixelEventsFlow';
import { AdsStructureBuild } from './AdsStructureBuild';
import type { ToolExplainerId } from '@/lib/modules-content';

const CONFIG: Record<ToolExplainerId, { chromeLabel: string; steps: { label: string }[] }> = {
  'dropi-flow': {
    chromeLabel: 'dropi.co · de la compra a tu wallet',
    steps: [
      { label: 'Cliente compra' },
      { label: 'Orden entra a Dropi' },
      { label: 'Proveedor prepara' },
      { label: 'Transportadora recoge' },
      { label: 'Cliente recibe y paga' },
      { label: 'Tu ganancia llega al wallet' },
    ],
  },
  'shopify-setup': {
    chromeLabel: 'tutienda.myshopify.com',
    steps: [
      { label: 'Tienda vacía' },
      { label: 'Tema Horizon instalado' },
      { label: 'Moneda en COP' },
      { label: 'Checkout PCE en 1 paso' },
      { label: 'ReleaseIt COD instalado' },
      { label: 'Producto publicado' },
    ],
  },
  'pixel-events': {
    chromeLabel: 'Meta Pixel + TikTok Pixel · eventos en vivo',
    steps: [
      { label: 'PageView' },
      { label: 'ViewContent' },
      { label: 'AddToCart' },
      { label: 'InitiateCheckout' },
      { label: 'Purchase' },
    ],
  },
  'ads-structure': {
    chromeLabel: 'TikTok Ads Manager · estructura de campaña',
    steps: [
      { label: 'Objetivo: Purchase' },
      { label: 'Ad Group Broad Colombia' },
      { label: '3–5 creativos' },
      { label: 'Presupuesto $50.000/día' },
      { label: '72 horas sin tocar' },
    ],
  },
};

export function ToolExplainer({ tool, accentColor }: { tool: ToolExplainerId; accentColor: string }) {
  const config = CONFIG[tool];

  return (
    <ExplainerFrame chromeLabel={config.chromeLabel} accentColor={accentColor} steps={config.steps}>
      {(active) => {
        switch (tool) {
          case 'dropi-flow':
            return <DropiFlow activeStep={active} accentColor={accentColor} />;
          case 'shopify-setup':
            return <ShopifyStoreBuild activeStep={active} accentColor={accentColor} />;
          case 'pixel-events':
            return <PixelEventsFlow activeStep={active} accentColor={accentColor} />;
          case 'ads-structure':
            return <AdsStructureBuild activeStep={active} accentColor={accentColor} />;
          default:
            return null;
        }
      }}
    </ExplainerFrame>
  );
}
