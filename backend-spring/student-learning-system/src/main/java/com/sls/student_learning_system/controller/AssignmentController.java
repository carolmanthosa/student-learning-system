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
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/assignments")
@RequiredArgsConstructor
@Tag(name = "Assignments", description = "Assignment management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class AssignmentController {

    private final AssignmentService assignmentService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT')")
    @Operation(summary = "Get all assignments")
    @ApiResponse(responseCode = "200", description = "Assignments retrieved successfully")
    public ResponseEntity<List<AssignmentResponse>> getAllAssignments() {
        return ResponseEntity.ok(assignmentService.getAllAssignments());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT')")
    @Operation(summary = "Get assignment by ID")
    @ApiResponse(responseCode = "200", description = "Assignment retrieved successfully")
    @ApiResponse(responseCode = "404", description = "Assignment not found")
    public ResponseEntity<AssignmentResponse> getAssignmentById(@PathVariable Long id) {
        return ResponseEntity.ok(assignmentService.getAssignmentById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create assignment — ADMIN only")
    @ApiResponse(responseCode = "200", description = "Assignment created successfully")
    @ApiResponse(responseCode = "404", description = "Course not found")
    public ResponseEntity<AssignmentResponse> createAssignment(
            @Valid @RequestBody AssignmentRequest request) {
        return ResponseEntity.ok(assignmentService.createAssignment(request));
    }

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

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete assignment — ADMIN only")
    @ApiResponse(responseCode = "200", description = "Assignment deleted successfully")
    @ApiResponse(responseCode = "404", description = "Assignment not found")
    public ResponseEntity<String> deleteAssignment(@PathVariable Long id) {
        return ResponseEntity.ok(assignmentService.deleteAssignment(id));
    }
}