import { cva } from "class-variance-authority";

export const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        // Cybersecurity-specific variants
        tech: "border-primary/20 bg-primary/10 text-primary hover:bg-primary/20 glow-cyan",
        status: "border-success/20 bg-success/10 text-success hover:bg-success/20",
        category: "border-secondary/20 bg-secondary/10 text-secondary hover:bg-secondary/20 glow-violet",
        year: "border-muted-foreground/20 bg-muted/20 text-muted-foreground hover:bg-muted/30",
        featured: "border-warning/20 bg-warning/10 text-warning hover:bg-warning/20 font-bold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export type BadgeVariant = NonNullable<Parameters<typeof badgeVariants>[0]>["variant"];