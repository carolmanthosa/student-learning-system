package com.sls.student_learning_system.repository;

import com.sls.student_learning_system.entity.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, Long> {
    Optional<Profile> findByStudentId(Long studentId);
    List<Profile> findAll();
}