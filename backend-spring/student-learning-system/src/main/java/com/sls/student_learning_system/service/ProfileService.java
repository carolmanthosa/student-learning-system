package com.sls.student_learning_system.service;

import com.sls.student_learning_system.dto.request.ProfileRequest;
import com.sls.student_learning_system.dto.response.ProfileResponse;
import com.sls.student_learning_system.dto.response.UserResponse;
import com.sls.student_learning_system.entity.Profile;
import com.sls.student_learning_system.entity.User;
import com.sls.student_learning_system.exception.ResourceNotFoundException;
import com.sls.student_learning_system.repository.ProfileRepository;
import com.sls.student_learning_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;

    @Transactional
    public ProfileResponse create(ProfileRequest request, UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Long studentId = request.getStudentId() != null ? request.getStudentId() : user.getId();

        User student = userRepository.findByIdAndDeletedFalse(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        profileRepository.findByStudentId(studentId).ifPresent(p -> {
            throw new RuntimeException("Profile already exists for this student");
        });

        Profile profile = Profile.builder()
                .bio(request.getBio())
                .avatarUrl(request.getAvatarUrl())
                .student(student)
                .build();

        profileRepository.save(profile);
        return mapToProfileResponse(profile);
    }

    @Transactional(readOnly = true)
    public List<ProfileResponse> findAll(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole().name().equals("ADMIN")) {
            return profileRepository.findAll()
                    .stream()
                    .map(this::mapToProfileResponse)
                    .collect(Collectors.toList());
        } else {
            return profileRepository.findByStudentId(user.getId())
                    .map(this::mapToProfileResponse)
                    .map(List::of)
                    .orElse(List.of());
        }
    }

    @Transactional(readOnly = true)
    public ProfileResponse findOne(Long id, UserDetails userDetails) {
        Profile profile = profileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));
        return mapToProfileResponse(profile);
    }

    @Transactional
    public ProfileResponse update(Long id, ProfileRequest request, UserDetails userDetails) {
        Profile profile = profileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

        profile.setBio(request.getBio());
        profile.setAvatarUrl(request.getAvatarUrl());
        profileRepository.save(profile);
        return mapToProfileResponse(profile);
    }

    @Transactional
    public String delete(Long id, UserDetails userDetails) {
        Profile profile = profileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));
        profileRepository.delete(profile);
        return "Profile deleted successfully";
    }

    private ProfileResponse mapToProfileResponse(Profile profile) {
        return ProfileResponse.builder()
                .id(profile.getId())
                .bio(profile.getBio())
                .avatarUrl(profile.getAvatarUrl())
                .student(UserResponse.builder()
                        .id(profile.getStudent().getId())
                        .name(profile.getStudent().getName())
                        .email(profile.getStudent().getEmail())
                        .role(profile.getStudent().getRole())
                        .build())
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }
}