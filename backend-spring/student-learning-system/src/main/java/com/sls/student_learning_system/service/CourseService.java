package com.sls.student_learning_system.service;

import com.sls.student_learning_system.dto.request.CourseRequest;
import com.sls.student_learning_system.dto.response.AssignmentResponse;
import com.sls.student_learning_system.dto.response.CourseResponse;
import com.sls.student_learning_system.dto.response.EnrollmentResponse;
import com.sls.student_learning_system.dto.response.UserResponse;
import com.sls.student_learning_system.entity.Course;
import com.sls.student_learning_system.exception.ResourceNotFoundException;
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
public class CourseService {

    private final CourseRepository courseRepository;

    @Transactional(readOnly = true)
    public List<CourseResponse> getAllCourses() {
        try {
            return courseRepository.findAllByDeletedFalse()
                    .stream()
                    .map(this::mapToCourseResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch courses");
        }
    }

    @Transactional(readOnly = true)
    public CourseResponse getCourseById(Long id) {
        try {
            Course course = courseRepository.findByIdAndDeletedFalse(id)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Course not found with id: " + id));
            return mapToCourseResponse(course);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch course");
        }
    }

    @Transactional
    public CourseResponse createCourse(CourseRequest request) {
        try {
            Course course = Course.builder()
                    .title(request.getTitle())
                    .code(request.getCode())
                    .description(request.getDescription())
                    .instructor(request.getInstructor())
                    .deleted(false)
                    .build();
            courseRepository.save(course);
            return mapToCourseResponse(course);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create course");
        }
    }

    @Transactional
    public CourseResponse updateCourse(Long id, CourseRequest request) {
        try {
            Course course = courseRepository.findByIdAndDeletedFalse(id)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Course not found with id: " + id));
            course.setTitle(request.getTitle());
            course.setCode(request.getCode());
            course.setDescription(request.getDescription());
            course.setInstructor(request.getInstructor());
            courseRepository.save(course);
            return mapToCourseResponse(course);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to update course");
        }
    }

    @Transactional
    public String deleteCourse(Long id) {
        try {
            Course course = courseRepository.findByIdAndDeletedFalse(id)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Course not found with id: " + id));
            course.setDeleted(true);
            courseRepository.save(course);
            return "Course deleted successfully";
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete course");
        }
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

        List<EnrollmentResponse> enrollments = course.getEnrollments() == null ? List.of() :
            course.getEnrollments().stream()
                .map(e -> EnrollmentResponse.builder()
                    .id(e.getId())
                    .student(UserResponse.builder()
                        .id(e.getStudent().getId())
                        .name(e.getStudent().getName())
                        .email(e.getStudent().getEmail())
                        .build())
                    .enrolledAt(e.getCreatedAt())
                    .build())
                .collect(Collectors.toList());

        return CourseResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .code(course.getCode())
                .description(course.getDescription())
                .instructor(course.getInstructor())
                .assignments(assignments)
                .enrollments(enrollments)
                .createdAt(course.getCreatedAt())
                .updatedAt(course.getUpdatedAt())
                .build();
    }
}