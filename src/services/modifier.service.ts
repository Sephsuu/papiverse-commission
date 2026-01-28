import { BASE_URL } from "@/lib/urls";
import { requestData } from "./_config";
import { Announcement } from "@/types/announcement";
import { Modifier, ModifierItem } from "@/types/modifier";

const modifierGroupUrl = `${BASE_URL}/modifier-groups`;
const modifierItemUrl = `${BASE_URL}/modifier-items`;

export class ModifierGroupService {
    static async getAllModifierGroups() {
        return await requestData(
            `${modifierGroupUrl}/get-all`, 
            "GET",
        );
    }

    static async createModifierGroup(modifierGroup: Modifier) {
        return await requestData(
            `${modifierGroupUrl}/create`, 
            "POST",
            undefined,
            modifierGroup
        );
    }

    static async updateModifierGroup(modifierGroup: Modifier) {
        return await requestData(
            `${modifierGroupUrl}/update-by-id?id=${modifierGroup.id}`, 
            "POST",
            undefined,
            modifierGroup
        );
    }

    static async deleteModifierGroup(id: number) {
        return await requestData(
            `${modifierGroupUrl}/delete-by-id?id=${id}`, 
            "POST",
        );
    }
}

export class ModifierItemService {
    static async getAllModifierItems() {
        return await requestData(
            `${modifierItemUrl}/get-all`, 
            "GET",
        );
    }

    static async getByModifierGroup(id: number) {
        return await requestData(
            `${modifierItemUrl}/get-by-group?id=${id}`, 
            "GET",
        );
    }

    static async createModifierItem(modifierItem: Partial<ModifierItem>) {
        return await requestData(
            `${modifierItemUrl}/create`, 
            "POST",
            undefined,
            modifierItem
        );
    }

    static async updateModifierItem(modifierItem: Partial<ModifierItem>) {
        return await requestData(
            `${modifierItemUrl}/update-by-id?id=${modifierItem.id}`, 
            "POST",
            undefined,
            modifierItem
        );
    }

    static async deleteModifierItem(id: number) {
        return await requestData(
            `${modifierItemUrl}/delete-by-id?id=${id}`, 
            "POST",
        );
    }
}

