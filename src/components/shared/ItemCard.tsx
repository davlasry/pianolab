import { Button } from "@/components/ui/button.tsx";
import { Card } from "@/components/ui/card.tsx";
import { Music } from "lucide-react";
import type { ReactNode } from "react";

interface Action {
    icon: ReactNode;
    label: string;
    onClick: (e: React.MouseEvent) => void;
    className?: string;
}

interface ItemCardProps {
    title: string;
    subtitle?: string;
    tags?: Array<{
        text: string;
        className?: string;
    }>;
    leftContent?: ReactNode;
    centerContent?: ReactNode;
    actions: Action[];
    onClick?: () => void;
}

export function ItemCard({
    title,
    subtitle,
    tags = [],
    leftContent,
    centerContent,
    actions,
    onClick,
}: ItemCardProps) {
    return (
        <Card
            className="overflow-hidden border-0 bg-zinc-900 hover:bg-zinc-800 transition-all duration-200 cursor-pointer py-4 px-0"
            onClick={onClick}
        >
            <div className="flex items-center px-4">
                <div className="h-12 w-12 rounded-md bg-zinc-800 flex items-center justify-center mr-4">
                    {leftContent || <Music className="h-6 w-6 text-zinc-400" />}
                </div>

                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-y-1 gap-x-4">
                    <div className="col-span-2 md:col-span-1">
                        <h3 className="font-medium text-base text-white line-clamp-1">
                            {title}
                        </h3>
                        {subtitle && (
                            <p className="text-sm text-zinc-400 line-clamp-1">
                                {subtitle}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center text-sm text-zinc-400">
                        {centerContent}
                    </div>

                    <div className="text-sm">
                        {tags.map((tag, index) => (
                            <span
                                key={index}
                                className={`inline-block px-2 py-0.5 bg-zinc-800 rounded-sm text-zinc-400 text-xs ${
                                    index > 0 ? "ml-2" : ""
                                } ${tag.className || ""}`}
                            >
                                {tag.text}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {actions.map((action, index) => (
                        <Button
                            key={index}
                            variant="ghost"
                            size="icon"
                            onClick={action.onClick}
                            className={`h-8 w-8 rounded-full ${action.className || "bg-zinc-700 hover:bg-zinc-600 text-zinc-300 hover:text-white"} transition-all`}
                        >
                            {action.icon}
                            <span className="sr-only">{action.label}</span>
                        </Button>
                    ))}
                </div>
            </div>
        </Card>
    );
}
