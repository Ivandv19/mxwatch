import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface MapState {
    // State
    searchQuery: string;
    selectedCartel: string | null;
    selectedState: string | null;

    // Actions
    setSearchQuery: (query: string) => void;
    setSelectedCartel: (id: string | null) => void;
    toggleCartel: (id: string) => void;
    setSelectedState: (name: string | null) => void;

    // Computed / Helpers (opcional)
    resetAll: () => void;
}

export const useMapStore = create<MapState>()(
    devtools(
        (set, get) => ({
            // Estado inicial
            searchQuery: "",
            selectedCartel: null,
            selectedState: null,

            // Actions
            setSearchQuery: (query) =>
                set({ searchQuery: query }, false, "map/setSearchQuery"),

            setSelectedCartel: (id) =>
                set({ selectedCartel: id }, false, "map/setSelectedCartel"),

            toggleCartel: (id) => {
                const { selectedCartel } = get();
                set({
                    selectedCartel: selectedCartel === id ? null : id
                }, false, "map/toggleCartel");
            },

            setSelectedState: (name) =>
                set({ selectedState: name }, false, "map/setSelectedState"),

            // Helper útil - resetea todo
            resetAll: () =>
                set({
                    searchQuery: "",
                    selectedCartel: null,
                    selectedState: null
                }, false, "map/resetAll"),
        }),
        {
            name: "MapStore", // Nombre para las devtools
            enabled: process.env.NODE_ENV === 'development' // Solo en desarrollo
        }
    )
);

// Selectores optimizados
export const useSearchQuery = () => useMapStore((state) => state.searchQuery);
export const useSelectedCartel = () => useMapStore((state) => state.selectedCartel);
export const useSelectedState = () => useMapStore((state) => state.selectedState);

// Acciones individuales para evitar recrear objetos innecesarios
export const useMapActions = () => {
    const setSearchQuery = useMapStore((state) => state.setSearchQuery);
    const setSelectedCartel = useMapStore((state) => state.setSelectedCartel);
    const toggleCartel = useMapStore((state) => state.toggleCartel);
    const setSelectedState = useMapStore((state) => state.setSelectedState);
    const resetAll = useMapStore((state) => state.resetAll);

    return {
        setSearchQuery,
        setSelectedCartel,
        toggleCartel,
        setSelectedState,
        resetAll,
    };
};
