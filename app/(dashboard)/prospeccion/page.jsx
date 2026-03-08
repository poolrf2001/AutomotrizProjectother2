"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useRequirePerm } from "@/hooks/useRequirePerm";


import FrecuenciaTab from "@/app/components/configuracion/FrecuenciaTab";

export default function ProspeccionPage() {

    useRequirePerm("prospeccion", "view");

    return (
        <div className="space-y-6">

            <h1 className="text-2xl font-semibold">Configuración del sistema</h1>

            <Tabs defaultValue="recordatorio">

                <TabsList className="grid grid-cols-2 md:grid-cols-10 w-full">

                    <TabsTrigger value="recordatorio">Recordatorio</TabsTrigger>

                </TabsList>

                <TabsContent value="recordatorio">
                    <Card>
                        <CardContent className="pt-6">
                            <FrecuenciaTab />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>


        </div>
    );
}
