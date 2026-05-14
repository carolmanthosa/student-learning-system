package com.sls.student_learning_system.service;

import com.sls.student_learning_system.dto.request.AssignmentRequest;
import com.sls.student_learning_system.dto.response.AssignmentResponse;
import com.sls.student_learning_system.entity.Assignment;
import com.sls.student_learning_system.entity.Course;
import com.sls.student_learning_system.entity.User;
import com.sls.student_learning_system.exception.ResourceNotFoundException;
import com.sls.student_learning_system.repository.AssignmentRepository;
import com.sls.student_learning_system.repository.CourseRepository;
import com.sls.student_learning_system.repository.EnrollmentRepository;
import com.sls.student_learning_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UserDetails;
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
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<AssignmentResponse> getAllAssignments(UserDetails currentUser) {
        try {
            log.info("Fetching assignments for user: {}", currentUser.getUsername());

            User user = userRepository.findByEmail(currentUser.getUsername())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            boolean isAdmin = user.getRole().name().equals("ADMIN");

            if (isAdmin) {
                // ADMIN sees all assignments
                return assignmentRepository.findAll()
                        .stream()
                        .map(this::mapToAssignmentResponse)
                        .collect(Collectors.toList());
            } else {
                // STUDENT only sees assignments for courses they're enrolled in
                List<Long> enrolledCourseIds = enrollmentRepository.findByStudentId(user.getId())
                        .stream()
                        .map(e -> e.getCourse().getId())
                        .collect(Collectors.toList());

                return assignmentRepository.findAll()
                        .stream()
                        .filter(a -> enrolledCourseIds.contains(a.getCourse().getId()))
                        .map(this::mapToAssignmentResponse)
                        .collect(Collectors.toList());
            }
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error fetching assignments: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch assignments");
        }
    }

    @Transactional(readOnly = true)
    public AssignmentResponse getAssignmentById(Long id, UserDetails currentUser) {
        try {
            Assignment assignment = assignmentRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Assignment not found with id: " + id));

            User user = userRepository.findByEmail(currentUser.getUsername())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            boolean isAdmin = user.getRole().name().equals("ADMIN");

            if (!isAdmin) {
                // Check student is enrolled in the course this assignment belongs to
                boolean isEnrolled = enrollmentRepository.existsByStudentIdAndCourseId(
                        user.getId(), assignment.getCourse().getId());

                if (!isEnrolled) {
                    throw new AccessDeniedException(
                            "You are not enrolled in the course for this assignment");
                }
            }

            return mapToAssignmentResponse(assignment);
        } catch (ResourceNotFoundException | AccessDeniedException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch assignment");
        }
    }

    @Transactional
    public AssignmentResponse createAssignment(AssignmentRequest request) {
        try {
            Course course = courseRepository.findByIdAndDeletedFalse(request.getParsedCourseId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Course not found with id: " + request.getParsedCourseId()));

            Assignment assignment = Assignment.builder()
                    .title(request.getTitle())
                    .description(request.getDescription())
                    .dueDate(request.getParsedDueDate())
                    .course(course)
                    .build();

            assignmentRepository.save(assignment);
            return mapToAssignmentResponse(assignment);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error creating assignment: {}", e.getMessage());
            throw new RuntimeException("Failed to create assignment: " + e.getMessage());
        }
    }

    @Transactional
    public AssignmentResponse updateAssignment(Long id, AssignmentRequest request) {
        try {
            Assignment assignment = assignmentRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Assignment not found with id: " + id));

            Course course = courseRepository.findByIdAndDeletedFalse(request.getParsedCourseId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Course not found with id: " + request.getParsedCourseId()));

            assignment.setTitle(request.getTitle());
            assignment.setDescription(request.getDescription());
            assignment.setDueDate(request.getParsedDueDate());
            assignment.setCourse(course);

            assignmentRepository.save(assignment);
            return mapToAssignmentResponse(assignment);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to update assignment: " + e.getMessage());
        }
    }

    @Transactional
    public String deleteAssignment(Long id) {
        try {
            Assignment assignment = assignmentRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Assignment not found with id: " + id));
            assignmentRepository.delete(assignment);
            return "Assignment deleted successfully";
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete assignment");
        }
    }

    private AssignmentResponse mapToAssignmentResponse(Assignment assignment) {
        return AssignmentResponse.builder()
                .id(assignment.getId())
                .title(assignment.getTitle())
                .description(assignment.getDescription())
                .dueDate(assignment.getDueDate() != null ?
                        assignment.getDueDate().toLocalDate().toString() : null)
                .courseId(assignment.getCourse().getId())
                .courseTitle(assignment.getCourse().getTitle())
                .createdAt(assignment.getCreatedAt())
                .updatedAt(assignment.getUpdatedAt())
                .build();
    }
}