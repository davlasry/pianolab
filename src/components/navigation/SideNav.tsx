import { Home, Music, Library, Settings, Piano } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Music, label: "Sessions", href: "/sessions" },
    { icon: Library, label: "Pieces", href: "/pieces" },
    { icon: Settings, label: "Settings", href: "/settings" },
];

export const SideNav = () => {
    const location = useLocation();

    return (
        <nav className="w-16 shrink-0 border-r bg-background">
            <div className="flex h-full flex-col items-center py-4">
                <Link to="/" className="mb-4 flex items-center justify-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                        <Piano className="h-6 w-6" />
                    </div>
                </Link>

                <div className="flex flex-col items-center gap-1">
                    <TooltipProvider delayDuration={300}>
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive =
                                location.pathname === item.href ||
                                (item.href !== "/" &&
                                    location.pathname.startsWith(item.href));

                            return (
                                <Tooltip key={item.href}>
                                    <TooltipTrigger asChild>
                                        <Link to={item.href}>
                                            <Button
                                                variant={
                                                    isActive
                                                        ? "secondary"
                                                        : "ghost"
                                                }
                                                size="icon"
                                                className={cn(
                                                    "h-10 w-10 rounded-md",
                                                    isActive && "bg-secondary",
                                                )}
                                                aria-label={item.label}
                                            >
                                                <Icon className="h-5 w-5" />
                                            </Button>
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent side="right">
                                        <p>{item.label}</p>
                                    </TooltipContent>
                                </Tooltip>
                            );
                        })}
                    </TooltipProvider>
                </div>
            </div>
        </nav>
    );
};

export default SideNav;
