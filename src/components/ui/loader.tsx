import { LoaderCircle } from "lucide-react";
import Image from "next/image";
import { Sidebar, SidebarContent } from "./sidebar";
import { Skeleton } from "./skeleton";
import { Dialog, DialogContent, DialogTitle } from "./dialog";
import { cn } from "@/lib/utils";

interface LoaderProps {
    onProcess: boolean;
    label: string;
    loadingLabel: string;
}

export function FormLoader({ onProcess, label, loadingLabel }: LoaderProps) {
    if (onProcess) return <><LoaderCircle className="w-4 h-4 text-light animate-spin" />{ loadingLabel }</>
    else return <>{ label }</>
}

export function PapiverseLoading({ className }: { className?: string }) {
    return(
        <section className={ `flex-center w-full h-full ${className}` }>
            <div className="animate-bounce">
                <Image
                    src="/images/papiverse_logo.png"
                    alt="Papiverse Logo"
                    width={200}
                    height={200}
                />
                <div className="text-lg text-center">LOADING</div>
            </div>
        </section>
    );
}

export function SectionLoading({ className }: {
    className?: string
}) {
    return (
        <section className={`w-full py-24 ${className}`}>
            <div className="mx-auto flex-center flex-col animate-bounce">
                <Image
                    src="/images/papiverse_logo.png"
                    alt="Papiverse Logo"
                    width={200}
                    height={200}
                />
                <div className="text-lg text-center">LOADING</div>
            </div>
        </section>
    )
}

export function ModalLoader() {
    return (
        <Dialog open>
            <DialogContent>
                <DialogTitle></DialogTitle>
                <SectionLoading />
            </DialogContent>
        </Dialog>
    )
}

export function SidebarLoading() {
    return(
        <section>
            <Sidebar
                variant="floating" 
                collapsible="icon"
            >
                <SidebarContent 
                    className="rounded-md p-4"
                    style={{ backgroundImage: "url(/images/sidebar_bg.svg)" }}
                >
            
                    <Skeleton className="w-40 mx-auto h-12 bg-orange-100" />
                    <Skeleton className="w-full mt-2 h-8 bg-orange-100" />
                    <Skeleton className="w-full h-8 bg-orange-100" />
                    <Skeleton className="w-full h-8 bg-orange-100" />
                    <Skeleton className="w-full h-8 bg-orange-100" />
                </SidebarContent>
                
            </Sidebar>
        </section>
    );
}


type LoaderPageProps = {
  imageAlt?: string;
  size?: number;
  className?: string;
};

export function MainLoader({
    text = "Loading, please wait...",
}: {
    text?: string;
}) {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
            {/* Logo */}
            <div className="animate-pulse">
                <Image
                    src="/images/kp_logo.png"   // 🔴 CHANGE THIS TO YOUR BUSINESS LOGO PATH
                    alt="Loading"
                    width={120}
                    height={120}
                    priority
                />
            </div>

            {/* Text */}
            <p className="mt-4 text-sm font-medium text-gray-600">
                {text}
            </p>
        </div>
    );
}