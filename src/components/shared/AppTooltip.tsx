import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"

export function AppTooltip({
	trigger,
	content,
	tooltipClassName,
	contentClassName
}: {
	trigger: React.ReactNode
	content: string
	tooltipClassName?: string
	contentClassName?: string
}) {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger 
					className={tooltipClassName} 
					asChild
				>
					{trigger}
				</TooltipTrigger>
				<TooltipContent className={contentClassName}>
					{content}
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	)
}