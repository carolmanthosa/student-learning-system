package com.sls.student_learning_system.service;

import com.sls.student_learning_system.dto.request.RegisterRequest;
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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StudentService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final PasswordEncoder passwordEncoder;

    // Get all students
    public List<UserResponse> getAllStudents() {
        try {
            log.info("Fetching all students");
            return userRepository.findAllByDeletedFalse()
                    .stream()
                    .map(this::mapToUserResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching students: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch students");
        }
    }

    // Get student by ID
    public UserResponse getStudentById(Long id) {
        try {
            log.info("Fetching student with id: {}", id);
            User user = userRepository.findByIdAndDeletedFalse(id)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Student not found with id: " + id));
            return mapToUserResponse(user);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error fetching student {}: {}", id, e.getMessage());
            throw new RuntimeException("Failed to fetch student");
        }
    }

    // Update student
    @Transactional
    public UserResponse updateStudent(Long id, RegisterRequest request) {
        try {
            log.info("Updating student with id: {}", id);
            User user = userRepository.findByIdAndDeletedFalse(id)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Student not found with id: " + id));

            if (!user.getEmail().equals(request.getEmail()) &&
                    userRepository.existsByEmail(request.getEmail())) {
                throw new DuplicateResourceException("Email already in use");
            }

            user.setName(request.getName());
            user.setEmail(request.getEmail());
            if (request.getPassword() != null && !request.getPassword().isEmpty()) {
                user.setPassword(passwordEncoder.encode(request.getPassword()));
            }
            user.setRole(request.getRole());

            userRepository.save(user);
            log.info("Student {} updated successfully", id);
            return mapToUserResponse(user);
        } catch (ResourceNotFoundException | DuplicateResourceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error updating student {}: {}", id, e.getMessage());
            throw new RuntimeException("Failed to update student");
        }
    }

    // Delete student
    @Transactional
    public String deleteStudent(Long id) {
        try {
            log.info("Deleting student with id: {}", id);
            User user = userRepository.findByIdAndDeletedFalse(id)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Student not found with id: " + id));
            userRepository.delete(user);
            log.info("Student {} deleted successfully", id);
            return "Student deleted successfully";
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error deleting student {}: {}", id, e.getMessage());
            throw new RuntimeException("Failed to delete student");
        }
    }

    // Get student courses
    public List<CourseResponse> getStudentCourses(Long studentId) {
        try {
            log.info("Fetching courses for student: {}", studentId);
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
            log.error("Error fetching courses for student {}: {}", studentId, e.getMessage());
            throw new RuntimeException("Failed to fetch student courses");
        }
    }

    // Enroll student in course
    @Transactional
    public String enrollStudent(Long studentId, Long courseId) {
        try {
            log.info("Enrolling student {} in course {}", studentId, courseId);

            userRepository.findByIdAndDeletedFalse(studentId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Student not found with id: " + studentId));

            Course course = courseRepository.findByIdAndDeletedFalse(courseId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Course not found with id: " + courseId));

            if (enrollmentRepository.existsByStudentIdAndCourseId(studentId, courseId)) {
                throw new DuplicateResourceException("Student is already enrolled in this course");
            }

            User student = userRepository.findByIdAndDeletedFalse(studentId).get();
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
            log.error("Error enrolling student {} in course {}: {}", studentId, courseId, e.getMessage());
            throw new RuntimeException("Failed to enroll student");
        }
    }

    // Unenroll student from course
    @Transactional
    public String unenrollStudent(Long studentId, Long courseId) {
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
            log.error("Error unenrolling student {} from course {}: {}", studentId, courseId, e.getMessage());
            throw new RuntimeException("Failed to unenroll student");
        }
    }

    // Mapper
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
        return CourseResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .instructor(course.getInstructor())
                .createdAt(course.getCreatedAt())
                .updatedAt(course.getUpdatedAt())
                .build();
    }
}