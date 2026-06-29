/**
 * Firebase Realtime Database Service
 * Handles all data storage for ChemAI
 * Stores: users, sessions, messages
 */

import { database, auth } from '../firebase';
import {
  ref,
  set,
  push,
  get,
  update,
  onValue,
  remove
} from 'firebase/database';

// ─────────────────────────────────────────
// USER PROFILE
// ─────────────────────────────────────────

export const saveUserProfile = async (user) => {
  /**
   * Called immediately after login or signup
   * Creates profile if new, updates lastActive if existing
   */
  try {
    const userRef = ref(database, `users/${user.uid}`);
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
      // First time — create full profile
      await set(userRef, {
        uid: user.uid,
        name: user.displayName || 'Student',
        email: user.email,
        photoURL: user.photoURL || null,
        createdAt: new Date().toISOString(),
        totalSessions: 0,
        totalMessages: 0,
        lastActive: new Date().toISOString()
      });
      console.log('New user profile created in Firebase');
    } else {
      // Returning user — update last active
      await update(userRef, {
        lastActive: new Date().toISOString(),
        name: user.displayName || snapshot.val().name,
      });
    }
  } catch (error) {
    console.error('Error saving user profile:', error);
  }
};

export const getUserProfile = async (userId) => {
  try {
    const userRef = ref(database, `users/${userId}`);
    const snapshot = await get(userRef);
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// ─────────────────────────────────────────
// SESSION MANAGEMENT
// ─────────────────────────────────────────

export const startSession = async (userId, sessionId) => {
  /**
   * Called when student starts a new chat
   * Creates a session record in Firebase
   */
  try {
    const sessionRef = ref(
      database,
      `sessions/${userId}/${sessionId}`
    );

    await set(sessionRef, {
      sessionId,
      startedAt: new Date().toISOString(),
      messageCount: 0,
      lastMessage: '',
      status: 'active'
    });

    // Increment user total sessions
    const userRef = ref(database, `users/${userId}`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      const current = snapshot.val().totalSessions || 0;
      await update(userRef, { totalSessions: current + 1 });
    }

  } catch (error) {
    console.error('Error starting session:', error);
  }
};

export const endSession = async (userId, sessionId) => {
  try {
    const sessionRef = ref(
      database,
      `sessions/${userId}/${sessionId}`
    );
    await update(sessionRef, {
      endedAt: new Date().toISOString(),
      status: 'completed'
    });
  } catch (error) {
    console.error('Error ending session:', error);
  }
};

export const getUserSessions = async (userId) => {
  try {
    const sessionsRef = ref(database, `sessions/${userId}`);
    const snapshot = await get(sessionsRef);
    if (!snapshot.exists()) return [];

    const sessions = [];
    snapshot.forEach(child => {
      sessions.push({ id: child.key, ...child.val() });
    });

    return sessions.sort(
      (a, b) => new Date(b.startedAt) - new Date(a.startedAt)
    );
  } catch (error) {
    console.error('Error getting sessions:', error);
    return [];
  }
};

// Real-time listener for sessions
export const listenToSessions = (userId, callback) => {
  const sessionsRef = ref(database, `sessions/${userId}`);
  return onValue(sessionsRef, (snapshot) => {
    const sessions = [];
    if (snapshot.exists()) {
      snapshot.forEach(child => {
        sessions.push({ id: child.key, ...child.val() });
      });
    }
    callback(
      sessions.sort(
        (a, b) => new Date(b.startedAt) - new Date(a.startedAt)
      )
    );
  });
};

// ─────────────────────────────────────────
// MESSAGE STORAGE
// ─────────────────────────────────────────

export const saveMessage = async (
  userId,
  sessionId,
  role,
  content
) => {
  /**
   * Saves every message to Firebase
   * role = 'user' or 'assistant'
   */
  try {
    const messagesRef = ref(
      database,
      `messages/${userId}/${sessionId}`
    );

    const newMsg = push(messagesRef);
    await set(newMsg, {
      role,
      content,
      timestamp: new Date().toISOString(),
      isAI: role === 'assistant'
    });

    // Update session last message and count
    const sessionRef = ref(
      database,
      `sessions/${userId}/${sessionId}`
    );
    const sessionSnap = await get(sessionRef);
    if (sessionSnap.exists()) {
      const count = sessionSnap.val().messageCount || 0;
      await update(sessionRef, {
        messageCount: count + 1,
        lastMessage: content.substring(0, 80)
      });
    }

    // Update user total messages
    const userRef = ref(database, `users/${userId}`);
    const userSnap = await get(userRef);
    if (userSnap.exists()) {
      const total = userSnap.val().totalMessages || 0;
      await update(userRef, {
        totalMessages: total + 1,
        lastActive: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Error saving message:', error);
  }
};

export const getSessionMessages = async (userId, sessionId) => {
  try {
    const messagesRef = ref(
      database,
      `messages/${userId}/${sessionId}`
    );
    const snapshot = await get(messagesRef);
    if (!snapshot.exists()) return [];

    const messages = [];
    snapshot.forEach(child => {
      messages.push({ id: child.key, ...child.val() });
    });

    return messages.sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );
  } catch (error) {
    console.error('Error getting messages:', error);
    return [];
  }
};