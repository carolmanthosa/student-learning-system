package com.sls.student_learning_system.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileResponse {
    private Long id;
    private String bio;
    private String avatarUrl;
    private UserResponse student;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}