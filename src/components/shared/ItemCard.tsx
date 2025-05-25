import type { ReactNode } from "react";
import React from "react";
import { Button } from "@/components/ui/button.tsx";
import { Card } from "@/components/ui/card.tsx";
import { Music } from "lucide-react";

interface Tag {
    text: string;
    className?: string;
}

interface Action {
    icon: ReactNode;
    label: string;
    onClick: (e: React.MouseEvent) => void;
    className?: string;
}

interface ItemCardProps {
    title: string;
    subtitle?: string;
    tags?: Tag[];
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
            className="overflow-hidden border-0 bg-secondary/50 hover:bg-secondary/9 0 transition-all duration-200 cursor-pointer py-4 px-0"
            onClick={onClick}
        >
            <div className="flex items-center px-4">
                <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center mr-4">
                    {leftContent || (
                        <Music className="h-6 w-6 text-muted-foreground" />
                    )}
                </div>

                <div className="flex-1 items-center grid grid-cols-[2fr_2fr_1fr_1fr] gap-y-1 gap-x-4">
                    <div className="col-span-2 md:col-span-1">
                        <h3 className="font-medium text-base text-foreground line-clamp-1">
                            {title}
                        </h3>
                        {subtitle && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                                {subtitle}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center text-sm text-muted-foreground">
                        {centerContent}
                    </div>

                    <div className="text-sm">
                        {tags.map((tag, index) => (
                            <span
                                key={index}
                                className={`inline-block px-2 py-0.5 bg-muted rounded-sm text-muted-foreground text-xs ${
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
                            className={`h-8 w-8 ${action.className} text-muted-foreground transition-all`}
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
