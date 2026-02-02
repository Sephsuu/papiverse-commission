import GridMotion from "@/components/blocks/Backgrounds/GridMotion/GridMotion";
import BlurText from "@/components/blocks/TextAnimations/BlurText/BlurText"
import CurvedLoop from "@/components/blocks/CurvedLoop/CurvedLoop"
import { Card } from "@/components/ui/card";
import { heroCards } from "@/lib/data-array";
import { Button } from "@/components/ui/button";
import Link from "next/link";


export function HeroSection() {
	
    return(
        <section className="relative min-h-screen bg-black pb-24 overflow-hidden z-50">
			<GridMotion 
				className="absolute inset-0 z-0 brightness-50"
				items={heroCards} 
			/>

			<div className="flex flex-col items-center justify-center gap-20">

				<div className="relative w-full flex justify-center mt-8">
					<div className="flex items-center justify-between w-150 py-2 px-4 rounded-full bg-linear-to-b border border-white from-gray-200/20 via-gray-300/7 to-gray-400/20 z-10">
						<div>
							<img
								src="/images/kp_banner.png"
								alt="Krispy Papi Banner"
								className="w-30"
							/>
						</div>
						<div className="flex items-center justify-center gap-6">
							<a 
								href=""
								className="text-sm font-semibold text-white hover:text-orange-400 transition-colors duration-300"
							>
								Home
							</a>
							<a 
								href=""
								className="text-sm font-semibold text-white hover:text-orange-400 transition-colors duration-300"
							>
								Products
							</a>
							<a 
								href=""
								className="text-sm font-semibold text-white hover:text-orange-400 transition-colors duration-300"
							>
								Branches
							</a>
						</div>
					</div>

					<div className="flex-center-y gap-2 absolute right-8 top-1/2 -translate-y-1/2 z-50">
						<Link href="/auth">
							<Button
								className="!bg-lightbrown rounded-full text-[16px] font-semibold h-12 w-32 hover:opacity-90"
							>
								Login
							</Button>
						</Link>
						<Link href="/auth">
							<Button
								className="bg-white text-darkbrown rounded-full text-[16px] font-semibold h-12 w-32 hover:bg-orange-100"
							>
								Contact Us
							</Button>
						</Link>
					</div>
					

				</div>

				<div className="flex flex-col items-center -mt-20">
					<img
						src="/images/kp_logo.png"
						alt="Krispy Papi Logo"
						className="w-105"
					/>
					<div className="w-fit -mt-80 z-50 flex-center-y flex-col gap-2">
						<BlurText
							text="Krispy Papi"
							delay={150}
							animateBy="words"
							direction="bottom"
							className="text-9xl mb-8 text-white font-bold text-shadow-orange-200 text-shadow-sm"
						/>
					</div>
				</div>
			</div>

			
			
        </section>
    );
}
