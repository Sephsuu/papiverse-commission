"use client"

import { MainLoader, PapiverseLoading } from "@/components/ui/loader";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { Homepage } from "@/features/home/_page";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
	const { claims, loading } = useAuth();

	if (loading) return <MainLoader />
	if (claims.roles.length === 0) return <Homepage />

	return (
		<DashboardPage />
	)
}