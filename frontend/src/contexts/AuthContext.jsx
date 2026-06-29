import React, { createContext, useState, useEffect } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    updateProfile
} from 'firebase/auth';
import { auth } from '../firebase';
import { saveUserProfile } from '../services/databaseService'; // ← ADD THIS

// Create the authentication context
export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Register new user
    const register = async (email, password, displayName) => {
        try {
            setError(null);
            const userCredential = await createUserWithEmailAndPassword(
                auth, email, password
            );

            // Update user profile with display name
            if (displayName) {
                await updateProfile(userCredential.user, {
                    displayName: displayName
                });
            }

            // Save new user to Firebase Realtime Database
            await saveUserProfile(userCredential.user);

            return userCredential.user;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Login user
    const login = async (email, password) => {
        try {
            setError(null);
            const userCredential = await signInWithEmailAndPassword(
                auth, email, password
            );

            //  Update last active time in Firebase on login
            await saveUserProfile(userCredential.user);

            return userCredential.user;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Logout user
    const logout = async () => {
        try {
            setError(null);
            await signOut(auth);
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Reset password
    const resetPassword = async (email) => {
        try {
            setError(null);
            await sendPasswordResetEmail(auth, email);
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Save profile every time auth state confirms a logged-in user
                // This catches page refreshes and returning users
                await saveUserProfile(user);
            }
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        loading,
        error,
        register,
        login,
        logout,
        resetPassword
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};