"""
Conversation Manager
Stores chat history per student session
"""
from typing import List, Dict


class ConversationManager:
    def __init__(self):
        self.sessions: Dict[str, List] = {}

    def get_history(self, session_id: str) -> List:
        return self.sessions.get(session_id, [])

    def add_message(
        self,
        session_id: str,
        role: str,
        content: str
    ):
        if session_id not in self.sessions:
            self.sessions[session_id] = []

        self.sessions[session_id].append({
            "role": role,
            "parts": [{"text": content}]
        })

        # Keep only last 10 messages
        if len(self.sessions[session_id]) > 10:
            self.sessions[session_id] = \
                self.sessions[session_id][-10:]

    def clear_session(self, session_id: str):
        if session_id in self.sessions:
            del self.sessions[session_id]

    def session_exists(self, session_id: str) -> bool:
        return (
            session_id in self.sessions and
            len(self.sessions[session_id]) > 0
        )


# Global instance
conversation_manager = ConversationManager()