import { Link } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

export const Navbar = () => {
    const { theme, setTheme } = useTheme();
    console.log("theme =====>", theme);

    return (
        <nav className="bg-background border-b border-border py-1.5 px-4 w-full">
            <div className="flex justify-between items-center max-w-[1200px] mx-auto">
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
                        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Toggle theme</span>
                    </Button>
                </div>
            </div>
        </nav>
    );
};
