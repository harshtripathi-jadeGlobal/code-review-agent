from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey, Enum
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime
import enum

Base = declarative_base()

class SeverityEnum(str, enum.Enum):
    critical = "critical"
    warning = "warning"
    info = "info"

class CategoryEnum(str, enum.Enum):
    bug = "bug"
    security = "security"
    performance = "performance"
    style = "style"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=True)
    google_id = Column(String(255), unique=True, index=True, nullable=True)
    name = Column(String(255), nullable=True)
    github_access_token = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    submissions = relationship("Submission", back_populates="user")

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    language = Column(String(50), nullable=False)
    code = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)
    user = relationship("User", back_populates="submissions")

    reviews = relationship(
        "Review",
        back_populates="submission",
        cascade="all, delete"
    )

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("submissions.id"), index=True)

    total_issues = Column(Integer, default=0)
    critical_count = Column(Integer, default=0)
    warning_count = Column(Integer, default=0)
    info_count = Column(Integer, default=0)

    score = Column(Float, default=100.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    submission = relationship("Submission", back_populates="reviews")

    issues = relationship(
        "Issue",
        back_populates="review",
        cascade="all, delete"
    )

class Issue(Base):
    __tablename__ = "issues"

    id = Column(Integer, primary_key=True, index=True)
    review_id = Column(Integer, ForeignKey("reviews.id"), index=True)

    category = Column(Enum(CategoryEnum, name="category_enum"))
    severity = Column(Enum(SeverityEnum, name="severity_enum"))

    line_number = Column(Integer, nullable=True)
    title = Column(String(255))
    description = Column(Text)
    fix_suggestion = Column(Text)

    code_before = Column(Text, nullable=True)
    code_after = Column(Text, nullable=True)
    cited_files = Column(String(255), nullable=True)

    review = relationship("Review", back_populates="issues")