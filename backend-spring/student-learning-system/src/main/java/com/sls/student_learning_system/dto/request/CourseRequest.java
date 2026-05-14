package com.sls.student_learning_system.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Schema(description = "Request body for creating or updating a course")
public class CourseRequest {

    @NotBlank(message = "Title is required")
    @Schema(example = "Introduction to Java")
    private String title;

    @Schema(example = "CS101")
    private String code;

    @Schema(example = "Learn Java from scratch")
    private String description;

    @Schema(example = "Mr Dlamini")
    private String instructor;
}