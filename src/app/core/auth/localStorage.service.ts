import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class LocalStorageService {
    // Access Token
    set accessToken(token: string) {
        localStorage.setItem('accessToken', token);
    }
    get accessToken(): string {
        return localStorage.getItem('accessToken') ?? '';
    }

    // Refresh Token (store securely; here we use localStorage, or switch to cookie)
    set refreshToken(token: string) {
        localStorage.setItem('refreshToken', token);
    }
    get refreshToken(): string {
        return localStorage.getItem('refreshToken') ?? '';
    }

    // CID
    set cid(value: string) {
        localStorage.setItem('cid', value);
    }
    get cid(): string {
        return localStorage.getItem('cid') ?? '';
    }

    // UID
    set uid(value: string) {
        localStorage.setItem('uid', value);
    }
    get uid(): string {
        return localStorage.getItem('uid') ?? '';
    }

    // EID
    set eid(value: string) {
        localStorage.setItem('eid', value);
    }
    get eid(): string {
        return localStorage.getItem('eid') ?? '';
    }

    // EID
    set isMultipleEntity(value: string) {
        localStorage.setItem('isMultipleEntity', value);
    }
    get isMultipleEntity(): string {
        return localStorage.getItem('isMultipleEntity') ?? '';
    }

    // Password Change
    set isPasswordChanged(value: string) {
        localStorage.setItem('isPasswordChanged', value);
    }

    get isPasswordChanged(): string {
        return localStorage.getItem('isPasswordChanged') ?? '';
    }

    set isDistributor(value: string) {
        localStorage.setItem('isDistributor', value);
    }
    get isDistributor(): string {
        return localStorage.getItem('isDistributor') ?? 'false';
    }

    // Clear All (Only These Keys)
    clearAll(): void {
        ['isMultipleEntity','accessToken','refreshToken', 'cid', 'uid', 'eid', 'isPasswordChange', 'isDistributor'].forEach((key) =>
            localStorage.removeItem(key)
        );
    }
}
