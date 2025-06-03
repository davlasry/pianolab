import { useState, useMemo } from "react";
import { type Piece } from "@/types/entities.types";
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
import { Edit, Trash2, Music2, ChevronDown, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface PiecesTableProps {
  pieces: Piece[];
  onOpenPiece: (piece: Piece) => void;
  onEdit: (piece: Piece) => void;
  onDelete: (piece: Piece) => void;
}

type SortField = "name" | "composer" | "style";
type SortDirection = "asc" | "desc";

export function PiecesTable({
  pieces,
  onOpenPiece,
  onEdit,
  onDelete,
}: PiecesTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredPieces = useMemo(() => {
    return pieces.filter((piece) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        (piece.name?.toLowerCase().includes(searchLower) || false) ||
        (piece.composer?.toLowerCase().includes(searchLower) || false) ||
        (piece.style?.toLowerCase().includes(searchLower) || false)
      );
    });
  }, [pieces, searchQuery]);

  const sortedPieces = useMemo(() => {
    return [...filteredPieces].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "name":
          comparison = (a.name || "").localeCompare(b.name || "");
          break;
        case "composer":
          comparison = (a.composer || "").localeCompare(b.composer || "");
          break;
        case "style":
          comparison = (a.style || "").localeCompare(b.style || "");
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredPieces, sortField, sortDirection]);

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    
    return (
      <ChevronDown 
        className={cn(
          "ml-1 h-4 w-4 transition-transform", 
          sortDirection === "desc" ? "transform rotate-180" : ""
        )} 
      />
    );
  };

  return (
    <div className="w-full space-y-4 px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, composer or style..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background border-none ring-1 ring-border focus-visible:ring-ring"
          />
        </div>
      </div>

      <div className="rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border">
              <TableHead 
                className="w-[25%] cursor-pointer py-4"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center">
                  Name {renderSortIcon("name")}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer py-4"
                onClick={() => handleSort("composer")}
              >
                <div className="flex items-center">
                  Composer {renderSortIcon("composer")}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer py-4"
                onClick={() => handleSort("style")}
              >
                <div className="flex items-center">
                  Style {renderSortIcon("style")}
                </div>
              </TableHead>
              <TableHead className="text-right py-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedPieces.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center py-8">
                  No pieces found.
                </TableCell>
              </TableRow>
            ) : (
              sortedPieces.map((piece) => (
                <TableRow 
                  key={piece.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onOpenPiece(piece)}
                >
                  <TableCell className="font-medium py-4">
                    <div className="flex items-center gap-3 max-w-full">
                      <div className="h-10 w-10 flex-shrink-0 rounded-md bg-primary/10 flex items-center justify-center">
                        <Music2 className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <span className="truncate block">{piece.name}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {piece.composer ? (
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{piece.composer}</span>
                      </div>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    {piece.style ? (
                      <Badge variant="outline" className="bg-primary/10 hover:bg-primary/20">
                        {piece.style}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(piece);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-muted"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(piece);
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
