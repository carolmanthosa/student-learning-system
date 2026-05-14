package com.sls.student_learning_system.controller;

import com.sls.student_learning_system.dto.request.AssignmentRequest;
import com.sls.student_learning_system.dto.response.AssignmentResponse;
import com.sls.student_learning_system.service.AssignmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/assignments")
@RequiredArgsConstructor
@Tag(name = "Assignments", description = "Assignment management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class AssignmentController {

    private final AssignmentService assignmentService;

    // STUDENT only sees assignments for courses they're enrolled in
    // ADMIN sees all
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT')")
    @Operation(summary = "Get assignments — ADMIN sees all, STUDENT sees only enrolled courses")
    @ApiResponse(responseCode = "200", description = "Assignments retrieved successfully")
    public ResponseEntity<List<AssignmentResponse>> getAllAssignments(
            @AuthenticationPrincipal UserDetails currentUser) {
        return ResponseEntity.ok(assignmentService.getAllAssignments(currentUser));
    }

    // STUDENT can only view assignment if enrolled in that course
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT')")
    @Operation(summary = "Get assignment by ID — STUDENT must be enrolled in the course")
    @ApiResponse(responseCode = "200", description = "Assignment retrieved successfully")
    @ApiResponse(responseCode = "403", description = "Not enrolled in this course")
    @ApiResponse(responseCode = "404", description = "Assignment not found")
    public ResponseEntity<AssignmentResponse> getAssignmentById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails currentUser) {
        return ResponseEntity.ok(assignmentService.getAssignmentById(id, currentUser));
    }

    // ADMIN only
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create assignment — ADMIN only")
    @ApiResponse(responseCode = "200", description = "Assignment created successfully")
    @ApiResponse(responseCode = "404", description = "Course not found")
    public ResponseEntity<AssignmentResponse> createAssignment(
            @Valid @RequestBody AssignmentRequest request) {
        return ResponseEntity.ok(assignmentService.createAssignment(request));
    }

    // ADMIN only
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update assignment — ADMIN only")
    @ApiResponse(responseCode = "200", description = "Assignment updated successfully")
    @ApiResponse(responseCode = "404", description = "Assignment not found")
    public ResponseEntity<AssignmentResponse> updateAssignment(
            @PathVariable Long id,
            @Valid @RequestBody AssignmentRequest request) {
        return ResponseEntity.ok(assignmentService.updateAssignment(id, request));
    }

    // ADMIN only
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete assignment — ADMIN only")
    @ApiResponse(responseCode = "204", description = "Assignment deleted successfully")
    @ApiResponse(responseCode = "404", description = "Assignment not found")
    public ResponseEntity<Void> deleteAssignment(@PathVariable Long id) {
        assignmentService.deleteAssignment(id);
        return ResponseEntity.noContent().build();
    }
}