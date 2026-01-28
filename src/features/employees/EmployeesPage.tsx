"use client"

import { PapiverseLoading } from "@/components/ui/loader";
import { useAuth } from "@/hooks/use-auth";
import { Employee } from "@/types/employee";
import { Info, Mail, SquarePen, Trash2 } from "lucide-react";
import { useState } from "react";
import { useFetchData } from "@/hooks/use-fetch-data";
import { useSearchFilter } from "@/hooks/use-search-filter";
import { usePagination } from "@/hooks/use-pagination";
import { AppHeader } from "@/components/shared/AppHeader";
import { TableFilter } from "@/components/shared/TableFilter";
import { TablePagination } from "@/components/shared/TablePagination";
import { EmployeeService } from "@/services/employee.service";
import { CreateEmployee } from "./components/CreateEmployee";
import { UpdateEmployee } from "./components/UpdateEmployee";
import { DeleteEmployee } from "./components/DeleteEmployee";
import { AppAvatar } from "@/components/shared/AppAvatar";

const columns = [
    { title: "Full Name & Position", style: "col-span-2" },
    { title: "E-mail Address", style: "" },
    { title: "Actions", style: "" },
];

export function EmployeesPage() {
    const [reload, setReload] = useState(false);
    const { claims, loading: authLoading } = useAuth();
    const { data, loading } = useFetchData<Employee>(
        EmployeeService.getEmployeesByBranch,
        [claims.branch.branchId, reload],
        [claims.branch.branchId]
    );
    const { search, setSearch, filteredItems } = useSearchFilter(data, ["firstName", "lastName"]);
    const { page, setPage, size, setSize, paginated } = usePagination(filteredItems, 20);

    const [open, setOpen] = useState(false);
    const [toUpdate, setUpdate] = useState<Employee>();
    const [toDelete, setDelete] = useState<Employee>();

    if (loading || authLoading) return <PapiverseLoading />;

    return (
        <section className="stack-md animate-fade-in-up overflow-hidden max-md:mt-12">
            <AppHeader label='All Employees' />

            <TableFilter
                setSearch={setSearch}
                searchPlaceholder="Search for an employee"
                setOpen={setOpen}
                buttonLabel="Add an employee"
                size={size}
                setSize={setSize}
            />

            <div className="table-wrapper">
                <div className="thead grid grid-cols-4">
                    {columns.map((item, i) => (
                        <div key={i} className={`th ${item.style}`}>
                            {item.title}
                        </div>
                    ))}
                </div>

                <div className="animate-fade-in-up" key={page}>
                    {paginated.length > 0 ? (
                        paginated.map((item, index) => (
                            <div className="tdata grid grid-cols-4" key={index}>
                                <div className="td col-span-2 flex items-center gap-2">
                                    <AppAvatar fallback={ `${item.firstName[0]}${item.lastName[0]}` } />
                                    <div>
                                        <div className="font-semibold">
                                            {`${item.lastName}, ${item.firstName} ${item.middleName}`}
                                        </div>
                                        <div className="text-gray">{item.position}</div>
                                    </div>
                                </div>
                                <div className="td flex items-center gap-1">
                                    <Mail className="w-4 h-4" />
                                    <span className="text-sm">{item.email}</span>
                                </div>
                                <div className="td flex-center-y gap-2">
                                    <button onClick={() => setUpdate(item)}>
                                        <SquarePen className="w-4 h-4 text-darkgreen" />
                                    </button>
                                    <button>
                                        <Info className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setDelete(item)}>
                                        <Trash2 className="w-4 h-4 text-darkred" />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="my-2 text-sm text-center col-span-6">
                            There are no existing employees yet.
                        </div>
                    )}
                </div>
            </div>

            <TablePagination
                data={data}
                paginated={ paginated }
                page={page}
                size={size}
                setPage={setPage}
            />

            {open && (
                <CreateEmployee
                    claims={claims}
                    setOpen={setOpen}
                    setReload={ setReload }
                />
            )}

            {toUpdate && (
                <UpdateEmployee
                    claims={claims}
                    toUpdate={toUpdate}
                    setUpdate={setUpdate}
                    setReload={ setReload }
                />
            )}

            {toDelete && (
                <DeleteEmployee
                    toDelete={toDelete}
                    setDelete={setDelete}
                    setReload={ setReload }
                />
            )}
        </section>
    );
}
