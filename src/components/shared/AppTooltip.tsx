import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"

export function AppTooltip({
	trigger,
	content,
	triggerClassName,
	contentClassName,
	onClick
}: {
	trigger: React.ReactNode
	content: React.ReactNode | string
	triggerClassName?: string
	contentClassName?: string
	onClick?: React.MouseEventHandler<HTMLSpanElement>
}) {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger 
					className={triggerClassName} 
					asChild
				>
					<span onClick={onClick}>
						{trigger}
					</span>
				</TooltipTrigger>
				<TooltipContent className={contentClassName}>
					{content}
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	)
}
