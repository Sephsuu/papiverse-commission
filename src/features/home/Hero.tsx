import GridMotion from "@/components/blocks/Backgrounds/GridMotion/GridMotion";
import BlurText from "@/components/blocks/TextAnimations/BlurText/BlurText"
import CurvedLoop from "@/components/blocks/CurvedLoop/CurvedLoop"
import { Card } from "@/components/ui/card";
import { heroCards } from "@/lib/data-array";
import { Button } from "@/components/ui/button";
import Link from "next/link";


export function HeroSection() {
	
    return(
		<section
			className="flex-center relative min-h-screen bg-cover bg-center pb-24 overflow-hidden z-50"
			style={{ backgroundImage: "url('/images/kp_login.jpg')" }}
		>
			<div className="absolute inset-0 bg-black/60 z-0" />
			{/* <GridMotion 
				className="absolute inset-0 z-0 brightness-50"
				items={heroCards} 
			/> */}

			{/* <div className="h-full z-10 flex-center justify-center gap-20"> */}

				{/* <div className="relative w-full flex justify-center mt-8">
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
								className="bg-lightbrown! rounded-full text-[16px] font-semibold h-12 w-32 hover:opacity-90"
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
				</div> */}

			
				<div className="z-50 flex-center flex-col gap-2">
					<BlurText
						text="We're Coming"
						delay={150}
						animateBy="words"
						direction="bottom"
						className="font-nunito font-black text-9xl text-white text-shadow-orange-200 text-shadow-sm"
					/>
					<BlurText
						text="Soon!"
						delay={150}
						animateBy="words"
						direction="bottom"
						className="font-nunito font-black text-9xl text-white text-shadow-orange-200 text-shadow-sm"
					/>
					<div className="flex-center-y gap-4 mt-6">
						<Link href="/auth">
							<Button className="bg-lightbrown! rounded-full text-[22px] font-bold h-16 w-48 px-8 hover:opacity-90">
								Login
							</Button>
						</Link>
						<Link href="/auth">
							<Button className="bg-white text-darkbrown rounded-full text-[22px] font-bold h-16 w-48 px-8 hover:bg-orange-100">
								Contact Us
							</Button>
						</Link>
					</div>
				</div>
			
			{/* </div> */}

			
			
        </section>
    );
}
