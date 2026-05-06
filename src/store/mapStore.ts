/**
 * Store de Zustand para gestión de estado interactivo del mapa.
 * Maneja selección de entidades, búsqueda y datos de presencia territorial.
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { LiveStatePresence } from "@/types/api.types";

interface MapState {
	// Estado
	searchQuery: string;
	selectedCartel: string | null;
	selectedState: string | null;
	liveStateData: LiveStatePresence[];

	// Acciones
	setSearchQuery: (query: string) => void;
	setSelectedCartel: (id: string | null) => void;
	toggleCartel: (id: string) => void;
	setSelectedState: (name: string | null) => void;
	setLiveStateData: (data: LiveStatePresence[]) => void;
	resetAll: () => void;
}

export const useMapStore = create<MapState>()(
	devtools(
		(set, get) => ({
			// Estado inicial
			searchQuery: "",
			selectedCartel: null,
			selectedState: null,
			liveStateData: [],

			// Acciones
			setLiveStateData: (data) =>
				set({ liveStateData: data }, false, "map/setLiveStateData"),

			setSearchQuery: (query) =>
				set({ searchQuery: query }, false, "map/setSearchQuery"),

			setSelectedCartel: (id) =>
				set({ selectedCartel: id }, false, "map/setSelectedCartel"),

			toggleCartel: (id) => {
				const { selectedCartel } = get();
				set(
					{
						selectedCartel: selectedCartel === id ? null : id,
					},
					false,
					"map/toggleCartel",
				);
			},

			setSelectedState: (name) =>
				set({ selectedState: name }, false, "map/setSelectedState"),

			resetAll: () =>
				set(
					{
						searchQuery: "",
						selectedCartel: null,
						selectedState: null,
					},
					false,
					"map/resetAll",
				),
		}),
		{
			name: "MapStore",
			enabled: process.env.NODE_ENV === "development",
		},
	),
);

// Selectores optimizados para evitar re-renders innecesarios
export const useSearchQuery = () => useMapStore((state) => state.searchQuery);
export const useSelectedCartel = () =>
	useMapStore((state) => state.selectedCartel);
export const useSelectedState = () =>
	useMapStore((state) => state.selectedState);
export const useLiveStateData = () =>
	useMapStore((state) => state.liveStateData);

// Hook personalizado para acciones con igualdad referencial estable
export const useMapActions = () => {
	const setSearchQuery = useMapStore((state) => state.setSearchQuery);
	const setSelectedCartel = useMapStore((state) => state.setSelectedCartel);
	const toggleCartel = useMapStore((state) => state.toggleCartel);
	const setSelectedState = useMapStore((state) => state.setSelectedState);
	const setLiveStateData = useMapStore((state) => state.setLiveStateData);
	const resetAll = useMapStore((state) => state.resetAll);

	return {
		setSearchQuery,
		setSelectedCartel,
		toggleCartel,
		setSelectedState,
		setLiveStateData,
		resetAll,
	};
};
