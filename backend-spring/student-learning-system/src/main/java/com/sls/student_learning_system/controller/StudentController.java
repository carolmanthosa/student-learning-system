package com.sls.student_learning_system.controller;

import com.sls.student_learning_system.dto.request.RegisterRequest;
import com.sls.student_learning_system.dto.response.AuthResponse;
import com.sls.student_learning_system.dto.response.CourseResponse;
import com.sls.student_learning_system.dto.response.UserResponse;
import com.sls.student_learning_system.service.AuthService;
import com.sls.student_learning_system.service.StudentService;
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
@RequestMapping("/students")
@RequiredArgsConstructor
@Tag(name = "Students", description = "Student management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class StudentController {

    private final StudentService studentService;
    private final AuthService authService;

    // ADMIN only — create student
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new student — ADMIN only")
    @ApiResponse(responseCode = "200", description = "Student created successfully")
    public ResponseEntity<AuthResponse> createStudent(
            @Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    // ADMIN only — list all students
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all students — ADMIN only")
    @ApiResponse(responseCode = "200", description = "Students retrieved successfully")
    public ResponseEntity<List<UserResponse>> getAllStudents() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    // ADMIN or the student themselves
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @studentSecurity.isSelf(authentication, #id)")
    @Operation(summary = "Get student by ID — ADMIN or self")
    @ApiResponse(responseCode = "200", description = "Student retrieved successfully")
    @ApiResponse(responseCode = "404", description = "Student not found")
    public ResponseEntity<UserResponse> getStudentById(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getStudentById(id));
    }

    // ADMIN or the student themselves — update
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @studentSecurity.isSelf(authentication, #id)")
    @Operation(summary = "Update student — ADMIN or self")
    @ApiResponse(responseCode = "200", description = "Student updated successfully")
    @ApiResponse(responseCode = "404", description = "Student not found")
    public ResponseEntity<UserResponse> updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(studentService.updateStudent(id, request));
    }

    // ADMIN only — delete student
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete student — ADMIN only")
    @ApiResponse(responseCode = "200", description = "Student deleted successfully")
    @ApiResponse(responseCode = "404", description = "Student not found")
    public ResponseEntity<String> deleteStudent(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.deleteStudent(id));
    }

    // ADMIN or the student themselves — view their courses
    @GetMapping("/{id}/courses")
    @PreAuthorize("hasRole('ADMIN') or @studentSecurity.isSelf(authentication, #id)")
    @Operation(summary = "Get courses for a student — ADMIN or self")
    @ApiResponse(responseCode = "200", description = "Courses retrieved successfully")
    @ApiResponse(responseCode = "404", description = "Student not found")
    public ResponseEntity<List<CourseResponse>> getStudentCourses(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getStudentCourses(id));
    }

    // ADMIN only — enroll student
    @PostMapping("/{id}/enroll/{courseId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Enroll student in a course — ADMIN only")
    @ApiResponse(responseCode = "200", description = "Student enrolled successfully")
    @ApiResponse(responseCode = "409", description = "Student already enrolled")
    public ResponseEntity<String> enrollStudent(
            @PathVariable Long id,
            @PathVariable Long courseId) {
        return ResponseEntity.ok(studentService.enrollStudent(id, courseId));
    }

    // ADMIN only — unenroll student
    @DeleteMapping("/{id}/unenroll/{courseId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Unenroll student from a course — ADMIN only")
    @ApiResponse(responseCode = "200", description = "Student unenrolled successfully")
    @ApiResponse(responseCode = "404", description = "Enrollment not found")
    public ResponseEntity<String> unenrollStudent(
            @PathVariable Long id,
            @PathVariable Long courseId) {
        return ResponseEntity.ok(studentService.unenrollStudent(id, courseId));
    }
}