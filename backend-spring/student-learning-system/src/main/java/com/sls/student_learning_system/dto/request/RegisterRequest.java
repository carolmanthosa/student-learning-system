package com.sls.student_learning_system.dto.request;

import com.sls.student_learning_system.enums.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Schema(description = "Request body for user registration")
public class RegisterRequest {

    @NotBlank(message = "Name is required")
    @Schema(example = "Carol Mokoena")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Schema(example = "carol@gmail.com")
    private String email;

    @NotBlank(message = "Password is required")
    @Schema(example = "password123")
    private String password;

    @NotNull(message = "Role is required")
    @Schema(example = "STUDENT")
    private Role role;
}
