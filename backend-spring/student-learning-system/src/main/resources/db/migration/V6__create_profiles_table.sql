CREATE TABLE IF NOT EXISTS profiles (
    id BIGINT NOT NULL AUTO_INCREMENT,
    bio TEXT,
    avatar_url VARCHAR(255),
    student_id BIGINT NOT NULL UNIQUE,
    created_at DATETIME(6),
    updated_at DATETIME(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_profile_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);