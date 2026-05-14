package com.sls.student_learning_system.controller;

import com.sls.student_learning_system.dto.response.CourseResponse;
import com.sls.student_learning_system.service.EnrollmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/enrollments")
@RequiredArgsConstructor
@Tag(name = "Enrollments", description = "Enrollment management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all enrollments — ADMIN only")
    @ApiResponse(responseCode = "200", description = "Enrollments retrieved successfully")
    public ResponseEntity<List<Map<String, Object>>> getAllEnrollments() {
        return ResponseEntity.ok(enrollmentService.getAllEnrollments());
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT')")
    @Operation(summary = "Get all courses a student is enrolled in")
    @ApiResponse(responseCode = "200", description = "Enrollments retrieved successfully")
    @ApiResponse(responseCode = "404", description = "Student not found")
    public ResponseEntity<List<CourseResponse>> getStudentEnrollments(
            @PathVariable Long studentId) {
        return ResponseEntity.ok(enrollmentService.getStudentEnrollments(studentId));
    }

    @PostMapping("/{studentId}/{courseId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Enroll student in a course — ADMIN only")
    @ApiResponse(responseCode = "200", description = "Student enrolled successfully")
    @ApiResponse(responseCode = "404", description = "Student or course not found")
    @ApiResponse(responseCode = "409", description = "Student already enrolled")
    public ResponseEntity<String> enroll(
            @PathVariable Long studentId,
            @PathVariable Long courseId) {
        return ResponseEntity.ok(enrollmentService.enroll(studentId, courseId));
    }

    @DeleteMapping("/{studentId}/{courseId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Unenroll student from a course — ADMIN only")
    @ApiResponse(responseCode = "200", description = "Student unenrolled successfully")
    @ApiResponse(responseCode = "404", description = "Enrollment not found")
    public ResponseEntity<String> unenroll(
            @PathVariable Long studentId,
            @PathVariable Long courseId) {
        return ResponseEntity.ok(enrollmentService.unenroll(studentId, courseId));
    }
}