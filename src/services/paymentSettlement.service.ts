import { BASE_URL } from "@/lib/urls";
import { requestData } from "./_config";

const paymentSettlementsUrl = `${BASE_URL}/payment-settlements`;
const settlementReportsUrl = `${BASE_URL}/settlement-reports`;

export type SettlementEntryType = "DEBT" | "PAYMENT";

export interface CreateSettlementGroupRequest {
    name: string;
    description?: string;
    personNames: string[];
}

export interface AddPersonToGroupRequest {
    displayName: string;
}

export interface CreateLedgerEntryRequest {
    fromPersonId: number;
    toPersonId: number;
    amount: number;
    entryType: SettlementEntryType;
    weekLabel?: string;
    description?: string;
    recordedAt?: string | null;
}

export interface UpdateLedgerEntryRequest {
    fromPersonId: number;
    toPersonId: number;
    amount: number;
    entryType: SettlementEntryType;
    weekLabel?: string;
    description?: string;
    recordedAt?: string | null;
}

export interface PairSummaryQuery {
    personAId: number;
    personBId: number;
    month?: number;
    year?: number;
}

export interface SoftDeleteLedgerEntryRequest {
    deletedBy: string;
}

export class PaymentSettlementService {
    static async getWeeklySettlementReport(year: number, month: number, week: number) {
        const params = new URLSearchParams({
            year: String(year),
            month: String(month),
            week: String(week),
        });

        return await requestData(
            `${settlementReportsUrl}/weekly?${params.toString()}`,
            "GET"
        );
    }

    static async getMonthlySettlementReport(year: number, month: number) {
        const params = new URLSearchParams({
            year: String(year),
            month: String(month),
        });

        return await requestData(
            `${settlementReportsUrl}/monthly?${params.toString()}`,
            "GET"
        );
    }

    static async createSettlementGroup(payload: CreateSettlementGroupRequest) {
        return await requestData(
            `${paymentSettlementsUrl}/groups`,
            "POST",
            undefined,
            payload
        );
    }

    static async getSettlementGroups() {
        return await requestData(`${paymentSettlementsUrl}/groups`, "GET");
    }

    static async getSettlementGroupById(settlementGroupId: number) {
        return await requestData(
            `${paymentSettlementsUrl}/groups/${settlementGroupId}`,
            "GET"
        );
    }

    static async addPersonToGroup(
        settlementGroupId: number,
        payload: AddPersonToGroupRequest
    ) {
        return await requestData(
            `${paymentSettlementsUrl}/groups/${settlementGroupId}/people`,
            "POST",
            undefined,
            payload
        );
    }

    static async createLedgerEntry(
        settlementGroupId: number,
        payload: CreateLedgerEntryRequest
    ) {
        return await requestData(
            `${paymentSettlementsUrl}/groups/${settlementGroupId}/entries`,
            "POST",
            undefined,
            payload
        );
    }

    static async getLedgerEntriesByGroup(settlementGroupId: number, month : string) {
        return await requestData(
            `${paymentSettlementsUrl}/groups/${settlementGroupId}/entries?month=${month}`,
            "GET"
        );
    }

    static async updateLedgerEntry(
        ledgerEntryId: number,
        payload: UpdateLedgerEntryRequest
    ) {
        return await requestData(
            `${paymentSettlementsUrl}/entries/${ledgerEntryId}`,
            "PUT",
            undefined,
            payload
        );
    }

    static async getPairSummary(
        settlementGroupId: number,
        query: PairSummaryQuery
    ) {
        const hasMonth = query.month !== undefined;
        const hasYear = query.year !== undefined;

        if (hasMonth !== hasYear) {
            throw new Error("Both month and year are required together.");
        }

        const params = new URLSearchParams({
            personAId: String(query.personAId),
            personBId: String(query.personBId),
        });

        if (hasMonth && hasYear) {
            params.set("month", String(query.month));
            params.set("year", String(query.year));
        }

        return await requestData(
            `${paymentSettlementsUrl}/groups/${settlementGroupId}/pair-summary?${params.toString()}`,
            "GET"
        );
    }

    static async getMultiPersonBalance(settlementGroupId: number) {
        return await requestData(
            `${paymentSettlementsUrl}/groups/${settlementGroupId}/balances`,
            "GET"
        );
    }

    static async softDeleteLedgerEntry(
        ledgerEntryId: number,
        payload: SoftDeleteLedgerEntryRequest
    ) {
        return await requestData(
            `${paymentSettlementsUrl}/entries/${ledgerEntryId}`,
            "DELETE",
            undefined,
            payload
        );
    }
}
