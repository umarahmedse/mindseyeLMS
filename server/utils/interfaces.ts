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
