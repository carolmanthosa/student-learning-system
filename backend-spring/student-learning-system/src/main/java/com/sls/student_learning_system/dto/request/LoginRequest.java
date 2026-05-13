package com.sls.student_learning_system.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Schema(description = "Request body for user login")
public class LoginRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Schema(example = "carol@gmail.com")
    private String email;

    @NotBlank(message = "Password is required")
    @Schema(example = "password123")
    private String password;
}
