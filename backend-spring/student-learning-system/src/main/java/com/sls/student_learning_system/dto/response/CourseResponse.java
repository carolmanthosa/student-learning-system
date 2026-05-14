package com.sls.student_learning_system.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Course information returned in responses")
public class CourseResponse {

    @Schema(example = "1")
    private Long id;

    @Schema(example = "Introduction to Java")
    private String title;

    @Schema(example = "CS101")
    private String code;

    @Schema(example = "Learn Java from scratch")
    private String description;

    @Schema(example = "Mr Dlamini")
    private String instructor;

    private List<AssignmentResponse> assignments;  // ← add this
    private List<EnrollmentResponse> enrollments;  // ← add this

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}