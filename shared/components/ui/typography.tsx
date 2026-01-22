import * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/shared/lib/utils";

const typographyVariants = cva("text-foreground", {
	variants: {
		type: {
			title: "text-2xl leading-tight font-semibold",
			body: "text-base leading-relaxed",
			subtitle: "text-base leading-relaxed font-semibold",
			"body-sm": "text-sm leading-relaxed",
			caption: "text-xs leading-snug text-muted-foreground",
		},
	},
	defaultVariants: {
		type: "body",
	},
});

type TypographyProps = React.ComponentPropsWithoutRef<"p"> &
	VariantProps<typeof typographyVariants> & {
		asChild?: boolean;
	};

function Typography({ className, type = "body", asChild = false, ...props }: TypographyProps) {
	const Comp = asChild ? Slot.Root : type === "title" ? "h2" : type === "caption" ? "span" : "p";

	return (
		<Comp
			data-slot="typography"
			data-type={type}
			className={cn(typographyVariants({ type, className }))}
			{...props}
		/>
	);
}

export { Typography, typographyVariants };
