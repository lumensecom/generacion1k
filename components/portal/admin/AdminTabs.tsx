'use client';

import type { ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function AdminTabs({
  resumen,
  estudiantes,
  ayuda,
  clases,
  modulos,
  configuracion,
}: {
  resumen: ReactNode;
  estudiantes: ReactNode;
  ayuda: ReactNode;
  clases: ReactNode;
  modulos: ReactNode;
  configuracion: ReactNode;
}) {
  return (
    <Tabs defaultValue="resumen">
      <TabsList className="mb-8 flex-wrap">
        <TabsTrigger value="resumen">Resumen</TabsTrigger>
        <TabsTrigger value="estudiantes">Estudiantes</TabsTrigger>
        <TabsTrigger value="ayuda">Ayuda</TabsTrigger>
        <TabsTrigger value="clases">Clases</TabsTrigger>
        <TabsTrigger value="modulos">Módulos</TabsTrigger>
        <TabsTrigger value="config">Configuración</TabsTrigger>
      </TabsList>

      <TabsContent value="resumen">{resumen}</TabsContent>
      <TabsContent value="estudiantes">{estudiantes}</TabsContent>
      <TabsContent value="ayuda">{ayuda}</TabsContent>
      <TabsContent value="clases">{clases}</TabsContent>
      <TabsContent value="modulos">{modulos}</TabsContent>
      <TabsContent value="config">{configuracion}</TabsContent>
    </Tabs>
  );
}
