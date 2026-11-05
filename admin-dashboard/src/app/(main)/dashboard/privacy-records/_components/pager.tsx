import { Button } from "@/components/ui/button";

export function Pager({
  total,
  noun,
  page,
  pages,
  loading,
  onPage,
}: {
  total: number;
  noun: string;
  page: number;
  pages: number;
  loading: boolean;
  onPage: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-between text-muted-foreground text-sm">
      <span>
        {total} {noun}
        {total === 1 ? "" : "s"} · page {page} of {pages}
      </span>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => onPage(page - 1)}>
          Previous
        </Button>
        <Button variant="outline" size="sm" disabled={page >= pages || loading} onClick={() => onPage(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
