const vision = { 
    title: "Vision", 
    vision: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Perferendis culpa nesciunt, rem ducimus fugit architecto corrupti eligendi harum porro saepe neque, non quam, quas voluptatibus quos molestias et dolore iste?",
    imageUrl: "/images/"
}

export function VisionSection() {
    return(
        <section className="bg-slate-50 -mt-20 reveal-down">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="grayscale reveal-down" >
                <defs>
                    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#000" floodOpacity="0.35" />
                    </filter>
                    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="white" stopOpacity="0" />
                    <stop offset="100%" stopColor="white" stopOpacity="1" />
                    </linearGradient>
                </defs>

                <path filter="url(#shadow)" fill="#000" fillOpacity="1" d="M0,64L11.4,85.3C22.9,107,46,149,69,149.3C91.4,149,114,107,137,122.7C160,139,183,213,206,234.7C228.6,256,251,224,274,181.3C297.1,139,320,85,343,101.3C365.7,117,389,203,411,250.7C434.3,299,457,309,480,282.7C502.9,256,526,192,549,144C571.4,96,594,64,617,69.3C640,75,663,117,686,154.7C708.6,192,731,224,754,208C777.1,192,800,128,823,133.3C845.7,139,869,213,891,245.3C914.3,277,937,267,960,218.7C982.9,171,1006,85,1029,85.3C1051.4,85,1074,171,1097,186.7C1120,203,1143,149,1166,128C1188.6,107,1211,117,1234,133.3C1257.1,149,1280,171,1303,154.7C1325.7,139,1349,85,1371,58.7C1394.3,32,1417,32,1429,32L1440,32L1440,0L1428.6,0C1417.1,0,1394,0,1371,0C1348.6,0,1326,0,1303,0C1280,0,1257,0,1234,0C1211.4,0,1189,0,1166,0C1142.9,0,1120,0,1097,0C1074.3,0,1051,0,1029,0C1005.7,0,983,0,960,0C937.1,0,914,0,891,0C868.6,0,846,0,823,0C800,0,777,0,754,0C731.4,0,709,0,686,0C662.9,0,640,0,617,0C594.3,0,571,0,549,0C525.7,0,503,0,480,0C457.1,0,434,0,411,0C388.6,0,366,0,343,0C320,0,297,0,274,0C251.4,0,229,0,206,0C182.9,0,160,0,137,0C114.3,0,91,0,69,0C45.7,0,23,0,11,0L0,0Z"></path>
            </svg>

            <div className="z-20">
                <div className="text-center text-7xl font-bold">Our Vision</div>
                <div className="grid grid-cols-2">
                    <div className="pr-2 pl-12 text-2xl my-auto leading-relaxed">{ vision.vision }</div>
                    <div 
                        className="w-full h-80 bg-cover bg-center overflow-hidden flex justify-center items-center"
                    >
                        [IMAGE]
                    </div>
                </div>
            </div>
        </section>
    );
}