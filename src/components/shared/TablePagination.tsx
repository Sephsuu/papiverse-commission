import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious
} from "@/components/ui/pagination";
import { Dispatch, SetStateAction, useEffect, useRef } from "react";

export function TablePagination<T>({ data, page, size, setPage, paginated, search, filter, pageKey }: {
    data: T[];
    paginated: T[];
    page: number;
    size: number;
    setPage: Dispatch<SetStateAction<number>>;
    search?: string;
    filter?: string;
    pageKey?: string
}) {
    const totalPages = Math.ceil((data?.length ?? 0) / size);
    const isInitialMount = useRef(true);
    const prevFilter = useRef(filter);
    const prevSearch = useRef(search);

    const createPageNumbers = () => {
        const pages: (number | string)[] = [];

        if (page > 2) {
            pages.push("start-ellipsis");
        }

        const start = Math.max(0, page - 1);
        const end = Math.min(totalPages - 1, page + 1);

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (page < totalPages - 3) {
            pages.push("end-ellipsis");
        }

        return pages;
    };

    const pageNumbers = createPageNumbers();

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            prevFilter.current = filter;
            prevSearch.current = search;
            return;
        }

        if (filter !== undefined && filter !== prevFilter.current) {
            setPage(0);
            prevFilter.current = filter;
        }

        if (search !== undefined && search !== prevSearch.current) {
            setPage(0);
            prevSearch.current = search;
        }
    }, [filter, search, setPage]);

    useEffect(() => {
        if (pageKey) {
            localStorage.setItem(pageKey, String(page));
        }
    }, [page, pageKey]);

    return (
        <div className="flex-center-y justify-between max-md:flex-col max-sm:gap-2">
            <div className="text-sm text-gray">
                {(() => {
                    const start = page * size + 1;
                    const end = page * size + paginated.length;
                    return `Showing ${start}-${end} of ${data.length} items`;
                })()}
            </div>

            <Pagination className="justify-end">
                <PaginationContent>
                    <PaginationItem className="cursor-pointer">
                        <PaginationLink
                            onClick={() => setPage(0)}
                            aria-disabled={page === 0}
                        >
                            First
                        </PaginationLink>
                    </PaginationItem>

                    <PaginationItem className="cursor-pointer">
                        <PaginationPrevious
                            onClick={() => setPage(p => Math.max(p - 1, 0))}
                            aria-disabled={page === 0}
                        />
                    </PaginationItem>

                    {pageNumbers.map((p, i) => (
                        <PaginationItem key={i}>
                            {(p === "start-ellipsis" || p === "end-ellipsis") ? (
                                <span className="px-2 text-gray-500">…</span>
                            ) : (
                                <PaginationLink
                                    onClick={() => setPage(p as number)}
                                    isActive={p === page}
                                    className={`cursor-pointer ${p === page && "!bg-darkbrown text-white"}`}
                                >
                                    {(p as number) + 1}
                                </PaginationLink>
                            )}
                        </PaginationItem>
                    ))}

                    <PaginationItem className="cursor-pointer">
                        <PaginationNext
                            onClick={() => setPage(p => Math.min(p + 1, totalPages - 1))}
                            aria-disabled={page >= totalPages - 1}
                        />
                    </PaginationItem>

                    <PaginationItem className="cursor-pointer">
                        <PaginationLink
                            onClick={() => setPage(totalPages - 1)}
                            aria-disabled={page >= totalPages - 1}
                        >
                            Last
                        </PaginationLink>
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}