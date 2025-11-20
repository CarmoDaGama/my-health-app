/**
 * AUTH DEBUG HELPER
 * Component para debugar problemas de autenticação Firebase
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { auth, db } from '../../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export const AuthDebugHelper: React.FC = () => {
  const [authState, setAuthState] = useState<any>(null);
  const [userDoc, setUserDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      console.log('🔍 Auth state changed:', user ? 'User signed in' : 'User signed out');
      
      if (user) {
        // Get auth info
        const authInfo = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified,
          phoneNumber: user.phoneNumber,
          photoURL: user.photoURL,
          isAnonymous: user.isAnonymous,
          metadata: {
            creationTime: user.metadata.creationTime,
            lastSignInTime: user.metadata.lastSignInTime
          },
          providerData: user.providerData
        };
        setAuthState(authInfo);

        // Get Firestore user document
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            setUserDoc(userDocSnap.data());
            console.log('📄 User document found in Firestore');
          } else {
            setUserDoc(null);
            console.log('❌ No user document found in Firestore');
          }
        } catch (error) {
          console.error('❌ Error fetching user document:', error);
          setUserDoc({ error: (error as Error).message });
        }
      } else {
        setAuthState(null);
        setUserDoc(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const testFirebaseConnection = async () => {
    try {
      console.log('🧪 Testing Firebase connection...');
      
      // Test 1: Check current user
      const currentUser = auth.currentUser;
      console.log('Test 1 - Current User:', currentUser ? 'Authenticated' : 'Not authenticated');
      
      if (currentUser) {
        // Test 2: Get ID token
        try {
          const token = await currentUser.getIdToken();
          console.log('Test 2 - ID Token:', token ? 'Available' : 'Not available');
          
          // Test 3: Get token claims
          const tokenResult = await currentUser.getIdTokenResult();
          console.log('Test 3 - Token Claims:', tokenResult.claims);
          
        } catch (tokenError) {
          console.error('❌ Token error:', tokenError);
        }
      }
      
      Alert.alert('Test Complete', 'Check console for results');
    } catch (error) {
      console.error('❌ Firebase test error:', error);
      Alert.alert('Test Failed', (error as Error).message);
    }
  };

  if (loading) {
    return (
      <View style={{ padding: 20, backgroundColor: '#f0f0f0' }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>🔄 Loading auth state...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ padding: 20, backgroundColor: '#f0f0f0' }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
        🔍 Authentication Debug Helper
      </Text>
      
      {/* Auth State */}
      <View style={{ backgroundColor: 'white', padding: 15, marginBottom: 10, borderRadius: 8 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: authState ? 'green' : 'red' }}>
          {authState ? '✅ User Authenticated' : '❌ User Not Authenticated'}
        </Text>
        
        {authState && (
          <View style={{ marginTop: 10 }}>
            <Text>📧 Email: {authState.email}</Text>
            <Text>🆔 UID: {authState.uid}</Text>
            <Text>👤 Display Name: {authState.displayName || 'Not set'}</Text>
            <Text>✉️ Email Verified: {authState.emailVerified ? 'Yes' : 'No'}</Text>
          </View>
        )}
      </View>

      {/* Firestore Document */}
      <View style={{ backgroundColor: 'white', padding: 15, marginBottom: 10, borderRadius: 8 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
          📄 Firestore User Document
        </Text>
        
        {userDoc === null && authState && (
          <Text style={{ color: 'red', marginTop: 5 }}>
            ❌ No user document found in Firestore
          </Text>
        )}
        
        {userDoc && !userDoc.error && (
          <View style={{ marginTop: 10 }}>
            <Text>👤 Name: {userDoc.name}</Text>
            <Text>🏷️ User Type: {userDoc.userType}</Text>
            <Text>✅ Active: {userDoc.isActive ? 'Yes' : 'No'}</Text>
            <Text>🔍 Verified: {userDoc.isVerified ? 'Yes' : 'No'}</Text>
          </View>
        )}
        
        {userDoc?.error && (
          <Text style={{ color: 'red', marginTop: 5 }}>
            ❌ Error: {userDoc.error}
          </Text>
        )}
      </View>

      {/* Test Button */}
      <TouchableOpacity
        onPress={testFirebaseConnection}
        style={{
          backgroundColor: '#007AFF',
          padding: 15,
          borderRadius: 8,
          alignItems: 'center',
          marginBottom: 10
        }}
      >
        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
          🧪 Test Firebase Connection
        </Text>
      </TouchableOpacity>

      {/* Instructions */}
      <View style={{ backgroundColor: '#fff3cd', padding: 15, borderRadius: 8 }}>
        <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 5 }}>
          💡 Troubleshooting Steps:
        </Text>
        <Text style={{ fontSize: 12 }}>
          1. If "Not Authenticated": Make sure you're logged in{'\n'}
          2. If "No Firestore document": User registration may be incomplete{'\n'}
          3. Check console logs for detailed error information{'\n'}
          4. Ensure Firebase rules allow authenticated access
        </Text>
      </View>
    </ScrollView>
  );
};