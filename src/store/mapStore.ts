import { create } from "zustand";

interface MapState {
    searchQuery: string;
    setSearchQuery: (query: string) => void;

    selectedCartel: string | null;
    setSelectedCartel: (id: string | null) => void;
    toggleCartel: (id: string) => void;

    selectedState: string | null;
    setSelectedState: (name: string | null) => void;
}

export const useMapStore = create<MapState>((set, get) => ({
    searchQuery: "",
    setSearchQuery: (query) => set({ searchQuery: query }),

    selectedCartel: null,
    setSelectedCartel: (id) => set({ selectedCartel: id }),
    toggleCartel: (id) =>
        set({ selectedCartel: get().selectedCartel === id ? null : id }),

    selectedState: null,
    setSelectedState: (name) => set({ selectedState: name }),
}));

