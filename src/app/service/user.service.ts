import { Injectable } from '@angular/core';

export interface IPermissions {is_staff: boolean; data: string[];};

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private user_permissions: Set<string>;
  is_staff: boolean = false;

  constructor() {
      this.user_permissions = new Set<string>();
      this.loadPermission();
   }

   private loadPermission(): void {
     const windowNew = window as unknown as { PERMISSIONS: any };
     const result: IPermissions= windowNew.PERMISSIONS;
     this.is_staff = result.is_staff;
        for (let i: number = 0; i < result.data.length; i++) {
          this.user_permissions.add(result.data[i]);
        }
        console.log('Permissions', this.user_permissions);
   }

  has(key: string | string[]) : boolean {
    if (typeof(key) === 'string')
      return this.user_permissions.has(key);
    else {
      for (let i: number = 0; i < key.length; i++) {
        if (!this.user_permissions.has(key[i]))
          return false;
      }
      return true;
    }
  }
}
