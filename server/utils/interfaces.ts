export interface InterfaceRegistrationBody {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}
export interface InterfaceActivationToken {
  token: string;
  activationCode: string;
}
export interface InterfaceActivationRequest {
  activation_token: string;
  activation_code: string;
}
export interface InterfaceLoginUser {
  email: string;
  password: string;
}
export interface InterfaceTokenOptions {
  expires: Date;
  maxAge: number;
  httpOnly: boolean;
  sameSite: "lax" | "strict" | "none" | undefined;
  secure?: boolean;
}
export interface InterfaceSocialLogin {
  email: string;
  password: string;
  name: string;
}
export interface InterfaceUpdateUserInfo {
  email: string;
  name: string;
}
export interface InterfaceUpdateUserPassword {
  oldPassword: string;
  newPassword: string;
}
export interface InterfaceUpdateProfilePicture {
  avatar: string;
}
