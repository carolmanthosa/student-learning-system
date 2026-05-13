package com.sls.student_learning_system.service;

import com.sls.student_learning_system.dto.request.CourseRequest;
import com.sls.student_learning_system.dto.response.CourseResponse;
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

    // Get all courses
    public List<CourseResponse> getAllCourses() {
        try {
            log.info("Fetching all courses");
            return courseRepository.findAllByDeletedFalse()
                    .stream()
                    .map(this::mapToCourseResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching courses: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch courses");
        }
    }

    // Get course by ID
    public CourseResponse getCourseById(Long id) {
        try {
            log.info("Fetching course with id: {}", id);
            Course course = courseRepository.findByIdAndDeletedFalse(id)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Course not found with id: " + id));
            return mapToCourseResponse(course);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error fetching course {}: {}", id, e.getMessage());
            throw new RuntimeException("Failed to fetch course");
        }
    }

    // Create course
    @Transactional
    public CourseResponse createCourse(CourseRequest request) {
        try {
            log.info("Creating new course: {}", request.getTitle());
            Course course = Course.builder()
                    .title(request.getTitle())
                    .description(request.getDescription())
                    .instructor(request.getInstructor())
                    .deleted(false)
                    .build();

            courseRepository.save(course);
            log.info("Course created successfully with id: {}", course.getId());
            return mapToCourseResponse(course);
        } catch (Exception e) {
            log.error("Error creating course: {}", e.getMessage());
            throw new RuntimeException("Failed to create course");
        }
    }

    // Update course
    @Transactional
    public CourseResponse updateCourse(Long id, CourseRequest request) {
        try {
            log.info("Updating course with id: {}", id);
            Course course = courseRepository.findByIdAndDeletedFalse(id)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Course not found with id: " + id));

            course.setTitle(request.getTitle());
            course.setDescription(request.getDescription());
            course.setInstructor(request.getInstructor());

            courseRepository.save(course);
            log.info("Course {} updated successfully", id);
            return mapToCourseResponse(course);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error updating course {}: {}", id, e.getMessage());
            throw new RuntimeException("Failed to update course");
        }
    }

    // Soft delete course
    @Transactional
    public String deleteCourse(Long id) {
        try {
            log.info("Soft deleting course with id: {}", id);
            Course course = courseRepository.findByIdAndDeletedFalse(id)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Course not found with id: " + id));

            course.setDeleted(true);
            courseRepository.save(course);
            log.info("Course {} soft deleted successfully", id);
            return "Course deleted successfully";
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error deleting course {}: {}", id, e.getMessage());
            throw new RuntimeException("Failed to delete course");
        }
    }

    // Mapper
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