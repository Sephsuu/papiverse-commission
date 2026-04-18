import Image from "next/image";

const notices = [
  "Exclusively manufactured and distributed for KrispyPapi branches only.",
  "Not for resale or redistribution outside authorized outlets.",
] as const;

const assurancePoints = [
  {
    label: "Quality Assurance:",
    text: "Produced under strict quality control and verified before release.",
  },
  {
    label: "Important:",
    text: "KrispyPapi does not guarantee products obtained from unauthorized sellers.",
  },
] as const;

export default function KPProductPage() {
  return (
      <div className="mx-auto w-full overflow-hidden border border-[#cfcfcf] bg-white shadow-[0_18px_40px_rgba(0,0,0,0.14)]">
        <section className="grid grid-cols-[88px_1fr_116px] items-center gap-3 bg-white px-4 py-5 sm:grid-cols-[112px_1fr_152px] sm:px-5 sm:py-6">
          <div className="justify-self-start">
            <div className="flex w-fit flex-col items-center">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-[18px] border-[5px] border-[#111111] bg-white shadow-[inset_0_0_0_2px_rgba(255,255,255,0.8)] sm:h-[5.5rem] sm:w-[5.5rem]">
                <span className="absolute text-[1.8rem] font-black italic leading-none text-[#111111] sm:text-[2.45rem]">
                  P
                </span>
                <span className="absolute translate-x-[7px] translate-y-[1px] text-[1.8rem] font-black italic leading-none text-[#e13a32] sm:translate-x-[9px] sm:text-[2.45rem]">
                  R
                </span>
              </div>
              <div className="mt-2 text-center leading-none">
                <p className="text-[0.7rem] font-black uppercase tracking-[0.05em] text-[#101010] sm:text-[0.95rem]">
                  Papirenren
                </p>
                <p className="text-[0.34rem] font-semibold uppercase tracking-[0.08em] text-[#e13a32] sm:text-[0.48rem]">
                  Frozen Products Corp.
                </p>
              </div>
            </div>
          </div>

          <div className="px-1 text-center">
            <h1 className="text-[1.55rem] font-black uppercase leading-[0.95] tracking-[0.01em] text-[#c91913] sm:text-[2.3rem]">
              Authentic
              <br />
              KrispyPapi Product
            </h1>
          </div>

          <div className="justify-self-end">
            <Image
              src="/images/kp_logo.png"
              alt="KrispyPapi logo"
              width={180}
              height={180}
              className="h-auto w-[96px] sm:w-[136px]"
              priority
            />
          </div>
        </section>

        <section className="border-t border-[#b8b8b8] bg-black px-6 py-10 text-center text-white sm:px-10 sm:py-14">
          <div className="mx-auto max-w-[620px] space-y-9 sm:space-y-12">
            <div className="space-y-8 sm:space-y-11">
              {notices.map((notice) => (
                <p
                  key={notice}
                  className="text-[1.15rem] leading-[1.45] font-medium tracking-[0.01em] text-white/92 sm:text-[1.45rem]"
                >
                  {notice}
                </p>
              ))}
            </div>

            <div className="space-y-8 text-center sm:space-y-10">
              {assurancePoints.map((item) => (
                <p
                  key={item.label}
                  className="text-[1.1rem] leading-[1.4] font-medium text-white/92 sm:text-[1.35rem]"
                >
                  <span className="font-black text-white">{item.label}</span>{" "}
                  {item.text}
                </p>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#c82417] px-6 py-5 text-center text-white sm:px-10 sm:py-6">
          <p className="text-[1.35rem] font-black uppercase leading-none sm:text-[1.9rem]">
            Legal Warning:
          </p>
          <p className="mt-3 text-[1.15rem] leading-[1.35] font-medium sm:mt-4 sm:text-[1.45rem]">
            Reusing, copying, or duplicating this sticker is strictly
            prohibited and may lead to legal action.
          </p>
        </section>
      </div>
  );
}
