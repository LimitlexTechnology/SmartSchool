import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, ArrowRight, ShieldCheck, Eye, EyeOff, Lock } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!phoneNumber || phoneNumber.length < 10) {
      alert('Please enter a valid phone number');
      return;
    }

    if (!password || password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call for phone number and password authentication
      // In a real app, this would call your backend API
      
      // Test credentials for demo purposes
      const testCredentials = [
        { phone: '1234567890', password: 'admin123' },
        { phone: '5551234567', password: 'teacher123' },
        { phone: '9876543210', password: 'student123' }
      ];
      
      // Validate against test credentials
      const isValidUser = testCredentials.some(
        cred => cred.phone === phoneNumber && cred.password === password
      );
      
      if (!isValidUser) {
        throw new Error('Invalid credentials');
      }
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Store login state in localStorage
      localStorage.setItem('userPhone', phoneNumber);
      localStorage.setItem('isLoggedIn', 'true');
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      alert('Login failed. Please check your phone number and password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneChange = (e) => {
    // Remove non-numeric characters
    const value = e.target.value.replace(/\D/g, '');
    setPhoneNumber(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-teal to-[#0F172A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-4">
            <ShieldCheck className="w-8 h-8 text-primary-teal" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">SmartSchool</h1>
          <p className="text-white/70">Secure School Management System</p>
        </div>

        <Card className="bg-white/95 backdrop-blur-sm">
          <div className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-dark-text mb-2">Welcome Back</h2>
              <p className="text-muted-text">Enter your phone number and password to continue</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-dark-text mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-muted-text" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-2xl bg-light-bg text-dark-text placeholder-muted-text focus:outline-none focus:ring-2 focus:ring-primary-teal focus:border-transparent transition-all"
                    placeholder="Enter your phone number"
                    required
                    maxLength="15"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-dark-text mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-muted-text" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-12 py-3 border border-gray-200 rounded-2xl bg-light-bg text-dark-text placeholder-muted-text focus:outline-none focus:ring-2 focus:ring-primary-teal focus:border-transparent transition-all"
                    placeholder="Enter your password"
                    required
                    minLength="6"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-text hover:text-primary-teal transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                fullWidth
                disabled={isLoading}
                className="flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-muted-text">
                Only authorized users can access this system. Contact your administrator for access.
              </p>
            </div>
          </div>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 text-white/60 text-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>End-to-end encrypted • Admin managed access</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;