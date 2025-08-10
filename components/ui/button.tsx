import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive relative overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-soft hover:shadow-premium hover:bg-primary-hover hover:scale-[1.02] hover:-translate-y-0.5 active:scale-100 active:translate-y-0",
        destructive:
          "bg-destructive text-destructive-foreground shadow-soft hover:shadow-premium hover:bg-destructive/90 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-100 active:translate-y-0",
        outline:
          "border border-border bg-background shadow-soft hover:shadow-soft hover:bg-accent hover:text-accent-foreground hover:border-primary/30 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-100 active:translate-y-0",
        secondary:
          "bg-secondary text-secondary-foreground shadow-soft hover:shadow-soft hover:bg-secondary/80 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-100 active:translate-y-0",
        ghost:
          "hover:bg-accent hover:text-accent-foreground hover:scale-[1.02] transition-all duration-200",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary-hover transition-colors",
        premium:
          "bg-gradient-to-r from-primary to-primary-hover text-primary-foreground shadow-premium hover:shadow-dramatic hover:scale-[1.02] hover:-translate-y-1 active:scale-100 active:translate-y-0 border border-white/20",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-lg gap-1.5 px-3 text-xs has-[>svg]:px-2.5",
        lg: "h-12 rounded-xl px-8 text-base has-[>svg]:px-6 font-semibold",
        icon: "size-10 rounded-lg",
        xl: "h-14 rounded-xl px-10 text-lg has-[>svg]:px-8 font-semibold",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
