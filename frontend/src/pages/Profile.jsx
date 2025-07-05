import { useState, useEffect } from 'react'
import { FaUser, FaEdit, FaSave, FaTimes, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { userService } from '../services'
import { toast } from 'react-hot-toast'

export default function Profile() {
  const { user, updateProfile } = useAuth()
  const [editingProfile, setEditingProfile] = useState(false)
  const [editingPassword, setEditingPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  })
  
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  })

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })

  // Parse user name into first and last name
  const parseUserName = (name) => {
    if (!name) return { first_name: '', last_name: '' };
    
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return { first_name: parts[0], last_name: '' };
    }
    
    const lastName = parts.pop();
    const firstName = parts.join(' ');
    
    return { first_name: firstName, last_name: lastName };
  };

  // Load current user data when component mounts
  useEffect(() => {
    const loadUserData = async () => {
      try {
        console.log("Current user data:", user);
        
        if (user) {
          // Backend sends name as a combined field, so we need to parse it
          const names = parseUserName(user.name);
          
          // Set profile data from current user with proper field mapping
          setProfileData({
            first_name: names.first_name || '',
            last_name: names.last_name || '',
            email: user.email || '',
            phone: user.phone || ''
          });
        } else {
          // If user data is not available in context, fetch it
          const userData = await userService.getUserProfile();
          console.log("Fetched user profile:", userData);
          
          if (userData) {
            const names = parseUserName(userData.name);
            
            setProfileData({
              first_name: names.first_name || '',
              last_name: names.last_name || '',
              email: userData.email || '',
              phone: userData.phone || ''
            });
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        toast.error("Could not load user data. Please try refreshing the page.");
      }
    };
    
    loadUserData();
  }, [user]);

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      // Backend expects a combined 'name' field
      const apiPayload = {
        name: `${profileData.first_name} ${profileData.last_name}`.trim(),
        email: profileData.email,
        phone: profileData.phone
      };
      
      console.log("Updating profile with data:", apiPayload);
      
      // Send update to backend
      const updatedUser = await updateProfile(apiPayload);
      console.log("Profile update response:", updatedUser);
      
      setEditingProfile(false)
      toast.success('Cập nhật thông tin thành công!')
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast.error(error.message || 'Có lỗi xảy ra, vui lòng thử lại!')
    } finally {
      setLoading(false)
    }
  }

  const handleSavePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('Mật khẩu xác nhận không khớp!')
      return
    }

    if (passwordData.new_password.length < 8) {
      toast.error('Mật khẩu mới phải có ít nhất 8 ký tự!')
      return
    }

    setLoading(true)
    try {
      // Extract only the required fields for the API
      const passwordPayload = {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      };
      
      console.log("Updating password with payload:", passwordPayload);
      
      // Send password update to backend
      await userService.updatePassword(passwordPayload)
      
      setEditingPassword(false)
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      })
      toast.success('Đổi mật khẩu thành công!')
    } catch (error) {
      console.error('Failed to update password:', error)
      
      // Handle specific error types
      if (error.errorCode === 'authentication_error' || error.status === 401) {
        toast.error('Mật khẩu hiện tại không đúng!');
      } else if (error.errorCode === 'user_error' || error.status === 404) {
        toast.error('Mật khẩu mới phải khác mật khẩu hiện tại!');
      } else {
        toast.error(error.message || 'Có lỗi xảy ra, vui lòng thử lại!')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCancelProfile = () => {
    if (user) {
      const names = parseUserName(user.name);
      
      setProfileData({
        first_name: names.first_name || '',
        last_name: names.last_name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
    setEditingProfile(false)
  }

  const handleCancelPassword = () => {
    setPasswordData({
      current_password: '',
      new_password: '',
      confirm_password: ''
    })
    setEditingPassword(false)
  }

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Trang cá nhân</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Thông tin cá nhân */}
            <Card>
              <Card.Header>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <FaUser className="w-5 h-5" />
                    Thông tin cá nhân
                  </h2>
                  {!editingProfile ? (
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => setEditingProfile(true)}
                       className="flex items-center gap-2 border-blue-500 text-blue-600 hover:bg-blue-50"
                     >
                       <FaEdit className="w-4 h-4" />
                       Chỉnh sửa
                     </Button>
                   ) : (
                    <div className="flex gap-2">
                       <Button
                         size="sm"
                         onClick={handleSaveProfile}
                         disabled={loading}
                         className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white shadow-md"
                       >
                         <FaSave className="w-4 h-4" />
                         {loading ? 'Đang lưu...' : 'Lưu'}
                       </Button>
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={handleCancelProfile}
                         className="flex items-center gap-2 border-orange-400 text-orange-600 hover:bg-orange-50"
                       >
                        <FaTimes className="w-4 h-4" />
                        Hủy
                      </Button>
                    </div>
                  )}
                </div>
              </Card.Header>
              <Card.Body>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên
                    </label>
                    {editingProfile ? (
                       <input
                         type="text"
                         value={profileData.first_name}
                         onChange={(e) => handleProfileChange('first_name', e.target.value)}
                         className="w-full px-3 py-2 border border-blue-200 rounded-lg bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                       />
                     ) : (
                       <p className="text-gray-700 py-2 px-3 bg-blue-50 rounded-lg border border-blue-100">
                         {profileData.first_name || 'Chưa cập nhật'}
                       </p>
                     )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ
                    </label>
                    {editingProfile ? (
                       <input
                         type="text"
                         value={profileData.last_name}
                         onChange={(e) => handleProfileChange('last_name', e.target.value)}
                         className="w-full px-3 py-2 border border-blue-200 rounded-lg bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                       />
                     ) : (
                       <p className="text-gray-700 py-2 px-3 bg-blue-50 rounded-lg border border-blue-100">
                         {profileData.last_name || 'Chưa cập nhật'}
                       </p>
                     )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    {editingProfile ? (
                       <input
                         type="email"
                         value={profileData.email}
                         onChange={(e) => handleProfileChange('email', e.target.value)}
                         className="w-full px-3 py-2 border border-blue-200 rounded-lg bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                       />
                     ) : (
                       <p className="text-gray-700 py-2 px-3 bg-blue-50 rounded-lg border border-blue-100">
                         {profileData.email || 'Chưa cập nhật'}
                       </p>
                     )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại
                    </label>
                    {editingProfile ? (
                       <input
                         type="tel"
                         value={profileData.phone}
                         onChange={(e) => handleProfileChange('phone', e.target.value)}
                         className="w-full px-3 py-2 border border-blue-200 rounded-lg bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                       />
                     ) : (
                       <p className="text-gray-700 py-2 px-3 bg-blue-50 rounded-lg border border-blue-100">
                         {profileData.phone || 'Chưa cập nhật'}
                       </p>
                     )}
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Đổi mật khẩu */}
            <Card>
              <Card.Header>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <FaLock className="w-5 h-5" />
                    Đổi mật khẩu
                  </h2>
                  {!editingPassword ? (
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => setEditingPassword(true)}
                       className="flex items-center gap-2 border-purple-500 text-purple-600 hover:bg-purple-50"
                     >
                       <FaEdit className="w-4 h-4" />
                       Đổi mật khẩu
                     </Button>
                   ) : (
                    <div className="flex gap-2">
                       <Button
                         size="sm"
                         onClick={handleSavePassword}
                         disabled={loading}
                         className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white shadow-md"
                       >
                         <FaSave className="w-4 h-4" />
                         {loading ? 'Đang lưu...' : 'Lưu'}
                       </Button>
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={handleCancelPassword}
                         className="flex items-center gap-2 border-orange-400 text-orange-600 hover:bg-orange-50"
                       >
                        <FaTimes className="w-4 h-4" />
                        Hủy
                      </Button>
                    </div>
                  )}
                </div>
              </Card.Header>
              <Card.Body>
                {!editingPassword ? (
                  <div className="text-center py-8">
                    <FaLock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      Nhấn "Đổi mật khẩu" để cập nhật mật khẩu của bạn
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mật khẩu hiện tại
                      </label>
                      <div className="relative">
                         <input
                           type={showPassword.current ? 'text' : 'password'}
                           value={passwordData.current_password}
                           onChange={(e) => handlePasswordChange('current_password', e.target.value)}
                           className="w-full px-3 py-2 pr-10 border border-blue-200 rounded-lg bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                           placeholder="Nhập mật khẩu hiện tại"
                         />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('current')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword.current ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mật khẩu mới
                      </label>
                      <div className="relative">
                         <input
                           type={showPassword.new ? 'text' : 'password'}
                           value={passwordData.new_password}
                           onChange={(e) => handlePasswordChange('new_password', e.target.value)}
                           className="w-full px-3 py-2 pr-10 border border-blue-200 rounded-lg bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                           placeholder="Nhập mật khẩu mới (ít nhất 8 ký tự)"
                         />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('new')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword.new ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Xác nhận mật khẩu mới
                      </label>
                      <div className="relative">
                         <input
                           type={showPassword.confirm ? 'text' : 'password'}
                           value={passwordData.confirm_password}
                           onChange={(e) => handlePasswordChange('confirm_password', e.target.value)}
                           className="w-full px-3 py-2 pr-10 border border-blue-200 rounded-lg bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                           placeholder="Nhập lại mật khẩu mới"
                         />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('confirm')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                    <div className="text-sm text-gray-500">
                      <ul className="list-disc list-inside space-y-1">
                        <li>Mật khẩu phải có ít nhất 8 ký tự</li>
                        <li>Nên sử dụng kết hợp chữ hoa, chữ thường và số</li>
                      </ul>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 