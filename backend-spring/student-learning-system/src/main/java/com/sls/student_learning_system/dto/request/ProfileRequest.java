package com.sls.student_learning_system.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProfileRequest {

    @NotBlank(message = "Bio is required")
    private String bio;

    private String avatarUrl;

    private Long studentId;
}