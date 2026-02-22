package com.trafficlens.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

public class AuthDtos {

    @Data
    public static class RegisterRequest {
        @NotBlank(message = "Full name is required")
        private String fullName;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;
    }

    @Data
    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;
    }

    @Data
    public static class AuthResponse {
        private String accessToken;
        private String tokenType = "Bearer";
        private UserDto user;

        public AuthResponse(String accessToken, UserDto user) {
            this.accessToken = accessToken;
            this.user = user;
        }
    }

    @Data
    public static class UserDto {
        private String id;
        private String email;
        private String fullName;
        private String role;
    }

    @Data
    public static class UpdateProfileRequest {
        @NotBlank(message = "Full name is required")
        private String fullName;
    }

    @Data
    public static class ChangePasswordRequest {
        @NotBlank
        private String currentPassword;

        @NotBlank
        @Size(min = 6)
        private String newPassword;
    }
}
