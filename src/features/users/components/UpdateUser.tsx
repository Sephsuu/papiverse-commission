import { ModalTitle } from "@/components/shared/ModalTitle";
import { UpdateButton } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFetchData } from "@/hooks/use-fetch-data";
import { useSearchFilter } from "@/hooks/use-search-filter";
import { BranchService } from "@/services/branch.service";
import { UserService } from "@/services/user.service";
import { Branch } from "@/types/branch";
import { User } from "@/types/user";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const genders = ["Male", "Female", "Others"];

interface Props {
    toUpdate: User;
    setUpdate: React.Dispatch<React.SetStateAction<User | undefined>>;
    setReload: React.Dispatch<React.SetStateAction<boolean>>;
}

export function UpdateUser({ toUpdate, setUpdate, setReload }: Props) {
    const { data: branches, loading, error } = useFetchData<Branch>(BranchService.getAllBranches);
    const { search, setSearch, filteredItems }  = useSearchFilter(branches!, ['branchName']);

    const [onProcess, setProcess] = useState(false);
    const [user, setUser] = useState<User>(toUpdate);

    const selectedBranch = branches!.find(
        (i) => i.branchId === Number(user.branch!.branchId)
    );

    useEffect(() => {
        if (branches!.length > 0 && user.branch) {
            const foundBranch = branches!.find(b => b.branchId === user.branch!.branchId);
            if (foundBranch) {
                setUser(prev => ({
                    ...prev,
                    branchId: String(foundBranch.branchId),
                    role: user.role
                }));
            }
        }
    }, [branches, user.branch]);

    async function handleSubmit() {
        try{         
            setProcess(true);
            const finalUser =  {
                id : user.id,
                branchId: Number(user.branchId),
                role: user.role
            }
            const data = await UserService.adminUpdate(finalUser);
            if (data) toast.success("User updated successfully!");    
        }
        catch(error){ toast.error(`${error}`) }
        finally { 
            setReload(prev => !prev);
            setProcess(false);      
            setUpdate(undefined);
        }
    }

    return(
        <Dialog open onOpenChange={ (open) => { if (!open) setUpdate(undefined) } }>
            <DialogContent className="overflow-y-auto">
                <ModalTitle label="Edit" spanLabel={ `${user.firstName} ${user.lastName}` } />
                <form
                    onSubmit={ e => {
                        e.preventDefault();
                        handleSubmit();
                    }}
                >
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1 col-span-2">
                            <div>Branch</div>
                            <Select 
                                value={ user.branchId ?? "" }
                                onValueChange={ (value) => setUser((prev: User) => ({
                                    ...prev,
                                    branchId: value
                                }))} 
                            >
                                <SelectTrigger className="w-full border-1 border-dark">
                                    <SelectValue 
                                        className="block w-[100px] truncate"
                                        placeholder={selectedBranch ? `${selectedBranch.branchName} Branch` : "Select Branch"}
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Krispy Papy Branches</SelectLabel>
                                        <Input 
                                            onChange={ e => setSearch(e.target.value) }
                                            placeholder="Search for branch"
                                        />
                                        {filteredItems.map((branch) => (
                                            <SelectItem value={ String(branch.branchId) } key={ branch.branchId! }>
                                                <span>{ branch.branchName } Branch</span>
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-1 col-span-2">
                            <div className="font-semibold mt-2">Select Role</div>
                            <RadioGroup  className="mt-2 flex" 
                                value={user.role} name="role" 
                                onValueChange={(value: string) => {
                                setUser((prev) => ({
                                    ...prev,
                                    role : value
                                }))
                            }}>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="FRANCHISOR" className="border-1 border-gray" id="r1" />
                                    <Label htmlFor="r1">Franchisor</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="FRANCHISEE" className="border-1 border-gray" id="r2" />
                                    <Label htmlFor="r2">Franchisee</Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>
                    <div className="flex justify-end gap-4">
                        <DialogClose className="text-sm">Close</DialogClose>
                        <UpdateButton 
                            type="submit"
                            onProcess={ onProcess }
                            label="Update User"
                            loadingLabel="Updating User"
                        />
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}