import { AddButton } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FormLoader } from "@/components/ui/loader";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { handleChange } from "@/lib/form-handle";
import { EmployeeService } from "@/services/employee.service";
import { ExpenseService } from "@/services/expense.service";
import { Claim } from "@/types/claims";
import { Employee } from "@/types/employee";
import { Expense, expenseFields, expenseInit } from "@/types/expense";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const paymentModes = ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer'];

interface Props {
    claims: Claim;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setReload: React.Dispatch<React.SetStateAction<boolean>>;
}

export function CreateExpense({ claims, setOpen, setReload }: Props) {
    const [loading, setLoading] = useState(true);
    const [onProcess, setProcess] = useState(false);
    const [expense, setExpense] = useState<Expense>(expenseInit);
    const [employees, setEmployees] = useState<Employee[]>([]);

    useEffect(() => {
        async function fetchData() {
            try {
                const data = await EmployeeService.getEmployeesByBranch(claims.branch.branchId);
                setEmployees(data);
            } catch (error) { toast.error(`${error}`) }
            finally { setLoading(false) }
        }  
        fetchData();
    }, [claims]);

    async function handleSubmit() {
        try {
            setProcess(true);
            let invalid = false;
            for (const field of expenseFields) {
                if (!expense[field]) {
                    invalid = true;
                }
            }
            if (invalid) {
                toast.info("Please fill up all fields!");
                setProcess(false);
                return
            }
            const data = await ExpenseService.createExpense(expense);
            if (data) {
                toast.success(`Expenditure for ${expense.purpose} added successfully.`);
                setReload(prev => !prev);
                setOpen(!open);
                setExpense(expenseInit);
            }
        } catch (error) { toast.error(`${error}`) }
        finally { setProcess(false) }
    }
    return(
        <Dialog open onOpenChange={ setOpen }>
            <DialogContent>
                <DialogTitle className="flex items-center gap-2">  
                    <Image
                        src="/images/kp_logo.png"
                        alt="KP Logo"
                        width={40}
                        height={40}
                    />
                    <div className="font-semibold text-xl">Add an Expenditure</div>      
                </DialogTitle>

                <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2 flex flex-col gap-1">
                        <div>Spender</div>
                        <Select
                            value={ expense.spenderId ? String(expense.spenderId) : "" }
                            onValueChange={ (value) => setExpense(prev => ({
                                ...prev,
                                spenderId: Number(value),
                            }))}
                        >
                            <SelectTrigger className="w-full border-1 border-gray">
                                <SelectValue placeholder="Select an Employee" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Employees</SelectLabel>
                                    {employees.map((item, index) => (
                                        <SelectItem key={ index } value={ String(item.id) }>{ `${item.firstName} ${item.middleName} ${item.lastName}` }</SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <div>Expense</div>
                        <div className="flex border-1 border-gray rounded-md">
                            <input
                                disabled
                                placeholder="₱"
                                className="border-0 w-10 placeholder:text-dark placeholder:text-center"
                            />
                            <Input 
                                className="border-0"
                                type="number"
                                name="expense"
                                value={ expense.expense }
                                onChange={ e => handleChange(e, setExpense) }
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <div>Mode of Payment</div>
                        <Select
                            value={ expense.paymentMode }
                            onValueChange={ (value) => setExpense(prev => ({
                                ...prev,
                                paymentMode: value,
                            }))}
                        >
                            <SelectTrigger className="w-full border-1 border-gray">
                                <SelectValue placeholder="Select Payment Mode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Payment Methods</SelectLabel>
                                    {paymentModes.map((item, index) => (
                                        <SelectItem key={ index } value={ item }>{ item }</SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-1 col-span-2">
                        <div>Expenditure Purpose</div>
                        <Textarea 
                            className="border-1 border-gray"
                            name="purpose"
                            value={ expense.purpose }
                            onChange={ e => handleChange(e, setExpense) }
                        />
                    </div>
                </div>
                <form 
                    className="flex justify-end gap-4"
                    onSubmit={ e => {
                        e.preventDefault();
                        handleSubmit();
                    }}
                >
                    <DialogClose className="text-sm">Close</DialogClose>
                    <AddButton 
                        type="submit"
                        onProcess={ onProcess }
                        label="Add Expenditure"
                        loadingLabel="Adding Expenditure"
                    />
                </form>
            </DialogContent>
        </Dialog>
    );
}