import { Injectable, inject } from "@angular/core";
import { AuthService } from "./auth/auth.service";

@Injectable({
  providedIn: "root",
})
export class RoleService {
  #userRole = inject(AuthService).userRole;

  hasRole(roles: string[]): boolean {
    const userRole = this.#userRole() as string;
    return roles.includes(userRole);
  }
}
