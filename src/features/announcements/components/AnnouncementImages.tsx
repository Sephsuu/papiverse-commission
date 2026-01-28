"use client";

import Image from "next/image";
import { NEXT_URL } from "@/lib/urls";
import { Dispatch, SetStateAction } from "react";
import { Announcement } from "@/types/announcement";

export function AnnouncementImages({ toView, setView }: { 
	toView: Announcement
	setView: Dispatch<SetStateAction<Announcement | undefined>>
}) {
	const images = toView.announcementImages;
	if (!images || images.length === 0) return null;

	const Wrapper = ({ children }: { children: React.ReactNode }) => (
		<button
			onClick={ () => setView(toView) }
			type="button"
			className="relative overflow-hidden rounded-sm p-0 m-0 w-full h-full cursor-pointer focus:outline-none"
		>
			{children}
		</button>
	);

	return (
		<section className="w-full overflow-hidden rounded-sm">
			{images.length === 1 ? (
				<Wrapper>
					<Image
						src={`${NEXT_URL}${images[0]}`}
						alt=""
						width={1200}
						height={800}
						className="w-full h-auto object-cover rounded-sm"
					/>
				</Wrapper>
			) : images.length === 2 ? (
				<div className="flex gap-1">
				{images.map((img, i) => (
					<Wrapper key={i}>
						<Image
							src={`${NEXT_URL}${img}`}
							alt=""
							width={600}
							height={600}
							className="w-full h-full object-cover rounded-sm"
						/>
					</Wrapper>
				))}
				</div>
			) : images.length === 3 ? (
				<div className="flex gap-1 h-[400px]">
					<Wrapper>
						<Image
							src={`${NEXT_URL}${images[0]}`}
							alt=""
							width={800}
							height={800}
							className="w-full h-full object-cover rounded-sm"
						/>
					</Wrapper>

					<div className="flex flex-col flex-1 gap-1">
						{images.slice(1).map((img, i) => (
						<Wrapper key={i}>
							<Image
								src={`${NEXT_URL}${img}`}
								alt=""
								width={600}
								height={300}
								className="w-full h-full object-cover rounded-sm"
							/>
						</Wrapper>
						))}
					</div>
				</div>
			) : (
				<div className="grid grid-cols-2 gap-1 h-[500px]">
				{images.slice(0, 4).map((img, i) => (
					<Wrapper key={i}>
						<Image
							src={`${NEXT_URL}${img}`}
							alt=""
							width={600}
							height={600}
							className="w-full h-full object-cover rounded-sm"
						/>
						{i === 3 && images.length > 4 && (
							<div className="absolute inset-0 bg-black/50 flex items-center justify-center">
							<span className="text-white text-3xl font-bold">
								+{images.length - 4}
							</span>
							</div>
						)}
					</Wrapper>
				))}
				</div>
			)}
		</section>
	);
}
