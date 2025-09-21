export interface ODataInterface {
  value: [];
}

export interface ApiResponse<T> {
  Success: boolean;
  Message?: string;
  Errors?: string[];
  Data?: T;
}

export class ModalResult<T> {
  data!: T | null;
  success!: boolean;

  constructor(data: T | null = null, success: boolean = false) {
    this.data = data;
    this.success = success;
  }
}