import { Suspense } from "react";
import MapSidebar from "@/components/MapSidebar";
import MapCanvas from "@/components/MapCanvas";

export default function MapaPage() {
    return (
        <div className="flex flex-col md:flex-row h-[calc(100dvh-64px)] w-full overflow-hidden bg-[#080c12]">
            <Suspense fallback={<div className="w-full md:w-[380px] bg-[#0f1520] shrink-0" />}>
                <MapSidebar />
            </Suspense>
            <MapCanvas />
        </div>
    );
}
