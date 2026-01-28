import Image from "next/image";
import { DialogTitle } from "../ui/dialog";
import { AlertDialogTitle } from "../ui/alert-dialog";

export function ModalTitle({ label, spanLabel, spanLabelClassName, isAlertDialog }: {
    label: string;
    spanLabel?: string;
    spanLabelClassName?: string
    isAlertDialog?: false | boolean
}) {
    if (isAlertDialog) return (
        <AlertDialogTitle className="flex items-center gap-2">  
            <Image
                src="/images/kp_logo.png"
                alt="KP Logo"
                width={40}
                height={40}
            />
            <div className="font-semibold text-xl">{ label } <span className={`text-darkorange ${spanLabelClassName}`}>{ spanLabel }</span></div>      
        </AlertDialogTitle>
    )
    return (
        <DialogTitle className="flex items-center gap-2">  
            <Image
                src="/images/kp_logo.png"
                alt="KP Logo"
                width={40}
                height={40}
            />
            <div className="font-semibold text-xl">{ label } <span className={`text-darkorange ${spanLabelClassName}`}>{ spanLabel }</span></div>      
        </DialogTitle>
    )
}