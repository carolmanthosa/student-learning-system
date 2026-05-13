package com.sls.student_learning_system.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Schema(description = "Request body for creating or updating an assignment")
public class AssignmentRequest {

    @NotBlank(message = "Title is required")
    @Schema(example = "Java Arrays Assignment")
    private String title;

    @Schema(example = "Complete the array exercises")
    private String description;

    @Schema(example = "2026-06-30T23:59:00")
    private LocalDateTime dueDate;

    @NotNull(message = "Course ID is required")
    @Schema(example = "1")
    private Long courseId;
}
