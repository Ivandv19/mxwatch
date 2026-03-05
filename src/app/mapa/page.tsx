import MapSidebar from "@/components/MapSidebar";
import MapCanvas from "@/components/MapCanvas";

export default function MapaPage() {
    return (
        <div className="flex flex-col md:flex-row h-[calc(100dvh-64px)] w-full overflow-hidden bg-[#080c12]">
            <MapSidebar />
            <MapCanvas />
        </div>
    );
}
