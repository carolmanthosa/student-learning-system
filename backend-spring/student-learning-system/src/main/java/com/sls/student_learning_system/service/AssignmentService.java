package com.sls.student_learning_system.service;

import com.sls.student_learning_system.dto.request.AssignmentRequest;
import com.sls.student_learning_system.dto.response.AssignmentResponse;
import com.sls.student_learning_system.entity.Assignment;
import com.sls.student_learning_system.entity.Course;
import com.sls.student_learning_system.exception.ResourceNotFoundException;
import com.sls.student_learning_system.repository.AssignmentRepository;
import com.sls.student_learning_system.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final CourseRepository courseRepository;

    // Get all assignments
    public List<AssignmentResponse> getAllAssignments() {
        try {
            log.info("Fetching all assignments");
            return assignmentRepository.findAll()
                    .stream()
                    .map(this::mapToAssignmentResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching assignments: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch assignments");
        }
    }

    // Get assignment by ID
    public AssignmentResponse getAssignmentById(Long id) {
        try {
            log.info("Fetching assignment with id: {}", id);
            Assignment assignment = assignmentRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Assignment not found with id: " + id));
            return mapToAssignmentResponse(assignment);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error fetching assignment {}: {}", id, e.getMessage());
            throw new RuntimeException("Failed to fetch assignment");
        }
    }

    // Create assignment
    @Transactional
    public AssignmentResponse createAssignment(AssignmentRequest request) {
        try {
            log.info("Creating assignment: {}", request.getTitle());
            Course course = courseRepository.findByIdAndDeletedFalse(request.getCourseId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Course not found with id: " + request.getCourseId()));

            Assignment assignment = Assignment.builder()
                    .title(request.getTitle())
                    .description(request.getDescription())
                    .dueDate(request.getDueDate())
                    .course(course)
                    .build();

            assignmentRepository.save(assignment);
            log.info("Assignment created successfully with id: {}", assignment.getId());
            return mapToAssignmentResponse(assignment);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error creating assignment: {}", e.getMessage());
            throw new RuntimeException("Failed to create assignment");
        }
    }

    // Update assignment
    @Transactional
    public AssignmentResponse updateAssignment(Long id, AssignmentRequest request) {
        try {
            log.info("Updating assignment with id: {}", id);
            Assignment assignment = assignmentRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Assignment not found with id: " + id));

            Course course = courseRepository.findByIdAndDeletedFalse(request.getCourseId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Course not found with id: " + request.getCourseId()));

            assignment.setTitle(request.getTitle());
            assignment.setDescription(request.getDescription());
            assignment.setDueDate(request.getDueDate());
            assignment.setCourse(course);

            assignmentRepository.save(assignment);
            log.info("Assignment {} updated successfully", id);
            return mapToAssignmentResponse(assignment);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error updating assignment {}: {}", id, e.getMessage());
            throw new RuntimeException("Failed to update assignment");
        }
    }

    // Delete assignment
    @Transactional
    public String deleteAssignment(Long id) {
        try {
            log.info("Deleting assignment with id: {}", id);
            Assignment assignment = assignmentRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Assignment not found with id: " + id));

            assignmentRepository.delete(assignment);
            log.info("Assignment {} deleted successfully", id);
            return "Assignment deleted successfully";
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error deleting assignment {}: {}", id, e.getMessage());
            throw new RuntimeException("Failed to delete assignment");
        }
    }

    // Mapper
    private AssignmentResponse mapToAssignmentResponse(Assignment assignment) {
        return AssignmentResponse.builder()
                .id(assignment.getId())
                .title(assignment.getTitle())
                .description(assignment.getDescription())
                .dueDate(assignment.getDueDate())
                .courseId(assignment.getCourse().getId())
                .courseTitle(assignment.getCourse().getTitle())
                .createdAt(assignment.getCreatedAt())
                .updatedAt(assignment.getUpdatedAt())
                .build();
    }
}