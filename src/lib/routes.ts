import { BookMarked, ChartNoAxesCombined, CircleQuestionMark, Container, Ham, HandCoins, Logs, LucideIcon, Megaphone, MessageCircleMore, MessageCircleQuestionMark, Store, UserRound, UsersRound, Wallet } from "lucide-react";
import { hrtime } from "process";

export interface PapiverseRoute {
    title: string;
    icon: LucideIcon,
    href?: string;
    children: {
        title: string;
        href: string
    } []
}

export const adminRoute = [
    // { 
    //     title: 'Announcements', 
    //     icon: Megaphone,
    //     href: '/announcements',
    //     children: []
    // },
    { 
        title: 'Users', 
        icon: UserRound,
        href: '/users',
        children: []
    },
    { 
        title: 'Branches', 
        icon: Store,
        href: '/branches',
        children: []
    },
    { 
        title: 'Inventory', 
        icon: Container,
        children: [
            { title: 'Supplies Inventory', href: '/inventory/inventories' },
            { title: 'Raw Materials Inventory', href: '/inventory/raw-materials' },
            { title: 'Supply Orders', href: '/inventory/supply-orders' },
        ]
    },
    { 
        title: 'Finance', 
        icon: HandCoins,
        children: [
            { title: 'Expenses', href: '/finance/expenses' },
            { title: 'Supply Reports', href: '/finance/supply-reports' },
            { title: 'Supply Breakdown', href: '/finance/supply-breakdown' },
            { title: 'Raw Material Reports', href: '/finance/raw-material-reports' },
            { title: 'Raw Material Breakdown', href: '/finance/raw-material-breakdown' },
        ]
    },
    { 
        title: 'Logs', 
        icon: Logs,
        children: [
            { title: 'Supply Logs', href: '/logs/supplies' },
            { title: 'Supply Transactions', href: '/logs/supply-transactions' },
            { title: 'Raw Material Logs', href: '/logs/raw-materials' },
            { title: 'Raw Material Transactions', href: '/logs/raw-material-transactions' },
            { title: 'Branch Purchase Item', href: '/inventory/branch-purchase-item' },
        ]
    },
    // { 
    //     title: 'Sales', 
    //     icon: ChartNoAxesCombined,
    //     children: [
    //         // { title: 'Paid Orders', href: '/sales/paid-orders' },
    //         { title: 'Branch Sales', href: '/sales/branches' },
    //         { title: 'Product Sales Ranking', href: '/sales/product-ranking' },
    //         { title: 'Branch Sales Ranking', href: '/sales/branch-ranking' },
    //     ]
    // },
    // { 
    //     title: 'Messages', 
    //     icon: MessageCircleMore,
    //     href: '/messages',
    //     children: []
    // },
    { 
        title: 'Catalog', 
        icon: BookMarked,
        children: [
            { title: 'Supplies', href: '/catalog/supplies' },
            { title: 'Raw Materials', href: '/catalog/raw-materials' },
            // { title: 'Products', href: '/products' },
            // { title: 'Employee Positions', href: '/employees/positions' },
        ]
    },
    // { 
    //     title: 'Inquiries', 
    //     icon: MessageCircleQuestionMark,
    //     href: '/inquiries',
    //     children: []
    // },
    
    
]

export const franchiseeRoute = [
    // { 
    //     title: 'Announcements', 
    //     icon: Megaphone,
    //     href: '/announcements',
    //     children: []
    // },
    // { 
    //     title: 'Employees', 
    //     icon: UsersRound,
    //     href: '/employees',
    //     children: []
    // },
    { 
        title: 'Inventory', 
        icon: Container,
        children: [
            { title: 'Inventories', href: '/inventory/inventories' },
            { title: 'My Supply Orders', href: '/inventory/my-supply-orders/' },
            { title: 'Inventory Logs', href: '/logs/supplies' },
        ]
    },
    // { 
    //     title: 'Sales', 
    //     icon: ChartNoAxesCombined,
    //     children: [
    //         { title: 'Paid Orders', href: '/sales/paid-orders' },
    //     ]
    // },
    // { 
    //     title: 'Expenses', 
    //     icon: Wallet,
    //     href: '/expenses',
    //     children: []
    // },
    // { 
    //     title: 'Messages', 
    //     icon: MessageCircleMore,
    //     href: '/messages',
    //     children: []
    // },
    { 
        title: 'Catalog', 
        icon: BookMarked,
        children: [
            { title: 'Supplies', href: '/catalog/supplies' },
            { title: 'Raw Materials', href: '/catalog/raw-materials' },
            // { title: 'Products', href: '/products' },
        ]
    },
]