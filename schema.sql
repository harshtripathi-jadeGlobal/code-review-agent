-- Run this first to create the database
CREATE DATABASE IF NOT EXISTS code_review_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE code_review_db;

CREATE TABLE IF NOT EXISTS submissions (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    filename   VARCHAR(255),
    language   VARCHAR(50),
    code       LONGTEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reviews (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    submission_id  INT NOT NULL,
    total_issues   INT DEFAULT 0,
    critical_count INT DEFAULT 0,
    warning_count  INT DEFAULT 0,
    info_count     INT DEFAULT 0,
    score          FLOAT DEFAULT 100.0,
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS issues (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    review_id      INT NOT NULL,
    category       ENUM('bug','security','performance','style') NOT NULL,
    severity       ENUM('critical','warning','info') NOT NULL,
    line_number    INT,
    title          VARCHAR(255),
    description    TEXT,
    fix_suggestion TEXT,
    code_before    TEXT,
    code_after     TEXT,
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
);
