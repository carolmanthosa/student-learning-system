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

    @Schema(example = "2026-06-30")
    private String dueDate;

    @NotNull(message = "Course ID is required")
    @Schema(example = "1")
    private Object courseId;

    public LocalDateTime getParsedDueDate() {
        if (dueDate == null || dueDate.isEmpty()) return null;
        if (dueDate.contains("T")) return LocalDateTime.parse(dueDate);
        return LocalDateTime.parse(dueDate + "T00:00:00");
    }

    public Long getParsedCourseId() {
        if (courseId == null) return null;
        return Long.parseLong(courseId.toString());
    }
}