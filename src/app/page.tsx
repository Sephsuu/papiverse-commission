"use client"

import { PapiverseLoading } from "@/components/ui/loader";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { Homepage } from "@/features/home/_page";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
	const { claims, loading } = useAuth();

	if (loading) return <PapiverseLoading />
	if (claims.roles.length === 0) return <Homepage />
	console.log(claims);
	

	return (
		
		<DashboardPage />
	)
}