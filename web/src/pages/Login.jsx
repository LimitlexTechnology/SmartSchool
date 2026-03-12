import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, ArrowRight, ShieldCheck, Eye, EyeOff, Lock, GraduationCap } from 'lucide-react';
import Button from '../components/ui/Button';
import loginVideo from '../assets/login page gif.mp4';

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

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
      // Try super admin login first
      const rs = await fetch('/api/superadmin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber, password })
      })
      if (rs.ok) {
        const j = await rs.json()
        localStorage.setItem('userPhone', phoneNumber);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', 'superadmin');
        document.cookie = `schoolId=local; Path=/; Max-Age=${60*60*24*7}`
        navigate('/superadmin');
        return
      }

      // Otherwise attempt school admin login
      const r = await fetch('/api/school-auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber, password })
      })
      if (r.ok) {
        const j = await r.json()
        localStorage.setItem('userPhone', phoneNumber);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', 'admin');
        if (j.schoolId) localStorage.setItem('schoolId', j.schoolId)
        if (j.name) localStorage.setItem('schoolName', j.name)
        if (j.schoolId) document.cookie = `schoolId=${encodeURIComponent(j.schoolId)}; Path=/; Max-Age=${60*60*24*7}`
        navigate('/dashboard');
        return
      }
      // Try teacher login
      const rt = await fetch('/api/teacher-auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber, password })
      })
      if (rt.ok) {
        const j = await rt.json()
        localStorage.setItem('userPhone', phoneNumber);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', 'teacher');
        if (j.name) localStorage.setItem('teacherName', j.name)
        if (j.teacherId) localStorage.setItem('teacherId', j.teacherId)
        if (j.schoolId) localStorage.setItem('schoolId', j.schoolId)
        if (j.schoolId) document.cookie = `schoolId=${encodeURIComponent(j.schoolId)}; Path=/; Max-Age=${60*60*24*7}`
        if (j.teacherId) document.cookie = `teacherId=${encodeURIComponent(j.teacherId)}; Path=/; Max-Age=${60*60*24*7}`
        navigate('/teacher');
        return
      }
      const t = await r.json().catch(()=>({}))
      throw new Error(t.error || 'Login failed')
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
    <div className="min-h-screen flex w-full">
      {/* Left Side - Educative Video */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Autoplay looping video */}
        <video
          src={loginVideo}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent z-10" />

        {/* Branding text at bottom */}
        <div className="relative z-20 flex flex-col justify-end h-full p-12 text-white">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl mb-6 border border-white/30">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              Empowering the Next Generation of Leaders
            </h1>
            <p className="text-lg text-white/90 max-w-lg">
              Streamline school management, enhance learning experiences, and foster a connected educational community with Skullar.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/80">
            <ShieldCheck className="w-4 h-4 text-teal-300" />
            <span>Trusted by 500+ Schools • Secure & Reliable</span>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-teal/10 rounded-xl mb-4">
              <ShieldCheck className="w-6 h-6 text-primary-teal" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
            <p className="text-gray-500 mt-2">Please enter your details to sign in</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-teal focus:border-transparent transition-all"
                  placeholder="Enter your phone number"
                  required
                  maxLength="15"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-teal focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  required
                  minLength="6"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-primary-teal transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              fullWidth
              disabled={isLoading}
              className="flex items-center justify-center gap-2 py-3 rounded-xl shadow-lg shadow-primary-teal/20 hover:shadow-primary-teal/30 transition-all"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              Only authorized personnel can access this system. Contact your administrator if you need assistance.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
              <ShieldCheck className="w-3 h-3" />
              <span>End-to-end encrypted • Secure access</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
