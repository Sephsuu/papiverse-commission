import { AppSelect } from "@/components/shared/AppSelect";
import { ModalTitle } from "@/components/shared/ModalTitle";
import { AddButton } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ExpenseService } from "@/services/expense.service";
import { ExpenseCategory } from "@/types/expense";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { toast } from "sonner";

type Props = {
    categories: ExpenseCategory[];
    setOpen: Dispatch<SetStateAction<boolean>>;
    setReload: Dispatch<SetStateAction<boolean>>;
    onCreated?: () => void;
};

const ORDER_CATEGORIES = [
    { label: "MEAT", value: "MEAT" },
    { label: "SNOWFROST", value: "SNOWFROST" },
];

export function CreateExpenseCategory({
    categories,
    setOpen,
    setReload,
    onCreated,
}: Props) {
    const [onProcess, setProcess] = useState(false);
    const [category, setCategory] = useState({
        name: "",
        orderCategory: "MEAT",
        active: true,
    });

    const nextSortOrder = useMemo(() => {
        const lastSortOrder = categories.reduce((max, item) => {
            const sortOrder = Number(item.sortOrder ?? 0);
            return sortOrder > max ? sortOrder : max;
        }, 0);

        return lastSortOrder + 10;
    }, [categories]);

    async function handleSubmit() {
        const name = category.name.trim();

        if (!name) {
            toast.info("Please enter a category name.");
            return;
        }

        const duplicate = categories.some((item) => (
            item.name.trim().toUpperCase() === name.toUpperCase()
            && item.orderCategory.trim().toUpperCase() === category.orderCategory
        ));

        if (duplicate) {
            toast.info(`${name} already exists under ${category.orderCategory}.`);
            return;
        }

        try {
            setProcess(true);

            const data = await ExpenseService.createExpenseCategory({
                name,
                orderCategory: category.orderCategory,
                active: category.active,
                sortOrder: nextSortOrder,
            });

            if (data) {
                toast.success(`Expense category ${name} created successfully.`);
                setReload((prev) => !prev);
                onCreated?.();
                setOpen(false);
            }
        } catch (error) {
            toast.error(`${error}`);
        } finally {
            setProcess(false);
        }
    }

    return (
        <Dialog open onOpenChange={setOpen}>
            <DialogContent>
                <ModalTitle label="Create Expense Category" />

                <form
                    className="flex flex-col gap-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit();
                    }}
                >
                    <div className="flex flex-col gap-1">
                        <div>Category Name</div>
                        <Input
                            className="w-full border border-gray"
                            value={category.name}
                            onChange={(e) => setCategory((prev) => ({ ...prev, name: e.target.value }))}
                        />
                    </div>

                    <AppSelect
                        label="Order Category"
                        groupLabel="Categories"
                        items={ORDER_CATEGORIES}
                        value={category.orderCategory}
                        onChange={(value) => setCategory((prev) => ({ ...prev, orderCategory: value }))}
                        labelClassName="text-md"
                    />

                    {/* <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                            <div>Sort Order</div>
                            <Input
                                className="w-full border border-gray bg-slate-50"
                                value={nextSortOrder}
                                readOnly
                            />
                        </div>

                        <label className="flex items-center gap-2 self-end rounded-md border border-slate-200 px-3 py-2">
                            <Checkbox
                                checked={category.active}
                                onCheckedChange={(checked) => (
                                    setCategory((prev) => ({ ...prev, active: checked === true }))
                                )}
                            />
                            <span className="text-sm font-medium">Active</span>
                        </label>
                    </div> */}

                    <div className="mt-2 flex justify-end gap-4">
                        <DialogClose className="text-sm">Close</DialogClose>
                        <AddButton
                            type="submit"
                            onProcess={onProcess}
                            label="Create Category"
                            loadingLabel="Creating Category"
                        />
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
