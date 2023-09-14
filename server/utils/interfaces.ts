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
