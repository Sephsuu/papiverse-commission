export function MissionSection() {
    return(
        <section className="relative h-full bg-slate-50">
            <div className="reveal-down">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
                    <defs>
                        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#000" floodOpacity="0.35" />
                        </filter>
                    </defs>
                    <path fill="#7b3306" fillOpacity="1" d="M0,96L80,122.7C160,149,320,203,480,229.3C640,256,800,256,960,240C1120,224,1280,192,1360,176L1440,160L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
                </svg>
                <svg className="-mt-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
                    <defs>
                        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#000" floodOpacity="0.35" />
                        </filter>
                    </defs>
                    <path filter="url(#shadow)" fill="#7b3306" fillOpacity="1" d="M0,192L10,202.7C20,213,40,235,60,213.3C80,192,100,128,120,96C140,64,160,64,180,106.7C200,149,220,235,240,261.3C260,288,280,256,300,218.7C320,181,340,139,360,133.3C380,128,400,160,420,160C440,160,460,128,480,122.7C500,117,520,139,540,154.7C560,171,580,181,600,160C620,139,640,85,660,69.3C680,53,700,75,720,101.3C740,128,760,160,780,165.3C800,171,820,149,840,149.3C860,149,880,171,900,170.7C920,171,940,149,960,144C980,139,1000,149,1020,144C1040,139,1060,117,1080,122.7C1100,128,1120,160,1140,170.7C1160,181,1180,171,1200,144C1220,117,1240,75,1260,96C1280,117,1300,203,1320,250.7C1340,299,1360,309,1380,288C1400,267,1420,213,1430,186.7L1440,160L1440,0L1430,0C1420,0,1400,0,1380,0C1360,0,1340,0,1320,0C1300,0,1280,0,1260,0C1240,0,1220,0,1200,0C1180,0,1160,0,1140,0C1120,0,1100,0,1080,0C1060,0,1040,0,1020,0C1000,0,980,0,960,0C940,0,920,0,900,0C880,0,860,0,840,0C820,0,800,0,780,0C760,0,740,0,720,0C700,0,680,0,660,0C640,0,620,0,600,0C580,0,560,0,540,0C520,0,500,0,480,0C460,0,440,0,420,0C400,0,380,0,360,0C340,0,320,0,300,0C280,0,260,0,240,0C220,0,200,0,180,0C160,0,140,0,120,0C100,0,80,0,60,0C40,0,20,0,10,0L0,0Z"></path>
                </svg>
            </div>

            <div className="absolute top-5/14 left-1/2 -translate-x-1/2 text-7xl font-bold text-white">Our Mission</div>
            <div className="grid grid-cols-2 -mt-10">
                <div className="flex text-2xl pr-2 pl-12">Lorem ipsum dolor sit amet consectetur adipisicing elit. Perferendis reprehenderit sequi in saepe pariatur ipsa omnis, ab natus praesentium! Odio, nam porro. Reiciendis culpa repudiandae enim quasi, similique odio cupiditate.</div>
                <div className="flex justify-center items-center">[IMAGE]</div>
            </div>
        </section>
    );
}