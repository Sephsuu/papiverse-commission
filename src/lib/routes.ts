import { BookMarked, Container, HandCoins, Logs, LucideIcon, Store, UserRound } from "lucide-react";

export interface PapiverseRoute {
    title: string;
    icon: LucideIcon,
    href?: string;
    children: {
        title: string;
        href: string
    } []
}

import { Claim } from "@/types/claims";

export interface PapiverseRoute {
    title: string;
    icon: LucideIcon,
    href?: string;
    children: {
        title: string;
        href: string
    } []
}

export function populateRouteMap(me: Claim | null) {
    if (!me) return []

    let routeMap: PapiverseRoute[] = []

    if (['FRANCHISOR', 'ADMIN', 'SUPERADMIN'].includes(me.roles[0])) {
        routeMap.push(...[
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
        ])

        if ([1, 2, 51, 31, 30, 49].includes(me.userId)) {
            routeMap.push({ 
                title: 'Finance', 
                icon: HandCoins,
                children: [
                    { title: 'Expenses', href: '/finance/expenses' },
                    { title: 'Commission Report', href: '/finance/commission-report' },
                    { title: 'Weekly Sales Report', href: '/finance/weekly-sales-report' },
                    { title: 'Payment Settlement', href: '/finance/payment-settlement' },
                    { title: 'Supply Reports', href: '/finance/supply-reports' },
                    { title: 'Supply Breakdown', href: '/finance/supply-breakdown' },
                    { title: 'Raw Material Reports', href: '/finance/raw-material-reports' },
                    { title: 'Raw Material Breakdown', href: '/finance/raw-material-breakdown' },
                    { title: 'Branch Profit Ranking', href: '/finance/branch-profit-ranking' },
                    { title: 'Branch PO Report', href: '/finance/branch-po-report' },
                    { title: 'Branch Payment Report', href: '/finance/branch-payment-report' },
                ]
            })
        }

        routeMap.push(...[
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
            { 
                title: 'Catalog', 
                icon: BookMarked,
                children: [
                    { title: 'Supplies', href: `/catalog/supplies` },
                    { title: 'Raw Materials', href: `/catalog/raw-materials` },
                ]
            },
        ])
    }

    if (['FRANCHISEE'].includes(me.roles[0])) {
        routeMap.push(...[
            { 
                title: 'Inventory', 
                icon: Container,
                children: [
                    { title: 'Inventories', href: '/inventory/inventories' },
                    { title: 'My Supply Orders', href: '/inventory/my-supply-orders/' },
                    { title: 'Inventory Logs', href: '/logs/supplies' },
                ]
            },
            { 
                title: 'Catalog', 
                icon: BookMarked,
                children: [
                    { title: 'Supplies', href: '/catalog/supplies' },
                    { title: 'Raw Materials', href: '/catalog/raw-materials' },
                    // { title: 'Products', href: '/products' },
                ]
            },
        ])
    }

    return routeMap
}