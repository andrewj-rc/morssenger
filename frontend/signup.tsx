import React, { useState, useContext, createContext } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft, MessageCircle } from 'lucide-react';

// Mock Auth Context
const AuthContext = createContext();

// Mock API functions
const authAPI = {
  signUp: async (userData) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (userData.email === 'test@example.com') {
      throw new Error('User already exists');
    }
    return { success: true, message: 'Account created successfully' };
  },
  
  signIn: async (credentials) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (credentials.email === 'demo@morse.app' && credentials.password === 'demo123') {
      return { 
        success: true, 
        user: { 
          id: 1, 
          email: 'demo@morse.app', 
          firstName: 'John', 
          lastName: 'Doe',
          username: 'johndoe' 
        },
        token: 'mock-jwt-token'
      };
    }
    throw new Error('Invalid credentials');
  },
  
  resetPassword: async (email) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, message: 'Password reset email sent' };
  }
};

// Main App Component
const MorseAuthApp = () => {
  const [currentPage, setCurrentPage] = useState('signin');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const authValue = {
    user,
    setUser,
    loading,
    setLoading
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'signup':
        return <SignUpPage onNavigate={setCurrentPage} />;
      case 'reset':
        return <PasswordResetPage onNavigate={setCurrentPage} />;
      case 'dashboard':
        return <DashboardPage user={user} onSignOut={() => { setUser(null); setCurrentPage('signin'); }} />;
      default:
        return <SignInPage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <AuthContext.Provider value={authValue}>
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
        {renderPage()}
      </div>
    </AuthContext.Provider>
  );
};

// Auth Layout Component
const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* App Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <MessageCircle className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">MorseChat</h1>
          <p className="text-blue-200">Communicate through touch and vibration</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
          <p className="text-gray-600 mb-6">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
};

// Input Component
const Input = ({ label, type = 'text', placeholder, value, onChange, error, icon: Icon, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        )}
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          {...props}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

// Button Component
const Button = ({ children, variant = 'primary', loading = false, ...props }) => {
  const baseClasses = "w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-200",
    ghost: "bg-transparent text-blue-600 hover:bg-blue-50"
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]}`}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
      ) : null}
      {children}
    </button>
  );
};

// Sign In Page
const SignInPage = ({ onNavigate }) => {
  const { setUser, loading, setLoading } = useContext(AuthContext);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const result = await authAPI.signIn(formData);
      setUser(result.user);
      onNavigate('dashboard');
    } catch (error) {
      setErrors({ general: error.message });
    }
    
    setLoading(false);
  };

  return (
    <AuthLayout 
      title="Welcome back" 
      subtitle="Sign in to your account to continue"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email or Username"
          type="email"
          placeholder="Enter your email or username"
          value={formData.email}
          onChange={handleChange('email')}
          error={errors.email}
          icon={Mail}
          required
        />
        
        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange('password')}
          error={errors.password}
          icon={Lock}
          required
        />

        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{errors.general}</p>
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center">
            <input type="checkbox" className="mr-2 rounded" />
            <span className="text-gray-600">Remember me</span>
          </label>
          <button
            type="button"
            onClick={() => onNavigate('reset')}
            className="text-blue-600 hover:text-blue-700"
          >
            Forgot password?
          </button>
        </div>

        <Button loading={loading}>
          Sign In
        </Button>

        {/* Demo Credentials */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-blue-800 text-sm font-medium">Demo Credentials:</p>
          <p className="text-blue-700 text-xs">Email: demo@morse.app</p>
          <p className="text-blue-700 text-xs">Password: demo123</p>
        </div>
      </form>

      <div className="mt-6 pt-6 border-t border-gray-200 text-center">
        <p className="text-gray-600 text-sm">
          Don't have an account?{' '}
          <button
            onClick={() => onNavigate('signup')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Sign up
          </button>
        </p>
      </div>
    </AuthLayout>
  );
};

// Sign Up Page
const SignUpPage = ({ onNavigate }) => {
  const { setLoading, loading } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    
    try {
      await authAPI.signUp(formData);
      // Show success message and redirect to sign in
      alert('Account created successfully! Please sign in.');
      onNavigate('signin');
    } catch (error) {
      setErrors({ general: error.message });
    }
    
    setLoading(false);
  };

  return (
    <AuthLayout 
      title="Create Account" 
      subtitle="Join MorseChat and start communicating"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            placeholder="John"
            value={formData.firstName}
            onChange={handleChange('firstName')}
            error={errors.firstName}
            icon={User}
            required
          />
          
          <Input
            label="Last Name"
            placeholder="Doe"
            value={formData.lastName}
            onChange={handleChange('lastName')}
            error={errors.lastName}
            icon={User}
            required
          />
        </div>

        <Input
          label="Username"
          placeholder="johndoe"
          value={formData.username}
          onChange={handleChange('username')}
          error={errors.username}
          icon={User}
          required
        />

        <Input
          label="Email"
          type="email"
          placeholder="john@example.com"
          value={formData.email}
          onChange={handleChange('email')}
          error={errors.email}
          icon={Mail}
          required
        />

        <Input
          label="Password"
          type="password"
          placeholder="Choose a strong password"
          value={formData.password}
          onChange={handleChange('password')}
          error={errors.password}
          icon={Lock}
          required
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Repeat your password"
          value={formData.confirmPassword}
          onChange={handleChange('confirmPassword')}
          error={errors.confirmPassword}
          icon={Lock}
          required
        />

        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{errors.general}</p>
          </div>
        )}

        <div className="text-sm text-gray-600">
          By creating an account, you agree to our{' '}
          <a href="#" className="text-blue-600 hover:text-blue-700">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-blue-600 hover:text-blue-700">Privacy Policy</a>
        </div>

        <Button loading={loading}>
          Create Account
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-gray-200 text-center">
        <p className="text-gray-600 text-sm">
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('signin')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Sign in
          </button>
        </p>
      </div>
    </AuthLayout>
  );
};

// Password Reset Page
const PasswordResetPage = ({ onNavigate }) => {
  const { setLoading, loading } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await authAPI.resetPassword(email);
      setSuccess(true);
    } catch (error) {
      setError(error.message);
    }
    
    setLoading(false);
  };

  if (success) {
    return (
      <AuthLayout 
        title="Check Your Email" 
        subtitle="We've sent you a password reset link"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-gray-600 mb-6">
            We've sent a password reset link to <strong>{email}</strong>. 
            Check your inbox and follow the instructions to reset your password.
          </p>
          <Button onClick={() => onNavigate('signin')}>
            Back to Sign In
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title="Reset Password" 
      subtitle="Enter your email to reset your password"
    >
      <button
        onClick={() => onNavigate('signin')}
        className="flex items-center text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Sign In
      </button>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error}
          icon={Mail}
          required
        />

        <Button loading={loading}>
          Send Reset Link
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-gray-200 text-center">
        <p className="text-gray-600 text-sm">
          Remember your password?{' '}
          <button
            onClick={() => onNavigate('signin')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Sign in
          </button>
        </p>
      </div>
    </AuthLayout>
  );
};

// Simple Dashboard Page (placeholder)
const DashboardPage = ({ user, onSignOut }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <MessageCircle className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">MorseChat Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.firstName} {user?.lastName}
              </span>
              <Button variant="ghost" onClick={onSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h2>
          <p className="text-gray-600 mb-6">
            Welcome to MorseChat! This is where your messaging interface will be.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Messages</h3>
              <p className="text-blue-700 text-sm">Active messaging tab</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200 opacity-50">
              <h3 className="font-semibold text-gray-600 mb-2">Feature 2</h3>
              <p className="text-gray-500 text-sm">Coming soon...</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200 opacity-50">
              <h3 className="font-semibold text-gray-600 mb-2">Feature 3</h3>
              <p className="text-gray-500 text-sm">Coming soon...</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200 opacity-50">
              <h3 className="font-semibold text-gray-600 mb-2">Feature 4</h3>
              <p className="text-gray-500 text-sm">Coming soon...</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MorseAuthApp;