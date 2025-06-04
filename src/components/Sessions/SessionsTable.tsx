import { useState, useMemo } from "react";
import { type Session } from "@/types/entities.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Edit,
    Trash2,
    Music,
    ChevronDown,
    Search,
    Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SessionsTableProps {
    sessions: Session[];
    onOpenSession: (session: Session) => void;
    onEdit: (session: Session) => void;
    onDelete: (session: Session) => void;
}

type SortField = "name" | "performer" | "created_at" | "key";
type SortDirection = "asc" | "desc";

// Custom date formatter function
const formatDate = (dateString: string | null): string => {
    if (!dateString) return "";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];

    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();

    return `${month} ${day}, ${year}`;
};

export function SessionsTable({
    sessions,
    onOpenSession,
    onEdit,
    onDelete,
}: SessionsTableProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortField, setSortField] = useState<SortField>("created_at");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const filteredSessions = useMemo(() => {
        return sessions.filter((session) => {
            const searchLower = searchQuery.toLowerCase();
            return (
                session.name?.toLowerCase().includes(searchLower) ||
                false ||
                session.performer?.toLowerCase().includes(searchLower) ||
                false ||
                session.key?.toLowerCase().includes(searchLower) ||
                false
            );
        });
    }, [sessions, searchQuery]);

    const sortedSessions = useMemo(() => {
        return [...filteredSessions].sort((a, b) => {
            let comparison = 0;

            switch (sortField) {
                case "name":
                    comparison = (a.name || "").localeCompare(b.name || "");
                    break;
                case "performer":
                    comparison = (a.performer || "").localeCompare(
                        b.performer || "",
                    );
                    break;
                case "key":
                    comparison = (a.key || "").localeCompare(b.key || "");
                    break;
                case "created_at":
                    comparison =
                        new Date(a.created_at || "").getTime() -
                        new Date(b.created_at || "").getTime();
                    break;
            }

            return sortDirection === "asc" ? comparison : -comparison;
        });
    }, [filteredSessions, sortField, sortDirection]);

    const renderSortIcon = (field: SortField) => {
        if (sortField !== field) return null;

        return (
            <ChevronDown
                className={cn(
                    "ml-1 h-4 w-4 transition-transform",
                    sortDirection === "desc" ? "rotate-180 transform" : "",
                )}
            />
        );
    };

    return (
        <div className="w-full space-y-4 px-4 py-3">
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, performer or key..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border-none bg-background pl-9 ring-1 ring-border focus-visible:ring-ring"
                    />
                </div>
            </div>

            <div className="overflow-hidden rounded-md border bg-card text-card-foreground shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="border-b border-border hover:bg-transparent">
                            <TableHead
                                className="w-[30%] cursor-pointer py-4"
                                onClick={() => handleSort("name")}
                            >
                                <div className="flex items-center">
                                    Name {renderSortIcon("name")}
                                </div>
                            </TableHead>
                            <TableHead
                                className="cursor-pointer py-4"
                                onClick={() => handleSort("performer")}
                            >
                                <div className="flex items-center">
                                    Performer {renderSortIcon("performer")}
                                </div>
                            </TableHead>
                            <TableHead
                                className="cursor-pointer py-4"
                                onClick={() => handleSort("key")}
                            >
                                <div className="flex items-center">
                                    Key {renderSortIcon("key")}
                                </div>
                            </TableHead>
                            <TableHead
                                className="cursor-pointer py-4"
                                onClick={() => handleSort("created_at")}
                            >
                                <div className="flex items-center">
                                    Date {renderSortIcon("created_at")}
                                </div>
                            </TableHead>
                            <TableHead className="py-4 text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedSessions.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="h-24 py-8 text-center"
                                >
                                    No sessions found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedSessions.map((session) => (
                                <TableRow
                                    key={session.id}
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => onOpenSession(session)}
                                >
                                    <TableCell className="w-[20%] max-w-[250px] py-4 font-medium">
                                        <div className="flex max-w-full items-center gap-3">
                                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-primary/10">
                                                <Music className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="min-w-0 flex-1 overflow-hidden">
                                                <span className="block truncate">
                                                    {session.name || "Untitled"}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {session.performer || "—"}
                                    </TableCell>
                                    <TableCell>
                                        {session.key ? (
                                            <Badge
                                                variant="outline"
                                                className="bg-primary/10 hover:bg-primary/20"
                                            >
                                                {session.key}
                                            </Badge>
                                        ) : (
                                            "—"
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                            <Calendar className="h-3.5 w-3.5" />
                                            <span className="text-sm">
                                                {formatDate(session.created_at)}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEdit(session);
                                                }}
                                            >
                                                <Edit className="h-4 w-4" />
                                                <span className="sr-only">
                                                    Edit
                                                </span>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="hover:bg-muted"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(session);
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                                <span className="sr-only">Delete</span>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
