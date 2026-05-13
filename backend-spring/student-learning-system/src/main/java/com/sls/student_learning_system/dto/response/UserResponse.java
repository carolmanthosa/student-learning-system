package com.sls.student_learning_system.dto.response;

import com.sls.student_learning_system.enums.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "User information returned in responses")
public class UserResponse {

    @Schema(example = "1")
    private Long id;

    @Schema(example = "Carol Mokoena")
    private String name;

    @Schema(example = "carol@gmail.com")
    private String email;

    @Schema(example = "STUDENT")
    private Role role;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}