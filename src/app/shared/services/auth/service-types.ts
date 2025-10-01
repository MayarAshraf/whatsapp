export interface UserData {
  accessToken: string;
  expires_in: number;
  user: User;
}

export interface User {
  id: number;
  role: string;
  name: string;
  email: string;
  photo: string;
}
