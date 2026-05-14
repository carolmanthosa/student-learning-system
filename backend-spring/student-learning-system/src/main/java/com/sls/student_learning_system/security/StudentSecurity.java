package com.sls.student_learning_system.security;

import com.sls.student_learning_system.entity.User;
import com.sls.student_learning_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component("studentSecurity")
@RequiredArgsConstructor
public class StudentSecurity {

    private final UserRepository userRepository;

    /**
     * Returns true if the authenticated user's ID matches the requested student ID.
     * Used in @PreAuthorize to allow students to access only their own data.
     */
    public boolean isSelf(Authentication authentication, Long studentId) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .map(User::getId)
                .map(id -> id.equals(studentId))
                .orElse(false);
    }
}