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
            className="0 cursor-pointer overflow-hidden border-0 bg-secondary/50 px-0 py-4 transition-all duration-200 hover:bg-secondary/9"
            onClick={onClick}
        >
            <div className="flex items-center px-4">
                <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-md bg-muted">
                    {leftContent || (
                        <Music className="h-6 w-6 text-muted-foreground" />
                    )}
                </div>

                <div className="grid flex-1 grid-cols-[2fr_2fr_1fr_1fr] items-center gap-x-4 gap-y-1">
                    <div className="col-span-2 md:col-span-1">
                        <h3 className="line-clamp-1 text-base font-medium text-foreground">
                            {title}
                        </h3>
                        {subtitle && (
                            <p className="line-clamp-1 text-sm text-muted-foreground">
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
                                className={`inline-block rounded-sm bg-muted px-2 py-0.5 text-xs text-muted-foreground ${
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
