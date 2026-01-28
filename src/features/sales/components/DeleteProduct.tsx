import { ModalTitle } from "@/components/shared/ModalTitle";
import { DeleteButton } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { ProductService } from "@/services/product.service";
import { UserService } from "@/services/user.service";
import { Product } from "@/types/products";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
    toDelete: Product;
    setDelete: React.Dispatch<React.SetStateAction<Product | undefined>>;
    setReload: React.Dispatch<React.SetStateAction<boolean>>;
}

export function DeleteProduct({ toDelete, setDelete, setReload }: Props) {
    const [onProcess, setProcess] = useState(false);

    async function handleDelete() {
        try {
            setProcess(true);
            await ProductService.deleteProduct(toDelete.id!);
            toast.success(`Product ${toDelete.name} deleted successfully.`)
        } catch (error) { toast.error(`${error}`) }
        finally { 
            setProcess(false); 
            setDelete(undefined);
            setReload(prev => !prev); 
        }
    }

    return(
        <Dialog open={ !!toDelete } onOpenChange={ (open) => { if (!open) setDelete(undefined) } }>
            <DialogContent>
                <ModalTitle 
                    label="Delete" 
                    spanLabel={ `${toDelete.name}?` } 
                    spanLabelClassName="!text-darkred"
                />
                    <form 
                        className="flex justify-end items-center gap-4"
                        onSubmit={ e => {
                            e.preventDefault();
                            handleDelete();
                        }}
                    >
                        <DialogClose>Close</DialogClose>
                        <DeleteButton 
                            type="submit"
                            onProcess={ onProcess }
                            label="Delete Product"
                            loadingLabel="Deleting Product"
                        />
                    </form>
            </DialogContent>
        </Dialog>
    );
}