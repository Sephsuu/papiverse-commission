"use client"

import { ModalTitle } from "@/components/shared/ModalTitle";
import { AddButton } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { displayCurrentDate } from "@/lib/formatter";
import { SalesService } from "@/services/sales.service";
import { PaidOrder } from "@/types/sales";
import { FileSpreadsheet, Upload } from "lucide-react";
import Image from "next/image";
import { Dispatch, SetStateAction, useRef, useState } from "react";
import { toast } from "sonner";

interface Props {
    setOpen: Dispatch<SetStateAction<boolean>>;
    setPaidOrdersPreview: Dispatch<SetStateAction<PaidOrder[]>>;
}

export function InsertPaidOrdersExcel({ setOpen, setPaidOrdersPreview }: Props)  {
    const [onProcess, setProcess] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setFileName(selectedFile.name);
        } else {
            setFile(null);
            setFileName("No excel file selected");
        }
    };

    const handleSubmit = async () => {
        try {
            setProcess(true);
            const data = await SalesService.readPaidOrders(file!);
            setPaidOrdersPreview(data);
            if (data) toast.success('Excel Read Success!');
        } catch (error) { toast.error(`${error}`) }
        finally { 
            setProcess(false); 
            setOpen(!open);
        }
    } 

    return(
        <Dialog open onOpenChange={ setOpen }>
            <DialogContent>
                <ModalTitle label="Insert Paid Orders Excel" />
                <form
                    className="flex flex-col gap-2"
                    onSubmit={ e => {
                        e.preventDefault();
                        handleSubmit();
                    }}
                >
                    <input
                        type="file"
                        accept=".xlsx,.xls"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <button 
                        type="button"
                        onClick={ handleButtonClick }
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center"
                    >
                        {fileName ? (
                            <FileSpreadsheet className="h-10 w-10 text-dark mx-auto mb-2" />
                        ) : (
                            <Upload className="h-10 w-10 text-gray mx-auto mb-2" />
                        )}
                        <p className={`text-gray text-sm mb-1 ${fileName && "!text-dark font-semibold"}`}>{ fileName ?? "No excel file selected" }</p>
                        <p className="text-xs text-gray">
                        Click the canvas to upload excel file (max 10MB each)
                        </p>
                    </button>
                    <div className="flex justify-end gap-4">
                        <DialogClose className="text-sm">Close</DialogClose>
                        <AddButton 
                            type="submit"
                            onProcess={ onProcess }
                            label="Insert Paid Orders"
                            loadingLabel="Inserting Paid orders"
                        />
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}