import { BASE_URL } from "@/lib/urls";
import { requestData } from "./_config";
import { KPEvent } from "@/types/event";

const url = `${BASE_URL}/events`;

export class EventService {
    static async getEventsByDate(date: string) {
        return await requestData(
            `${url}/get-by-date?date=${date}`,
            "GET",
        );
    }

    static async createEvent(event: Partial<KPEvent>) {
        return await requestData(
            `${url}/create`,
            "POST",
            undefined,
            event
        );
    }

    static async updateEvent(event: Partial<KPEvent>) {
        return await requestData(
            `${url}/update`,
            "POST",
            undefined,
            event
        );
    } 

    static async deleteEvent(id: number) {
        return await requestData(
            `${url}/delete-by-id?id=${id}`,
            "POST",
        );
    } 
}