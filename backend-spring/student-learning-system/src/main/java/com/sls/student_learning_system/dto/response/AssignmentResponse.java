package com.sls.student_learning_system.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Assignment information returned in responses")
public class AssignmentResponse {

    @Schema(example = "1")
    private Long id;

    @Schema(example = "Java Arrays Assignment")
    private String title;

    @Schema(example = "Complete the array exercises")
    private String description;

    @Schema(example = "2026-06-30")
    private String dueDate;

    @Schema(example = "1")
    private Long courseId;

    @Schema(example = "Introduction to Java")
    private String courseTitle;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}