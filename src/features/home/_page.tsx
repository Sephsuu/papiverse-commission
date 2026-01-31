"use client"

import { useEffect } from "react";
import { HeroSection } from "./Hero";
import { MissionSection } from "./Mission";
import { SucsessStorySection } from "./SuccessStory";
import { TestimonialSection } from "./Testimonials";
import { VisionSection } from "./Vision";
import { useRevealOnScroll } from "@/hooks/use-reveal";

export function Homepage() {
	useRevealOnScroll();
	return(
		<section>
			<HeroSection />
			<VisionSection />
			<MissionSection />
			{/* <SucsessStorySection /> */}
			<TestimonialSection />

			<section className="h-40" />
		</section>
	);
}