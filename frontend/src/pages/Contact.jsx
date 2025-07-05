import { useState } from 'react'

const contactInfo = {
  address: '123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh',
  phone: '0123 456 789',
  email: 'contact@flightbooking.com',
  workingHours: 'Thứ 2 - Thứ 6: 8:00 - 17:30',
  socialMedia: {
    facebook: 'https://facebook.com/flightbooking',
    twitter: 'https://twitter.com/flightbooking',
    instagram: 'https://instagram.com/flightbooking'
  }
}

const contactMethods = [
  {
    icon: '📍',
    title: 'Địa chỉ văn phòng',
    details: contactInfo.address,
    description: 'Ghé thăm văn phòng của chúng tôi'
  },
  {
    icon: '📞',
    title: 'Điện thoại',
    details: contactInfo.phone,
    description: 'Gọi ngay để được hỗ trợ'
  },
  {
    icon: '✉️',
    title: 'Email',
    details: contactInfo.email,
    description: 'Gửi email cho chúng tôi'
  },
  {
    icon: '🕒',
    title: 'Giờ làm việc',
    details: contactInfo.workingHours,
    description: 'Thời gian hoạt động'
  }
]

const Contact = () => {

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800"></div>
        <div className="absolute inset-0 bg-black opacity-20"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute -top-10 -right-10 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-96 h-96 bg-blue-300 opacity-10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
              Liên hệ <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">với chúng tôi</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
              Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy liên hệ với chúng tôi
              nếu bạn có bất kỳ câu hỏi hoặc yêu cầu nào.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Methods */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Cách thức liên hệ</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Nhiều cách để bạn có thể liên hệ và kết nối với chúng tôi
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {contactMethods.map((method, index) => (
            <div key={index} className="group">
              <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-center h-full">
                <div className="text-5xl mb-6">{method.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{method.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{method.description}</p>
                <p className="text-blue-600 font-medium">{method.details}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Quick Contact */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Liên hệ nhanh</h3>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white">📞</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Hotline 24/7</p>
                    <a href={`tel:${contactInfo.phone}`} className="text-blue-600 hover:text-blue-700 font-medium">
                      {contactInfo.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white">✉️</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Email hỗ trợ</p>
                    <a href={`mailto:${contactInfo.email}`} className="text-blue-600 hover:text-blue-700 font-medium">
                      {contactInfo.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white">🕒</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Giờ làm việc</p>
                    <p className="text-gray-600">{contactInfo.workingHours}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Kết nối với chúng tôi</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <a
                  href={contactInfo.socialMedia.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center p-4 bg-blue-50 rounded-2xl hover:bg-blue-100 transition-colors duration-300 group"
                >
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Facebook</span>
                </a>
                
                <a
                  href={contactInfo.socialMedia.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center p-4 bg-sky-50 rounded-2xl hover:bg-sky-100 transition-colors duration-300 group"
                >
                  <div className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Twitter</span>
                </a>
                
                <a
                  href={contactInfo.socialMedia.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center p-4 bg-pink-50 rounded-2xl hover:bg-pink-100 transition-colors duration-300 group"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Instagram</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Có câu hỏi khác?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Xem trang FAQ của chúng tôi hoặc liên hệ trực tiếp để được hỗ trợ nhanh chóng
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Xem FAQ 📋
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact 