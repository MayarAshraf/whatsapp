import { inject } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from "@angular/router";
import { RoleService } from "../services/role.service";

export const RoleGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const userRole = inject(RoleService);
  const router = inject(Router);

  const hasRole = route.data.roles.index;
  const redirect = `/${route.data.roles.redirectTo}`;

  if (hasRole?.length && userRole.hasRole(hasRole)) return true;
  router.navigate([redirect]);
  return false;
};
