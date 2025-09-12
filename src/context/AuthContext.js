import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_CONFIG, getHeaders, handleApiError } from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext( AuthContext );
  if ( !context ) {
    throw new Error( 'useAuth must be used within an AuthProvider' );
  }
  return context;
};

export const AuthProvider = ( { children } ) => {
  const [ isAuthenticated, setIsAuthenticated ] = useState( false );
  const [ user, setUser ] = useState( null );
  const [ isLoading, setIsLoading ] = useState( true );

  useEffect( () => {
    const token = localStorage.getItem( 'authToken' );
    const savedUser = localStorage.getItem( 'user' );

    if ( token && savedUser ) {
      setIsAuthenticated( true );
      setUser( JSON.parse( savedUser ) );
    }
    setIsLoading( false );
  }, [] );
  const login = async ( username, password ) => {
    try {
      const loginEndpoint = process.env.REACT_APP_LOGIN_ENDPOINT + '/auth/login';
      const fullLoginUrl = `${loginEndpoint}`;

      console.log( 'Attempting login to:', fullLoginUrl );

      const response = await axios.post( fullLoginUrl, {
        username: username,
        password: password
      }, {
        headers: getHeaders(),
        timeout: API_CONFIG.TIMEOUT
      } );

      if ( response.status === 200 ) {
        setIsAuthenticated( true );
        localStorage.setItem( 'authToken', response.data.data.token );

        // Get user profile after successful login
        try {
          const profileResponse = await axios.get( `${process.env.REACT_APP_LOGIN_ENDPOINT}/auth/me`, {
            headers: {
              Authorization: response.data.data.token,
              'ngrok-skip-browser-warning': 'true',
            }
          } );

          const userData = profileResponse.data?.data || profileResponse.data;
          const loggedInUser = {
            username: userData.username || username,
            name: userData.name || userData.username,
            role: userData.role?.name || userData.role_name || 'user',
            branch: userData.branch?.name || userData.branch_name || null,
            id: userData.id
          };

          setUser( loggedInUser );
          localStorage.setItem( 'user', JSON.stringify( loggedInUser ) );
          localStorage.setItem( 'userRole', loggedInUser.role );
        } catch ( profileError ) {
          console.error( 'Failed to fetch user profile:', profileError );
          // Fallback to basic user info
          const loggedInUser = {
            username,
            role: 'user'
          };
          setUser( loggedInUser );
          localStorage.setItem( 'user', JSON.stringify( loggedInUser ) );
        }

        return { success: true };
      } else {
        return { success: false, message: response.data.data.message || 'Login gagal!' };
      }
    } catch ( error ) {
      console.error( 'Login error:', error );
      return handleApiError( error );
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem( 'authToken' );
      if ( token ) {
        const logoutEndpoint = process.env.REACT_APP_LOGIN_ENDPOINT + '/auth/logout';
        await axios.post(
          logoutEndpoint,
          {},
          {
            headers: {
              'Authorization': 'token',
              'Content-Type': 'application/json',
            },
            timeout: API_CONFIG.TIMEOUT
          }
        );
      }
    } catch ( error ) {
      console.error( 'Logout error:', error );
      // Lanjut Logout Tanpa Request dari server
    } finally {
      setIsAuthenticated( false );
      setUser( null );
      localStorage.removeItem( 'authToken' );
      localStorage.removeItem( 'user' );
      window.location.href = '/login';
    }
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={ value }>
      { children }
    </AuthContext.Provider>
  );
}; 