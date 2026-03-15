"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useRequirePerm } from "@/hooks/useRequirePerm";


export default function LeadsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">Leads</h1>
            <Card>
                <CardContent className="pt-6">
                    <p>En construcción...</p>
                </CardContent>
            </Card>
        </div>
    );
}