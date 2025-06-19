from typing import Optional, List, Dict, Any, Set
from uuid import UUID
from datetime import datetime
from sqlalchemy import select, and_, or_, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.note import Note, note_links
from app.repositories.base import UserOwnedRepository


class NoteRepository(UserOwnedRepository[Note]):
    """Repository for note operations"""
    
    async def get_with_links(
        self,
        user_id: str,
        note_id: UUID
    ) -> Optional[Note]:
        """Get note with all linked notes loaded"""
        query = select(Note).where(
            and_(
                Note.id == note_id,
                Note.user_id == user_id,
                Note.is_deleted == False
            )
        ).options(
            selectinload(Note.linked_from),
            selectinload(Note.linked_to),
            selectinload(Note.tags)
        )
        
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def get_by_folder(
        self,
        user_id: str,
        folder_path: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[Note]:
        """Get notes in a specific folder"""
        return await self.get_multi_by_user(
            user_id,
            skip=skip,
            limit=limit,
            filters={"folder_path": folder_path}
        )
    
    async def get_favorites(
        self,
        user_id: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[Note]:
        """Get favorite notes"""
        return await self.get_multi_by_user(
            user_id,
            skip=skip,
            limit=limit,
            filters={"is_favorite": True}
        )
    
    async def search(
        self,
        user_id: str,
        query: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[Note]:
        """Search notes by title or content"""
        search_query = select(Note).where(
            and_(
                Note.user_id == user_id,
                Note.is_deleted == False,
                or_(
                    Note.title.ilike(f"%{query}%"),
                    Note.content.ilike(f"%{query}%")
                )
            )
        ).order_by(Note.updated_at.desc()).offset(skip).limit(limit)
        
        result = await self.db.execute(search_query)
        return result.scalars().all()
    
    async def get_by_tags(
        self,
        user_id: str,
        tags: List[str],
        skip: int = 0,
        limit: int = 100
    ) -> List[Note]:
        """Get notes that have any of the specified tags"""
        query = select(Note).where(
            and_(
                Note.user_id == user_id,
                Note.is_deleted == False,
                Note.tags.overlap(tags)
            )
        ).order_by(Note.updated_at.desc()).offset(skip).limit(limit)
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_linked_notes(
        self,
        user_id: str,
        note_id: UUID
    ) -> Dict[str, List[Note]]:
        """Get all notes linked to and from a specific note"""
        note = await self.get_with_links(user_id, note_id)
        if not note:
            return {"linked_to": [], "linked_from": []}
        
        return {
            "linked_to": note.linked_to,
            "linked_from": note.linked_from
        }
    
    async def add_link(
        self,
        user_id: str,
        source_id: UUID,
        target_id: UUID
    ) -> bool:
        """Add a link between two notes"""
        # Verify both notes exist and belong to user
        source = await self.get_by_user(user_id, source_id)
        target = await self.get_by_user(user_id, target_id)
        
        if not source or not target:
            return False
        
        # Check if link already exists
        existing_query = select(note_links).where(
            and_(
                note_links.c.source_note_id == source_id,
                note_links.c.target_note_id == target_id
            )
        )
        existing_result = await self.db.execute(existing_query)
        if existing_result.scalar_one_or_none():
            return True  # Link already exists
        
        # Create new link
        insert_stmt = note_links.insert().values(
            source_note_id=source_id,
            target_note_id=target_id
        )
        await self.db.execute(insert_stmt)
        await self.db.commit()
        return True
    
    async def remove_link(
        self,
        user_id: str,
        source_id: UUID,
        target_id: UUID
    ) -> bool:
        """Remove a link between two notes"""
        # Verify source note belongs to user
        source = await self.get_by_user(user_id, source_id)
        if not source:
            return False
        
        # Remove link
        delete_stmt = note_links.delete().where(
            and_(
                note_links.c.source_note_id == source_id,
                note_links.c.target_note_id == target_id
            )
        )
        result = await self.db.execute(delete_stmt)
        await self.db.commit()
        
        return result.rowcount > 0
    
    async def toggle_favorite(
        self,
        user_id: str,
        note_id: UUID
    ) -> Optional[Note]:
        """Toggle the favorite status of a note"""
        note = await self.get_by_user(user_id, note_id)
        if not note:
            return None
        
        note.is_favorite = not note.is_favorite
        await self.db.commit()
        await self.db.refresh(note)
        return note
    
    async def get_folder_structure(
        self,
        user_id: str
    ) -> List[Dict[str, Any]]:
        """Get the folder structure for a user's notes"""
        query = select(
            Note.folder_path,
            func.count(Note.id).label("note_count")
        ).where(
            and_(
                Note.user_id == user_id,
                Note.is_deleted == False
            )
        ).group_by(Note.folder_path).order_by(Note.folder_path)
        
        result = await self.db.execute(query)
        folders = []
        
        for folder_path, count in result.all():
            folders.append({
                "path": folder_path,
                "name": folder_path.split("/")[-1] if folder_path else "Root",
                "note_count": count
            })
        
        return folders
    
    async def get_all_tags(
        self,
        user_id: str
    ) -> List[Dict[str, int]]:
        """Get all unique tags with their usage count"""
        query = select(Note).where(
            and_(
                Note.user_id == user_id,
                Note.is_deleted == False,
                Note.tags != None
            )
        )
        
        result = await self.db.execute(query)
        notes = result.scalars().all()
        
        # Count tag occurrences
        tag_counts: Dict[str, int] = {}
        for note in notes:
            for tag in note.tags or []:
                tag_counts[tag] = tag_counts.get(tag, 0) + 1
        
        # Convert to list of dicts sorted by count
        return [
            {"tag": tag, "count": count}
            for tag, count in sorted(
                tag_counts.items(),
                key=lambda x: x[1],
                reverse=True
            )
        ]
    
    async def get_stats(
        self,
        user_id: str
    ) -> Dict[str, Any]:
        """Get note statistics for a user"""
        # Total notes
        total_query = select(func.count(Note.id)).where(
            and_(
                Note.user_id == user_id,
                Note.is_deleted == False
            )
        )
        total_result = await self.db.execute(total_query)
        total = total_result.scalar() or 0
        
        # Favorite notes
        favorites_query = select(func.count(Note.id)).where(
            and_(
                Note.user_id == user_id,
                Note.is_deleted == False,
                Note.is_favorite == True
            )
        )
        favorites_result = await self.db.execute(favorites_query)
        favorites = favorites_result.scalar() or 0
        
        # Total links
        links_query = select(func.count(note_links.c.source_note_id)).where(
            note_links.c.source_note_id.in_(
                select(Note.id).where(
                    and_(
                        Note.user_id == user_id,
                        Note.is_deleted == False
                    )
                )
            )
        )
        links_result = await self.db.execute(links_query)
        total_links = links_result.scalar() or 0
        
        return {
            "total": total,
            "favorites": favorites,
            "total_links": total_links,
            "folders": len(await self.get_folder_structure(user_id)),
            "tags": len(await self.get_all_tags(user_id))
        }