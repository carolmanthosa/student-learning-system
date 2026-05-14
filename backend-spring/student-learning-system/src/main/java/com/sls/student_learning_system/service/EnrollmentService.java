package com.sls.student_learning_system.service;

import com.sls.student_learning_system.dto.response.AssignmentResponse;
import com.sls.student_learning_system.dto.response.CourseResponse;
import com.sls.student_learning_system.dto.response.UserResponse;
import com.sls.student_learning_system.entity.Course;
import com.sls.student_learning_system.entity.Enrollment;
import com.sls.student_learning_system.entity.User;
import com.sls.student_learning_system.exception.DuplicateResourceException;
import com.sls.student_learning_system.exception.ResourceNotFoundException;
import com.sls.student_learning_system.repository.CourseRepository;
import com.sls.student_learning_system.repository.EnrollmentRepository;
import com.sls.student_learning_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllEnrollments() {
        try {
            log.info("Fetching all enrollments");
            return enrollmentRepository.findAll()
                    .stream()
                    .map(enrollment -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", enrollment.getId());
                        map.put("enrolledAt", enrollment.getCreatedAt() != null ?
                                enrollment.getCreatedAt().toString() : null);
                        Map<String, Object> student = new HashMap<>();
                        student.put("id", enrollment.getStudent().getId());
                        student.put("name", enrollment.getStudent().getName());
                        student.put("email", enrollment.getStudent().getEmail());
                        map.put("student", student);
                        Map<String, Object> course = new HashMap<>();
                        course.put("id", enrollment.getCourse().getId());
                        course.put("title", enrollment.getCourse().getTitle());
                        course.put("code", enrollment.getCourse().getCode() != null ?
                                enrollment.getCourse().getCode() : "");
                        map.put("course", course);
                        return map;
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching enrollments: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch enrollments: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<CourseResponse> getStudentEnrollments(Long studentId) {
        try {
            log.info("Fetching enrollments for student: {}", studentId);
            userRepository.findByIdAndDeletedFalse(studentId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Student not found with id: " + studentId));

            return enrollmentRepository.findByStudentId(studentId)
                    .stream()
                    .map(enrollment -> mapToCourseResponse(enrollment.getCourse()))
                    .collect(Collectors.toList());
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error fetching enrollments for student {}: {}", studentId, e.getMessage());
            throw new RuntimeException("Failed to fetch student enrollments");
        }
    }

    @Transactional
    public String enroll(Long studentId, Long courseId) {
        try {
            log.info("Enrolling student {} in course {}", studentId, courseId);
            User student = userRepository.findByIdAndDeletedFalse(studentId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Student not found with id: " + studentId));

            Course course = courseRepository.findByIdAndDeletedFalse(courseId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Course not found with id: " + courseId));

            if (enrollmentRepository.existsByStudentIdAndCourseId(studentId, courseId)) {
                throw new DuplicateResourceException(
                        "Student is already enrolled in this course");
            }

            Enrollment enrollment = Enrollment.builder()
                    .student(student)
                    .course(course)
                    .build();

            enrollmentRepository.save(enrollment);
            log.info("Student {} enrolled in course {} successfully", studentId, courseId);
            return "Student enrolled successfully";
        } catch (ResourceNotFoundException | DuplicateResourceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error enrolling student {} in course {}: {}",
                    studentId, courseId, e.getMessage());
            throw new RuntimeException("Failed to enroll student");
        }
    }

    @Transactional
    public String unenroll(Long studentId, Long courseId) {
        try {
            log.info("Unenrolling student {} from course {}", studentId, courseId);
            Enrollment enrollment = enrollmentRepository
                    .findByStudentIdAndCourseId(studentId, courseId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Enrollment not found for student " + studentId +
                            " and course " + courseId));

            enrollmentRepository.delete(enrollment);
            log.info("Student {} unenrolled from course {} successfully", studentId, courseId);
            return "Student unenrolled successfully";
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error unenrolling student {} from course {}: {}",
                    studentId, courseId, e.getMessage());
            throw new RuntimeException("Failed to unenroll student");
        }
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    private CourseResponse mapToCourseResponse(Course course) {
        List<AssignmentResponse> assignments = course.getAssignments() == null ? List.of() :
            course.getAssignments().stream()
                .map(a -> AssignmentResponse.builder()
                    .id(a.getId())
                    .title(a.getTitle())
                    .dueDate(a.getDueDate() != null ?
                        a.getDueDate().toLocalDate().toString() : null)
                    .build())
                .collect(Collectors.toList());

        return CourseResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .code(course.getCode())
                .description(course.getDescription())
                .instructor(course.getInstructor())
                .assignments(assignments)
                .createdAt(course.getCreatedAt())
                .updatedAt(course.getUpdatedAt())
                .build();
    }
}