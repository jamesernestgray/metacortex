from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, status, Query
from uuid import UUID

from app.api.deps import CurrentUser, DbSession, Pagination, Sorting
from app.models.note import Note
from app.schemas.note import (
    Note as NoteSchema,
    NoteCreate,
    NoteUpdate,
    NoteWithLinks,
    NoteLink as NoteLinkSchema,
)
from app.repositories.note import NoteRepository

router = APIRouter()


@router.post("/", response_model=NoteSchema, status_code=status.HTTP_201_CREATED)
async def create_note(
    note_in: NoteCreate,
    current_user: CurrentUser,
    db: DbSession
) -> Note:
    """Create a new note"""
    note_repo = NoteRepository(Note, db)
    
    note_data = note_in.model_dump()
    note = await note_repo.create_for_user(current_user.clerk_id, note_data)
    
    return note


@router.get("/", response_model=List[NoteSchema])
async def get_notes(
    current_user: CurrentUser,
    db: DbSession,
    pagination: Pagination,
    sorting: Sorting,
    folder_path: Optional[str] = None,
    is_favorite: Optional[bool] = None,
    tags: Optional[List[str]] = Query(None),
    search: Optional[str] = None,
) -> List[Note]:
    """Get notes with filtering and pagination"""
    note_repo = NoteRepository(Note, db)
    
    # Search takes precedence
    if search:
        return await note_repo.search(
            current_user.clerk_id,
            search,
            skip=pagination.skip,
            limit=pagination.limit
        )
    
    # Get by tags
    if tags:
        return await note_repo.get_by_tags(
            current_user.clerk_id,
            tags,
            skip=pagination.skip,
            limit=pagination.limit
        )
    
    # Get favorites
    if is_favorite:
        return await note_repo.get_favorites(
            current_user.clerk_id,
            skip=pagination.skip,
            limit=pagination.limit
        )
    
    # Get by folder
    if folder_path is not None:
        return await note_repo.get_by_folder(
            current_user.clerk_id,
            folder_path,
            skip=pagination.skip,
            limit=pagination.limit
        )
    
    # Get all with filters
    filters = {}
    
    return await note_repo.get_multi_by_user(
        current_user.clerk_id,
        skip=pagination.skip,
        limit=pagination.limit,
        filters=filters,
        order_by=sorting.order_by or "-updated_at"
    )


@router.get("/folders", response_model=List[Dict[str, Any]])
async def get_folder_structure(
    current_user: CurrentUser,
    db: DbSession
) -> List[Dict[str, Any]]:
    """Get the folder structure for user's notes"""
    note_repo = NoteRepository(Note, db)
    return await note_repo.get_folder_structure(current_user.clerk_id)


@router.get("/tags", response_model=List[Dict[str, Any]])
async def get_all_tags(
    current_user: CurrentUser,
    db: DbSession
) -> List[Dict[str, int]]:
    """Get all unique tags with usage count"""
    note_repo = NoteRepository(Note, db)
    return await note_repo.get_all_tags(current_user.clerk_id)


@router.get("/stats", response_model=Dict[str, Any])
async def get_note_stats(
    current_user: CurrentUser,
    db: DbSession
) -> Dict[str, Any]:
    """Get note statistics for current user"""
    note_repo = NoteRepository(Note, db)
    return await note_repo.get_stats(current_user.clerk_id)


@router.get("/{note_id}", response_model=NoteWithLinks)
async def get_note(
    note_id: UUID,
    current_user: CurrentUser,
    db: DbSession
) -> Note:
    """Get a specific note with all linked notes"""
    note_repo = NoteRepository(Note, db)
    note = await note_repo.get_with_links(current_user.clerk_id, note_id)
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    return note


@router.patch("/{note_id}", response_model=NoteSchema)
async def update_note(
    note_id: UUID,
    note_update: NoteUpdate,
    current_user: CurrentUser,
    db: DbSession
) -> Note:
    """Update a note"""
    note_repo = NoteRepository(Note, db)
    
    update_data = note_update.model_dump(exclude_unset=True)
    note = await note_repo.update_for_user(
        current_user.clerk_id,
        note_id,
        update_data
    )
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    return note


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    note_id: UUID,
    current_user: CurrentUser,
    db: DbSession
) -> None:
    """Delete a note (soft delete)"""
    note_repo = NoteRepository(Note, db)
    
    success = await note_repo.delete_for_user(current_user.clerk_id, note_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )


@router.post("/{note_id}/favorite", response_model=NoteSchema)
async def toggle_favorite(
    note_id: UUID,
    current_user: CurrentUser,
    db: DbSession
) -> Note:
    """Toggle the favorite status of a note"""
    note_repo = NoteRepository(Note, db)
    
    note = await note_repo.toggle_favorite(current_user.clerk_id, note_id)
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    return note


@router.get("/{note_id}/links", response_model=Dict[str, List[NoteSchema]])
async def get_note_links(
    note_id: UUID,
    current_user: CurrentUser,
    db: DbSession
) -> Dict[str, List[Note]]:
    """Get all notes linked to and from a specific note"""
    note_repo = NoteRepository(Note, db)
    return await note_repo.get_linked_notes(current_user.clerk_id, note_id)


@router.post("/{note_id}/links", response_model=Dict[str, str])
async def add_link(
    note_id: UUID,
    link: NoteLinkSchema,
    current_user: CurrentUser,
    db: DbSession
) -> Dict[str, str]:
    """Add a link from this note to another note"""
    note_repo = NoteRepository(Note, db)
    
    success = await note_repo.add_link(
        current_user.clerk_id,
        note_id,
        link.target_id
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create link. Check that both notes exist."
        )
    
    return {"message": "Link created successfully"}


@router.delete("/{note_id}/links/{target_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_link(
    note_id: UUID,
    target_id: UUID,
    current_user: CurrentUser,
    db: DbSession
) -> None:
    """Remove a link between two notes"""
    note_repo = NoteRepository(Note, db)
    
    success = await note_repo.remove_link(
        current_user.clerk_id,
        note_id,
        target_id
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Link not found"
        )