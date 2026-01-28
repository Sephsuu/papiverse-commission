import Image from "next/image";

export default function UnauthorizedPage() {
    return(
        <section className="relative w-full h-screen">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center -mt-8">
                <Image 
                    src="/images/papiverse_logo.png"
                    alt="Papiverse Logo"
                    width={400}
                    height={400}
                />
                <div className="font-bold text-4xl">401 | Unauthorized</div>
            </div>
        </section>
    );
}