export type ChangeEntry = {
    id: string;
    title: string;
    date: string;
    summary: string;
    area: string;
    beforeImage?: string;
    afterImage?: string;
    beforeLabel?: string;
    afterLabel?: string;
};

export const changes: ChangeEntry[] = [
    {
        id: "finance-branch-profit-ranking-dashboard",
        title: "Branch profit ranking dashboard added.",
        date: "2026-04-26",
        area: "Finance",
        summary: "Nadagdag na po ang BRANCH PROFIT RANKING dashboard sa Finance. May date-period picker, summary cards, branch profit chart, at ranked table gamit ang branch profit ranking API para mas mabilis ang monitoring ng overall/meat/snow profits per branch.",
    },
    {
        id: "finance-supply-profit-computation-aligned-to-monitoring-excel",
        title: "Supply report and breakdown computation updated.",
        date: "2026-04-26",
        area: "Finance",
        summary: "Binago na po natin yung computation ng SUPPLY REPORT at SUPPLY BREAKDOWN para i-align sa Excel file na ginagamit ninyo sa profit monitoring. Pareho na po ngayon ng computation flow/reference style para mas tugma ang lumalabas sa system at sa manual monitoring ninyo.",
    },
    {
        id: "finance-branch-po-profit-report",
        title: "Branch PO profit report added.",
        date: "2026-04-26",
        area: "Finance",
        summary: "Nadagdag na po ang BRANCH PURCHASE ORDER PROFIT REPORT para makita ang profit performance ng kada purchase order per branch based sa PO-related data.",
    },
    {
        id: "finance-po-profit-report",
        title: "PO profit report added.",
        date: "2026-04-26",
        area: "Finance",
        summary: "Nadagdag na rin po ang PURCHASE ORDER PROFIT REPORT (click nyo lang po yung PO number sa Branch PO Report) para may dedicated view ng profit per purchase order.",
    },
    {
        id: "branch-purchase-item-redesign",
        title: "Branch purchase item page redesigned.",
        date: "2026-04-26",
        area: "Logs",
        summary: "Ni-redesign na po ang BRANCH PURCHASE ITEM page para mas madaling i-review ang data. May tabbed views na po for SUPPLY ITEMS at BRANCHES, improved filtering/sorting/pagination behavior, at clearer table presentation ng ordered items at ordering branches.",
    },
    {
        id: "navigation-sidebar-restructure",
        title: "Sidebar navigation regrouped.",
        date: "2026-04-16",
        area: "Navigation",
        summary: "Ni-restructure na po natin yung sidebar para mas malinaw ang grouping ng modules. Sa INVENTORY, naka-separate na po ang Supplies Inventory, Raw Materials Inventory, at Supply Orders. Sa FINANCE, hinati na rin po ang Supply at Raw Material reports/breakdown. Nagkaroon na rin po ng sariling LOGS section para sa supply at raw material logs/transactions, at nadagdagan ang CATALOG ng Raw Materials page.",
        beforeImage: "/images/sidebar-before-update.png",
        afterImage: "/images/sidebar-after-update.png",
        beforeLabel: "Before",
        afterLabel: "After",
    },
    {
        id: "raw-material-pages-and-services",
        title: "Raw materials pages added.",
        date: "2026-04-16",
        area: "Inventory",
        summary: "Nagkaroon na po ng dedicated RAW MATERIALS INVENTORY page at RAW MATERIALS catalog page. In-update na rin po ang inventory at supply services para suportahan ang raw material type filtering at hiwalay na raw material records sa fetch ng data.",
    },
    {
        id: "finance-supply-and-raw-material-split",
        title: "Finance pages split by inventory type.",
        date: "2026-04-16",
        area: "Finance",
        summary: "Pinalitan na po natin yung dating generic INVENTORY REPORTS at INVENTORY BREAKDOWN pages into separate SUPPLY REPORTS, SUPPLY BREAKDOWN, RAW MATERIAL REPORTS, at RAW MATERIAL BREAKDOWN para mas specific at mas madaling i-review ang finance data per inventory type.",
    },
    {
        id: "dedicated-logs-pages",
        title: "Logs moved into dedicated pages.",
        date: "2026-04-16",
        area: "Logs",
        summary: "Yung dating INVENTORY LOGS at TRANSACTION SUMMARY flow ay hinati na po into dedicated pages for SUPPLY LOGS, SUPPLY TRANSACTIONS, RAW MATERIAL LOGS, at RAW MATERIAL TRANSACTIONS. Kasama pa rin po ang BRANCH PURCHASE ITEM under logs-related workflow para mas maayos na ang navigation.",
    },
    {
        id: "supplies-catalog-moved-and-filter-input-fix",
        title: "Catalog route updates and filter polish.",
        date: "2026-04-16",
        area: "Catalog",
        summary: "Inilipat na po ang SUPPLIES page under CATALOG at dinagdagan ng RAW MATERIALS entry. Kasabay nito, inayos din po natin ang reusable table search field para controlled na ang input value at mas consistent ang filter behavior sa pages na gumagamit nito.",
    },
    {
        id: "supply-orders-franchisor-badges-and-shortage-tooltip",
        title: "Supply orders franchisor badges.",
        date: "2026-04-01",
        area: "Supply Orders",
        summary: "Sa SUPPLY ORDERS pending page po, yung SHORT at READY badges ay visible na lang po for FRANCHISOR. Kapag FRANCHISEE naman po, STATUS badge lang po ang makikita. Meron na rin pong indicator upon viewing ng supply orders kapag may shortage na item ang isang PO. Kapag hinover po yung short indicator ng PO, lalabas po yung SHORTAGE ON STOCK TODAY at SHORTAGE FOR EXPECTED DELIVERY per item.",
    },
    {
        id: "supply-orders-custom-other-items",
        title: "Custom other items in PO.",
        date: "2026-04-01",
        area: "Supply Orders",
        summary: "Yung mga custom OTHER ITEMS na ina-add habang nag o-order under MEAT at SNOW, sinama na rin po namin sa PO. Note lang din po na yung OTHER ITEMS na ito ay nasa PO lang po at hindi po sila included sa SALES.",
    },
    {
        id: "supply-orders-po-number-by-expected-delivery",
        title: "PO number auto-adjust by delivery date.",
        date: "2026-04-01",
        area: "Supply Orders",
        summary: "Sa PO po, kapag nagseset ng EXPECTED DELIVERY, automatic na pong nag-aadjust yung PO NUMBER based sa expected delivery date na na-specify.",
    },
    {
        id: "inventory-transaction-summary-sorting-and-date-guard",
        title: "Transaction summary sorting.",
        date: "2026-04-01",
        area: "Inventory",
        summary: "Sa TRANSACTION SUMMARY page po, meron na pong sorting option tulad ng nasa INVENTORY REPORT BREAKDOWN. Pwede na po mag-sort by ALPHABETICAL, TOTAL IN, at TOTAL OUT. Sa UPDATE INVENTORY naman po, disabled na rin po ngayon yung future dates sa EFFECTIVE DATE picker.",
    },
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
