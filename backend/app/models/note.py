from sqlalchemy import Column, String, Text, Boolean, JSON, Table, ForeignKey, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, TSVECTOR
from sqlalchemy.ext.hybrid import hybrid_property

from app.models.base import UserOwnedModel, BaseModel


# Association table for note-to-note links (bi-directional)
note_links = Table(
    'note_links',
    UserOwnedModel.metadata,
    Column('source_note_id', UUID(as_uuid=True), ForeignKey('notes.id'), primary_key=True),
    Column('target_note_id', UUID(as_uuid=True), ForeignKey('notes.id'), primary_key=True)
)

# Association table for note tags
note_tags = Table(
    'note_tags',
    UserOwnedModel.metadata,
    Column('note_id', UUID(as_uuid=True), ForeignKey('notes.id'), primary_key=True),
    Column('tag_id', UUID(as_uuid=True), ForeignKey('tags.id'), primary_key=True)
)


class Note(UserOwnedModel):
    """Note model for the PKM system"""
    __tablename__ = "notes"
    
    # Basic fields
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False, default="")
    
    # Note type/template
    note_type = Column(String(50), default="note", nullable=False)  # note, daily, meeting, etc.
    template_id = Column(UUID(as_uuid=True), nullable=True)
    
    # Search
    content_search_vector = Column(TSVECTOR, nullable=True)  # For full-text search
    
    # Status
    is_pinned = Column(Boolean, default=False, nullable=False)
    is_archived = Column(Boolean, default=False, nullable=False)
    is_template = Column(Boolean, default=False, nullable=False)
    
    # Metadata
    meta_data = Column(JSON, default=dict, nullable=False)
    
    # Relationships
    # user = relationship("User", back_populates="notes")  # Removed - no foreign key to User model
    
    # Bi-directional links
    linked_from = relationship(
        "Note",
        secondary=note_links,
        primaryjoin="Note.id == note_links.c.source_note_id",
        secondaryjoin="Note.id == note_links.c.target_note_id",
        backref="linked_to"
    )
    
    # Tags
    tags = relationship("Tag", secondary=note_tags, back_populates="notes")
    
    # Versions
    versions = relationship("NoteVersion", back_populates="note", cascade="all, delete-orphan")
    
    @hybrid_property
    def word_count(self) -> int:
        """Get word count of the note content"""
        return len(self.content.split()) if self.content else 0
    
    def create_version(self, user_id: str, change_summary: str = None) -> None:
        """Create a new version of this note"""
        version = NoteVersion(
            note_id=self.id,
            title=self.title,
            content=self.content,
            user_id=user_id,
            change_summary=change_summary
        )
        self.versions.append(version)


class NoteVersion(BaseModel):
    """Version history for notes"""
    __tablename__ = "note_versions"
    
    note_id = Column(UUID(as_uuid=True), ForeignKey("notes.id"), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    user_id = Column(String, nullable=False)
    change_summary = Column(String(255), nullable=True)
    version_number = Column(Integer, nullable=False, default=1)
    
    # Relationship
    note = relationship("Note", back_populates="versions")


class Tag(UserOwnedModel):
    """Tag model for organizing content"""
    __tablename__ = "tags"
    
    name = Column(String(50), nullable=False)
    color = Column(String(7), nullable=True)  # Hex color
    description = Column(String(255), nullable=True)
    
    # Tag hierarchy
    parent_tag_id = Column(UUID(as_uuid=True), ForeignKey("tags.id"), nullable=True)
    
    # Relationships
    notes = relationship("Note", secondary=note_tags, back_populates="tags")
    parent = relationship("Tag", remote_side="Tag.id", backref="children")