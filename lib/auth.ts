// Mock user database
const mockUsers = [
  {
    id: '1',
    email: 'admin@example.com',
    password: 'admin123',
    name: 'Admin User'
  },
  {
    id: '2',
    email: 'user@example.com',
    password: 'user123',
    name: 'Test User'
  }
];

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthSession {
  user: User | null;
  isAuthenticated: boolean;
}

// Simple password validation (in production, use bcrypt)
export const validatePassword = (password: string, storedPassword: string): boolean => {
  return password === storedPassword;
};

// Mock login function
export const authenticateUser = (email: string, password: string): User | null => {
  const user = mockUsers.find(
    u => u.email === email && validatePassword(password, u.password)
  );
  
  if (user) {
    return {
      id: user.id,
      email: user.email,
      name: user.name
    };
  }
  
  return null;
};

// Mock register function
export const registerUser = (email: string, password: string, name: string): User | null => {
  // Check if user already exists
  if (mockUsers.find(u => u.email === email)) {
    return null;
  }
  
  const newUser: User = {
    id: Date.now().toString(),
    email,
    name
  };
  
  mockUsers.push({
    ...newUser,
    password
  });
  
  return newUser;
};

// Mock logout function
export const logoutUser = (): void => {
  // Clear session
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('auth-session');
  }
};
