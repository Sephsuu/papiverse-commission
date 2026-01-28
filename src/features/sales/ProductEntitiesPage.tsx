"use client"

import { AppHeader } from "@/components/shared/AppHeader";
import { AppTabSwitcher } from "@/components/shared/AppTabSwitcher";
import { useState, useEffect } from "react";
import { ProductsPage } from "./ProductsPage";
import { ModifierGroupsPage } from "./ModifierGroupPage";
import { useSearchParams, useRouter } from "next/navigation";

const tabs = ["Products", "Modifier Groups"];

export function ProductEntitiesPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialTab = searchParams.get("tab") ?? tabs[0];
    const [tab, setTab] = useState(initialTab);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        params.set("tab", tab);

        router.replace(`/products?${params.toString()}`);
    }, [tab, router]);

    return (
        <section className="stack-md animate-fade-in-up overflow-hidden max-md:mt-12">
            <AppHeader label={`All ${tab}`} />

            <AppTabSwitcher tabs={tabs} selectedTab={tab} setSelectedTab={setTab} />

            {tab === tabs[0] && <ProductsPage />}
            {tab === tabs[1] && <ModifierGroupsPage />}
        </section>
    );
}
