import Image from "next/image";

export function ErrorPage({ error, className }: {
    error: string;
    className?: string
}) {
    return(
        <section className={`relative w-full h-screen ${className}`}>
            <div className="absolute flex-center flex-col gap-2 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center -mt-8">
                <Image 
                    src="/images/papiverse_logo.png"
                    alt="Papiverse Logo"
                    width={400}
                    height={400}
                />
                <div className="font-bold text-4xl">500 | {error}.</div>
                <div>Please contact the developers.</div>
            </div>
            
        </section>
    );
}