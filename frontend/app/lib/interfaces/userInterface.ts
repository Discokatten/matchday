export interface Message {
  username: string;
  chatId: string;
  date: string;
  message: string;
}

export interface AuthResponse {
  token?: string;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}
