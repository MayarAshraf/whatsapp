import { computed, inject, Injectable } from '@angular/core';
import { map, tap } from 'rxjs';
import { localStorageSignal } from '../../helpers/utils';
import { ApiService } from '../global-services/api.service';
import {
  ForgetModel,
  LoginModel,
  ResetModel,
  VerifyModel,
} from '../global-services/global';
import { User, UserData } from './service-types';

export interface credentials {
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  #api = inject(ApiService);

  /*****************************************/
  // current user
  #CURRENT_USER_KEY = 'current-user-key';

  #currentUser = localStorageSignal<User | null>(null, this.#CURRENT_USER_KEY); // private to this service.

  currentUser = this.#currentUser.asReadonly(); // exposed publicly.

  updateCurrentUser(user: User | null) {
    this.#currentUser.set(user);
  }

  /*****************************************/

  // access token
  #ACCESS_TOKEN_KEY = 'access-token-key';

  #accessToken = localStorageSignal<string | null>(
    null,
    this.#ACCESS_TOKEN_KEY
  ); // private to this service.

  accessToken = this.#accessToken.asReadonly(); // exposed publicly.

  updateAccessToken(token: string | null) {
    this.#accessToken.set(token);
  }

  /*****************************************/

  isLoggedIn = computed<boolean>(() => !!this.accessToken());

  /*****************************************/

  // refresh token
  #REFRESH_TOKEN_KEY = 'refresh-token-key';

  #refreshToken = localStorageSignal<string | null>(
    null,
    this.#REFRESH_TOKEN_KEY
  ); // private to this service.

  refreshToken = this.#refreshToken.asReadonly(); // exposed publicly.

  updateRefreshToken(token: string | null) {
    this.#refreshToken.set(token);
  }

  /*****************************************/
  #ROLE = 'role-user';
  #roleUser = localStorageSignal<string | null>(null, this.#ROLE);
  roleUser = this.#roleUser.asReadonly(); // exposed publicly.

  updateRole(role: string | null) {
    this.#roleUser.set(role);
  }

  userRole = computed<string | null>(() => this.roleUser());

  login(credentials: LoginModel) {
    return this.#api
      .request('post', 'login', credentials)
      .pipe(tap(({ data }) => this.doLogin(data)));
  }

  forgetPassword(credentials: ForgetModel) {
    return this.#api.request('post', 'auth/forget-password', credentials);
  }

  resetPassword(credentials: ResetModel) {
    return this.#api
      .request('post', 'auth/reset-password', credentials)
      .pipe(tap(({ data }) => this.doLogin(data)));
  }

  verifyPassword(credentials: VerifyModel) {
    return this.#api.request(
      'post',
      'user/verify-token-reset-expire',
      credentials
    );
  }

  logout() {
    return this.#api
      .request('post', 'auth/logout', {})
      .pipe(tap(() => this.doLogout()));
  }

  doLogin(data: UserData) {
    this.updateCurrentUser(data.user);
    this.updateAccessToken(data.accessToken);
    this.updateRole(data.user.role.slug);
  }

  doLogout() {
    this.updateCurrentUser(null);
    this.updateAccessToken(null);
    this.updateRole(null);
  }

  refreshAccessToken() {
    const requestBody = {
      refreshToken: this.refreshToken(),
    };
    return this.#api
      .request('post', 'user/oauth/token', requestBody)
      .pipe(map(({ data }) => data));
  }
}
