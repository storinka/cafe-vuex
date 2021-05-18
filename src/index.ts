interface FullCafe {
    id: number;
    hash_id: string;

    domain?: string;
    slug?: string;

    [key: string]: any;
}

interface SkinState {
    cafes: Array<FullCafe>;
    advertisements: any;
    discounts: any;

    resolvingId?: string | null;
    cafeId?: string | null;
}

interface CreateSkinStoreOptions {
    client: { invoke: (name: string, params?: any) => Promise<any>; },

    locale?: string,
    mode?: "menu" | "ordering";
    namespaced?: boolean;
}

export function createStoreModule(options: CreateSkinStoreOptions) {
    if (!options.locale) {
        options.locale = "en";
    }

    if (!options.mode) {
        options.mode = "menu";
    }

    let {
        client,
        namespaced = true
    } = options;

    return {
        namespaced,
        state: {
            cafes: [],
            advertisements: {},
            discounts: {},

            cafeId: null,
        },
        getters: {
            cafe({ cafes, cafeId }: SkinState) {
                if (cafeId == null) {
                    return null;
                }

                if (cafeId.startsWith("$")) {
                    return cafes.find(cafe => cafe.domain === cafeId);
                }

                return cafes.find(cafe => cafe.hash_id === cafeId || cafe.slug === cafeId);
            },
            advertisements({ advertisements, cafeId }: SkinState) {
                if (cafeId == null) {
                    return [];
                }

                return advertisements[cafeId] || [];
            },
            discounts({ discounts, cafeId }: SkinState) {
                if (cafeId == null) {
                    return [];
                }

                return discounts[cafeId] || [];
            },
        },
        mutations: {
            setCafe(state: SkinState, cafe: FullCafe) {
                state.cafes = [
                    ...state.cafes.filter(oldCafe => oldCafe.id !== cafe.id),
                    cafe,
                ];
            },
            setAdvertisements(
                { advertisements }: SkinState,
                { cafeId, advertisements: newAdvertisements, }: { cafeId: string; advertisements: any[] }
            ) {
                advertisements[cafeId] = newAdvertisements;
            },
            setDiscounts(
                { discounts }: SkinState,
                { cafeId, discounts: newDiscounts, }: { cafeId: string; discounts: any[] }
            ) {
                discounts[cafeId] = newDiscounts;
            },
        },
        actions: {
            async setCafe(
                { state, commit }: { state: SkinState; commit: (mutation: any, args: any) => any },
                { id, locale = options.locale }: { id: any; locale?: string; }
            ) {
                state.cafeId = id;
                state.resolvingId = id;

                const resolveAdvertisements = async () => {
                    const advertisements = await client.invoke("getCafeAdvertisements", {
                        id,
                        locale,
                    });

                    commit("setAdvertisements", {
                        cafeId: id,
                        advertisements,
                    });

                    return advertisements;
                };

                const resolveDiscounts = async () => {
                    const discounts = await client.invoke("getCafeDiscounts", {
                        id,
                        locale,
                    });

                    commit("setDiscounts", {
                        cafeId: id,
                        discounts,
                    });

                    return discounts;
                };

                const resolveCafe = async () => {
                    const cafe = await client.invoke("getFullCafe", {
                        id,
                        locale,
                    });

                    commit("setCafe", cafe);

                    return cafe;
                }

                const [cafe, advertisements, discounts] = await Promise.all([
                    resolveCafe,
                    resolveAdvertisements,
                    resolveDiscounts
                ]);

                const result = {
                    cafe: await cafe(),
                    advertisements: await advertisements(),
                    discounts: await discounts(),
                };

                state.resolvingId = null;

                return result;
            },
        }
    };
}
