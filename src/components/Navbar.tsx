import { Link } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

export const Navbar = () => {
    const { theme, setTheme } = useTheme();

    return (
        <nav className="w-full border-b border-border bg-background px-4 py-1.5">
            <div className="mx-auto flex max-w-[1200px] items-center justify-between">
                <Link
                    to="/"
                    className="text-2xl font-bold text-foreground no-underline"
                >
                    PianoLab
                </Link>
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                            setTheme(theme === "light" ? "dark" : "light")
                        }
                    >
                        <Sun
                            className="absolute h-5 w-5 scale-100 rotate-0 transition-transform data-[theme=dark]:scale-0 data-[theme=dark]:-rotate-90"
                            data-theme={theme}
                        />
                        <Moon
                            className="absolute h-5 w-5 scale-0 rotate-90 transition-transform data-[theme=dark]:scale-100 data-[theme=dark]:rotate-0"
                            data-theme={theme}
                        />
                        <span className="sr-only">Toggle theme</span>
                    </Button>
                </div>
            </div>
        </nav>
    );
};
