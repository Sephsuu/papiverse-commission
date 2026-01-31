"use client"

import { useEffect } from "react";
import { HeroSection } from "./Hero";
import { MissionSection } from "./Mission";
import { SucsessStorySection } from "./SuccessStory";
import { TestimonialSection } from "./Testimonials";
import { VisionSection } from "./Vision";
import { useRevealOnScroll } from "@/hooks/use-reveal";
import CurvedLoop from "@/components/blocks/CurvedLoop/CurvedLoop";

export function Homepage() {
	useRevealOnScroll();
	return(
		<section>
			<HeroSection />
			<CurvedLoop 
				marqueeText="Pagkaing Pang-masa 🍚 Masarap ang Lasa 🍖 at Binabalik-balikan 🍗"
				speed={2}
				curveAmount={100}
				direction="right"
				interactive
				className=""
			/>
			<VisionSection />
			<MissionSection />
			{/* <SucsessStorySection /> */}
			<TestimonialSection />

			<section className="h-40" />
		</section>
	);
}