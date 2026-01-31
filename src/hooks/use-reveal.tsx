import { useEffect } from "react";

export function useRevealOnScroll() {
	useEffect(() => {
		function reveal() {
		const wh = window.innerHeight;
		const rp = 150;

		const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-down');
		revealElements.forEach((el) => {
			const rt = el.getBoundingClientRect().top;
			if (rt < wh - rp) {
			el.classList.add('active');
			} else {
			el.classList.remove('active');
			}
		});
		}

		// Run once on mount in case elements are visible initially
		reveal();

		window.addEventListener('scroll', reveal);
		return () => window.removeEventListener('scroll', reveal);
	}, []);
}