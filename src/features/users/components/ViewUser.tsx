import { AppAvatar } from "@/components/shared/AppAvatar";
import { ModalTitle } from "@/components/shared/ModalTitle";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { NEXT_URL } from "@/lib/urls";
import { User } from "@/types/user";
import { Dispatch, SetStateAction } from "react";

export function ViewUser({
    toView,
    setView
}: {
    toView: User;
    setView: Dispatch<SetStateAction<User | undefined>>;
}) {
    return (
        <Dialog open onOpenChange={(open) => { if (!open) setView(undefined); }}>
            <DialogContent className="max-h-10/11 overflow-y-auto">
                <ModalTitle
                    label="User Information"
                    spanLabel={`${toView.firstName} ${toView.lastName}`}
                />

                <div className="flex flex-col items-center gap-3 py-2">
                    <AppAvatar
                        src={`${NEXT_URL}/${toView.imageUrl}`}
                        fallback={`${toView.firstName![0]}${toView.lastName![0]}`}
                        className="w-24 h-24 mx-auto"
                        fallbackClassName="text-3xl bg-darkbrown text-light"
                    />

                    <div className="text-center text-sm">
                        <div className="font-semibold">
                            {toView.firstName} {toView.lastName}
                        </div>
                        <div className="text-gray-500">{toView.role}</div>
                        <div className="text-gray-500">{toView.position}</div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mt-4">
                    <div className="font-medium text-gray-600">Username</div>
                    <div>{toView.username}</div>

                    <div className="font-medium text-gray-600">Email</div>
                    <div>{toView.email}</div>

                    <div className="font-medium text-gray-600">Contact</div>
                    <div>{toView.contactNumber}</div>

                    <div className="font-medium text-gray-600">Gender</div>
                    <div>{toView.gender}</div>

                    <div className="font-medium text-gray-600">Birth Date</div>
                    <div>{toView.dateOfBirth}</div>
                </div>

                <div className="mt-5 rounded-md border p-3 text-sm">
                    <div className="font-semibold mb-2">Branch Information</div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        <div className="font-medium text-gray-600">Branch</div>
                        <div>{toView.branch?.name}</div>

                        <div className="font-medium text-gray-600">City</div>
                        <div>{toView.branch?.city}</div>

                        <div className="font-medium text-gray-600">Province</div>
                        <div>{toView.branch?.province}</div>

                        <div className="font-medium text-gray-600">Status</div>
                        <div>{toView.branch?.status}</div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
