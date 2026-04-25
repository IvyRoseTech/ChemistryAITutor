from typing import Optional, Dict, Any

# Global singleton storage for the topic index
# Using None initially to distinguish between "loaded but empty" vs "not loaded"
TOPIC_INDEX: Optional[Dict[str, Any]] = None
