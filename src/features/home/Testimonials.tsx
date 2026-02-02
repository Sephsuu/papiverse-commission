import { Heart, MessageSquareQuote, Quote, Star } from 'lucide-react';

const testimonials = [
	{ name: "Joseph Bataller", testimony: "I found using Tailwind CSS for grid layouts incredibly efficient and straightforward." },
	{ name: "Joseph Bataller", testimony: "Masarap yung sisig hindi nakakasawa yung taba kasi malinamnam, madami pa serving. Sigurado babalik ako dito sa susunod na buwan." },
	{ name: "Joseph Bataller", testimony: "Malutong yung Krispy Bagnet, masarap kahit walang kanin." },
	{ name: "Joseph Bataller", testimony: "Ang solid ng quality experience and mababait din mga staff nila." },
	{ name: "Joseph Bataller", testimony: "Ang ganda ng ambiance nung lugar napaka manuhay at madami din kumakain. Mabilis lang ang waiting time for food at ang sasarap ng pagkain. Uilit ulitin namin sa restaurant na ito, da best!" },
	{ name: "Joseph Bataller", testimony: "Ang solid ng quality experience and mababait din mga staff nila." },
	{ name: "Joseph Bataller", testimony: "Masarap yung sisig hindi nakakasawa yung taba kasi malinamnam, madami pa serving. Sigurado babalik ako dito sa susunod na buwan." },
	{ name: "Joseph Bataller", testimony: "Ang solid ng quality experience and mababait din mga staff nila." },
	{ name: "Joseph Bataller", testimony: "Masarap yung sisig hindi nakakasawa yung taba kasi malinamnam, madami pa serving. Sigurado babalik ako dito sa susunod na buwan." },
];

export function TestimonialSection() {
	return(
		<section className="pb-75 bg-slate-300">
			<div className='bg-slate-50 -mb-2'>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
					<path fill="#cad5e2" fillOpacity="1" d="M0,256L80,261.3C160,267,320,277,480,272C640,267,800,245,960,234.7C1120,224,1280,224,1360,224L1440,224L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
				</svg>
			</div>

			<div 
				className={`text-7xl font-bold text-center mb-10`}
			>
				Testimonials
			</div>
			
			
			<div className="grid grid-cols-4">
				<div className={`flex items-center h-fit p-2 transform transition-transform duration-500 hover:scale-105`}>
					<div className="w-[85%] bg-white text-xs p-4 rounded-xl shadow-sm reveal">
						<MessageSquareQuote className='-mt-7 font-semibold w-8 h-8' />
						<div className="text-gray-600 py-4 pl-4 pr-8">{ testimonials[0].testimony }</div>
						<div className="text-xs font-semibold">{ testimonials[0].name }</div>
					</div>
					<div className="-ml-10 w-25 h-25 reveal">
						<img 
							src="/images/sephsuu2.jpg" 
							alt={ testimonials[0].name } 
							className="w-full h-full rounded-full border-4 border-white shadow-sm"
						/>
					</div>
				</div>

				<div className={`row-span-2 h-40 p-2 transform transition-transform duration-500 hover:scale-105`}>
					<div className='flex flex-col items-center reveal'>
						<img
							src='/images/sephsuu1.jpg'
							alt={ testimonials[1].name }
							className='rounded-full border-4 border-white w-30 h-30 shadow-sm z-20'
						/>
						<div className='relative bg-white shadow-sm w-full rounded-xl -mt-15 z-10'>
							<Heart className='w-5 h-5 mt-20 mx-auto text-[#801818]' fill='#801818' />
							<div className='text-md font-semibold text-center'>"Krispy Papi the best!"</div>
							<div className='p-4 text-xs text-gray-600'>{ testimonials[1].testimony }</div>
							<div className='text-xs mt-5 font-semibold p-4'>{ testimonials[1].name }</div>
							<Quote className='w-10 h-10 absolute -bottom-5 right-3' fill='black' />
						</div>
					</div>
				</div>
				
				<div className={`row-span-2 h-40 pb-8 px-8 transform transition-transform duration-500 hover:scale-105`}>
					<div className='bg-white rounded-xl shadow-sm p-4 reveal'>
						<img
							src='/images/sephsuu2.jpg'
							alt={ testimonials[2].name }
							className=''
						/>
						<div className='text-xs text-gray-600 my-4'>{ testimonials[2].testimony }</div>
						<div className='text-xs font-semibold text-end'>{ testimonials[2].name }</div>
					</div>
				</div>

				<div className={`h-20 p-2 -mt-10 transform transition-transform duration-500 hover:scale-105`}>
					<div className='flex flex-col items-center reveal'>
						<img
							src='/images/sephsuu1.jpg'
							alt={ testimonials[3].name }
							className='rounded-full border-4 border-white w-30 h-30 shadow-sm z-20'
						/>
						<div className='bg-white shadow-sm w-full rounded-xl -mt-15 z-10'>
							<div className='text-md font-semibold text-center mt-15'>"Good job Krispy Papi!"</div>
							<div className='flex justify-center gap-2 mt-2'>
								<Star className='w-5 h-5 text-[#ffff31]' fill='#ffff31' />
								<Star className='w-5 h-5 text-[#ffff31]' fill='#ffff31' />
								<Star className='w-5 h-5 text-[#ffff31]' fill='#ffff31' />
								<Star className='w-5 h-5 text-[#ffff31]' fill='#ffff31' />
								<Star className='w-5 h-5 text-[#ffff31]' fill='#ffff31' />
							</div>
							<div className='p-4 text-xs text-gray-600'>{ testimonials[3].testimony }</div>
							<div className='text-xs font-semibold pb-4 px-4 text-end'>{ testimonials[3].name }</div>
						</div>
					</div>
				</div>

				<div className={`h-20 p-2 transform transition-transform duration-500 hover:scale-105`}>
					<div className='rounded-xl shadow-sm bg-white reveal'>
						<div className='text-xs text-gray-600 p-4'>{ testimonials[4].testimony }</div>
						<div className='flex justify-between items-end bg-slate-200 p-4 rounded-b-xl'>
							<div className='text-xs font-semibold'>{ testimonials[4].name }</div>
							<img 
								src="/images/sephsuu1.jpg"
								alt={ testimonials[4].name }
								className='w-16 h-16 rounded-full -mt-10'
							/>
						</div>
					</div>
				</div>

				<div className={`h-20 p-2 mt-25 -ml-5 transform transition-transform duration-500 hover:scale-105`}>
					<div className='bg-white p-2 flex items-center rounded-xl shadow-sm reveal'>
						<img
							src='/images/sephsuu2.jpg'
							alt={ testimonials[5].testimony }
							className='w-33'
						/>
						<div className='p-2'>
							<div className='text-xs text-gray-600'>{ testimonials[5].testimony }</div>
							<div className='text-xs font-semibold mt-4 text-center'>{ testimonials[5].name }</div>
						</div>
					</div>
				</div>

				<div className={`col-span-2 h-20 p-2 mt-10 transform transition-transform duration-500 hover:scale-105`}>
					<div 
						className='bg-white px-4 pb-15 pt-4 rounded-xl shadow-sm reveal'
						style={{ clipPath: "polygon(0% 0%, 100% 0%, 100% 75%, 53% 75%, 46% 86%, 46% 76%, 0% 75%)" }}
					>
						<div className='flex flex-col gap-2'>
							<div className='text-md font-semibold text-center'>"A Good Quality Experience"</div>
							<div className='text-xs text-gray-600 text-center'>{ testimonials[6].testimony }</div>
							<div className='text-xs font-semibold text-center'>{ testimonials[6].name }</div>
						</div>
					</div>
					<div className='flex justify-center gap-3'>
						<img 
							src='/images/sephsuu1.jpg'
							className='w-25 h-25 rounded-full border-4 border-white -mt-5 reveal'
						/>
						<img 
							src='/images/sephsuu2.jpg'
							className='w-25 h-25 rounded-full border-4 border-white reveal'
						/>
						<img 
							src='/images/sephsuu1.jpg'
							className='w-25 h-25 rounded-full border-4 border-white -mt-5 reveal'
						/>
					</div>
				</div>

				<div className={`h-20 mt-24 pl-2 pr-6 py-6 transform transition-transform duration-500 hover:scale-105`}>
					<div 
						className='bg-white px-4 pb-24 pt-4 rounded-xl shadow-sm reveal'
						style={{ clipPath: "polygon(0% 0%, 100% 0%, 100% 75%, 54% 76%, 50% 83%, 47% 76%, 0% 75%)" }}
					>
						<div className='flex flex-col items-center'>
							<img
								src='/images/sephsuu1.jpg'
								alt={ testimonials[7].name }
								className='rounded-full border-4 border-white w-25 h-25 shadow-sm z-20'
							/>
							<div className='w-full rounded-xl -mt-15 z-10'>
								<div className='text-md font-semibold text-center mt-15'>"Good job Krispy Papi!"</div>
								<div className='flex justify-center gap-2 mt-2'>
									<Star className='w-5 h-5 text-[#ffff31]' fill='#ffff31' />
									<Star className='w-5 h-5 text-[#ffff31]' fill='#ffff31' />
									<Star className='w-5 h-5 text-[#ffff31]' fill='#ffff31' />
									<Star className='w-5 h-5 text-[#ffff31]' fill='#ffff31' />
									<Star className='w-5 h-5 text-[#ffff31]' fill='#ffff31' />
								</div>
								<div className='p-4 text-xs text-gray-600'>{ testimonials[7].testimony }</div>
								<div className='text-xs font-semibold pb-4 px-4 text-end'>{ testimonials[7].name }</div>
							</div>
						</div>
					</div>
				</div>

				<div className={`h-20 p-2 mt-25 -ml-5 transform transition-transform duration-500 hover:scale-105`}>
					<div className='grid grid-cols-2 bg-white p-2 items-center rounded-xl shadow-sm reveal'>
						<div className='p-2'>
							<div className='text-xs text-center text-gray-600'>{ testimonials[8].testimony }</div>
						</div>
						<img
							src='/images/sephsuu1.jpg'
							alt={ testimonials[8].testimony }
							className='w-33 rounded-full shadow-sm border-4 border-white mx-auto'
						/>
						<div></div>
						<div className='text-center text-xs font-semibold'>{ testimonials[8].name }</div>
					</div>
				</div>
			</div>
		</section>
	);
}