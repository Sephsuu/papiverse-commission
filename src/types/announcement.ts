export interface Announcement {
    userId: number;
    content: string;
    announcementImages: string[];
    datePosted: string;

    announcementId?: number;
    firstName?: string;
    lastName?: string;
    branchName?: string;
}

export const announcementInit: Announcement = {
    userId: 0,
    content: '',
    announcementImages: [],
    datePosted: new Date().toISOString(),
};

