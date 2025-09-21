import { Injectable } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable({
    providedIn: 'root',
})
export class MessageModalService {
    constructor(private message: NzMessageService) {}

    success(message: string): void {
        this.message.success(message);
    }
    warning(message: string): void {
        this.message.warning(message);
    }
    info(message: string): void {
        this.message.info(message);
    }
    loading(message: string) {
        this.message.loading(message);
    }
    error(message: string) {
        this.message.error(message);
    }
    action(message: string) {
        const id = this.message.loading(message, { nzDuration: 0 }).messageId;
        setTimeout(() => {
            this.message.remove(id);
        }, 2500);
    }
}
