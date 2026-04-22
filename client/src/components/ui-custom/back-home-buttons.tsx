/**
 * BackHomeButtons — Reusable navigation buttons
 * Shows a Back button (goes to previous page) and a Home button (goes to /)
 */
import { Link, useLocation } from "wouter";
import { ChevronLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BackHomeButtonsProps {
  backHref?: string;   // override back destination (default: browser back)
  backLabel?: string;  // override back label
}

export function BackHomeButtons({ backHref, backLabel = "Back" }: BackHomeButtonsProps) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {backHref ? (
        <Button variant="ghost" size="sm" asChild className="h-8 px-2 text-muted-foreground hover:text-foreground">
          <Link href={backHref}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            {backLabel}
          </Link>
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-muted-foreground hover:text-foreground"
          onClick={() => window.history.back()}
          data-testid="button-back"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          {backLabel}
        </Button>
      )}

      <Button variant="ghost" size="sm" asChild className="h-8 px-2 text-muted-foreground hover:text-foreground">
        <Link href="/">
          <Home className="w-4 h-4 mr-1" />
          Home
        </Link>
      </Button>
    </div>
  );
}
