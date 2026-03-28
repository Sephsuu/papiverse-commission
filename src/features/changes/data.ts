export type ChangeEntry = {
    id: string;
    title: string;
    date: string;
    summary: string;
    area: string;
};

export const changes: ChangeEntry[] = [
    {
        id: "inventory-effective-date",
        title: "Inventory effective date.",
        date: "2026-03-26",
        area: "Inventory",
        summary: "Sa pag APPROVE NG ORDERS upon confirming meron po kami in-add na date selection for effective date pati narin po sa MANUAL INPUT at PRODUCTION INPUT, yun po ay kung kailan nyo gusto mangyari yung approval po ng order/input na yun. Automatic magrereflect na po yun sa inventory and logs pati narin po sa finance.",
    },
    {
        id: "supplies-inventory-source",
        title: "Supplies inventory source.",
        date: "2026-03-28",
        area: "Inventory",
        summary: "Sa SUPPLIES po, meron na pong INVENTORY SOURCE. Bali pwede nyo na pong i-assign kung anong parent inventory yung source ng isang supply or variant. Halimbawa po sa RETASO REKOS, kapag ang inventory source nya po ay RETASO KARNE, magiging variant po sya ng RETASO KARNE. Kaya kapag umorder po kayo ng RETASO REKOS at i-out po yun, yung mababawas po sa inventory ay yung RETASO KARNE.",
    },
    {
        id: "supply-orders-pagination-fix",
        title: "Price history update.",
        date: "2026-03-26",
        area: "Inventory",
        summary: "Sinama na rin po namin yung UNIT COST sa PRICE HISTORY.",
    },
    {
        id: "inventory-order-logs-grouping",
        title: "Inventory order logs grouping.",
        date: "2026-03-28",
        area: "Inventory",
        summary: "Sa INVENTORY LOGS po, grinoup na rin po namin yung mga PO para hindi na po kayo mahirapan i-identify kung saan galing na order yung log na yun. Pwede nyo na rin po i-view mismo yung order mula sa inventory log.",
    },
    {
        id: "supply-orders-current-stock-toggle",
        title: "Current stock badge toggle.",
        date: "2026-03-28",
        area: "Supply Orders",
        summary: "Sa VIEW ORDER page po, pwede na po i-hide at i-unhide yung current stock badge per item. Tinatandaan na rin po ng system yung last selected visibility habang active yung tab/session nyo para hindi na sya bumabalik sa default kada lipat ng order tab.",
    },
    {
        id: "inventory-report-profit-colors",
        title: "Negative profit styling",
        date: "2026-03-26",
        area: "Finance",
        summary: "Under ng FINANCE yung INVENTORY REPORTS page, ginawa na din po namin red yung text color if yung profit ay negative. Sa EXPENSES page naman po, pwede na rin mag filter by DAILY, WEEKLY, at MONTHLY, at ang default view po ay MONTHLY.",
    },
    {
        id: "supply-orders-period-filter",
        title: "Supply orders date filtering",
        date: "2026-03-26",
        area: "Supply Orders",
        summary: "Sa supply orders page po, pwede na po kayo mag filter ng the PO by date, MONTHLY, WEEKLY, and DAILY para din po hindi loaded yung data hindi na ifefetch lahat.",
    },
    {
        id: "inventory-period-pickers",
        title: "Added an inventory breakdown.",
        date: "2026-03-26",
        area: "Inventory",
        summary: "In case po di nyo pa po nakikita, may in-add po kami na INVENTORY BREAKDOWN unde INVENTORIES page, bali naka tab po sya (nasa upper right po ng page).",
    },
    {
        id: "supply-orders-missing-po-fix",
        title: "Resolved missing PO issue.",
        date: "2026-03-28",
        area: "Supply Orders",
        summary: "Na-resolve na rin po namin yung issue sa mga nawawalang PO.",
    },
];
