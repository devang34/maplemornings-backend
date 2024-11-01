// src/dto/auth.dto.ts

export interface SignUpDto {
  email: string;
  password: string;
  username: string;
  isAdmin?: boolean;
}

export interface SignInDto {
  password: string;
  name: string;
}
