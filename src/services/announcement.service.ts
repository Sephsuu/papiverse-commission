import { BASE_URL } from "@/lib/urls";
import { requestData } from "./_config";
import { Announcement } from "@/types/announcement";

const url = `${BASE_URL}/announcements`;

export class AnnouncementService {
    static async getAllAnnouncements() {
        return await requestData(`${url}/get-announcements`, "GET");
    }

    static async getAnnouncementById(id: number | string) {
        return await requestData(`${url}/get-announcement?id=${id}`, "GET");
    }

    static async createAnnouncement(announcement: Announcement, images: File[]) {
        const formData = new FormData();
        formData.append("userId", announcement.userId.toString());
        images.forEach((file) => {
        formData.append("images", file);
        });
        formData.append("content", announcement.content);
        formData.append("datePosted", announcement.datePosted);

        return await requestData(`${url}/create`, "POST", undefined, formData);
    }

    static async updateAnnouncement(announcement: Announcement) {
        return await requestData(`${url}/update-announcement`, "POST", undefined, announcement);
    }

    static async deleteAnnouncement(id: number) {
        return await requestData(`${url}/delete?id=${id}`, "POST");
    }
}
