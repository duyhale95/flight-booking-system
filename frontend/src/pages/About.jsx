import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const teamMembers = [
  {
    name: 'Võ Nguyên Đăng',
    position: 'Giám đốc điều hành',
    image: '/images/team/ceo.jpg',
    bio: 'Với hơn 15 năm kinh nghiệm trong ngành hàng không, ông Đăng đã dẫn dắt công ty phát triển vượt bậc trong những năm qua.',
    social: {
      linkedin: '#',
      twitter: '#'
    }
  },
  {
    name: 'Hà Lê Duy',
    position: 'Giám đốc kinh doanh',
    image: '/images/team/cmo.jpg',
    bio: 'Anh Duy có hơn 10 năm kinh nghiệm trong lĩnh vực marketing và phát triển kinh doanh.',
    social: {
      linkedin: '#',
      twitter: '#'
    }
  },
  {
    name: 'Nguyễn Trần Nghĩa',
    position: 'Giám đốc kỹ thuật',
    image: '/images/team/cto.jpg',
    bio: 'Ông Nghĩa là chuyên gia trong lĩnh vực công nghệ hàng không và đã đóng góp nhiều sáng kiến cho ngành.',
    social: {
      linkedin: '#',
      twitter: '#'
    }
  }
]

const milestones = [
  {
    year: '2010',
    title: 'Thành lập công ty',
    description: 'Công ty được thành lập với sứ mệnh cung cấp dịch vụ đặt vé máy bay trực tuyến chất lượng cao.',
    icon: '🚀'
  },
  {
    year: '2015',
    title: 'Mở rộng thị trường',
    description: 'Mở rộng hoạt động kinh doanh ra toàn quốc và các nước trong khu vực Đông Nam Á.',
    icon: '🌏'
  },
  {
    year: '2018',
    title: 'Đổi mới công nghệ',
    description: 'Ứng dụng công nghệ mới vào hệ thống đặt vé, mang lại trải nghiệm tốt hơn cho khách hàng.',
    icon: '💡'
  },
  {
    year: '2020',
    title: 'Đạt chứng nhận ISO',
    description: 'Đạt chứng nhận ISO 9001:2015 về quản lý chất lượng dịch vụ.',
    icon: '🏆'
  },
  {
    year: '2025',
    title: 'Sắp phá sản',
    description: 'Sắp phá sản vì không có khách hàng.',
    icon: '💔'
  }
]

const stats = [
  { label: 'Khách hàng hài lòng', value: '98%' },
  { label: 'Vé đã bán', value: '2M+' },
  { label: 'Năm kinh nghiệm', value: '15+' },
  { label: 'Đối tác hàng không', value: '50+' }
]

export default function About() {
  const [activeTab, setActiveTab] = useState('about')
  const navigate = useNavigate()

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
              Về <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Chúng tôi</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed mb-12">
              Chúng tôi là đơn vị hàng đầu trong lĩnh vực đặt vé máy bay trực tuyến,
              cam kết mang đến trải nghiệm đặt vé nhanh chóng, an toàn và tiện lợi cho khách hàng.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-blue-200 text-sm md:text-base">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-100">
            <nav className="flex space-x-2">
              {[
                { key: 'about', label: 'Giới thiệu', icon: '📖' },
                { key: 'team', label: 'Đội ngũ', icon: '👥' },
                { key: 'milestones', label: 'Cột mốc', icon: '📈' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`${
                    activeTab === tab.key
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                      : 'bg-white text-gray-600 hover:text-gray-800 hover:bg-gray-50 shadow-sm'
                  } px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 flex items-center space-x-2`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-12">
          {activeTab === 'about' && (
            <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12">
                {/* Mission */}
                <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
                  <div className="text-4xl mb-4">🎯</div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Sứ mệnh của chúng tôi</h2>
                  <p className="text-gray-600 leading-relaxed">
                    Chúng tôi cam kết mang đến dịch vụ đặt vé máy bay trực tuyến chất lượng cao,
                    giúp khách hàng dễ dàng tìm kiếm và đặt vé với giá tốt nhất. Chúng tôi luôn
                    nỗ lực cải thiện trải nghiệm người dùng và cung cấp dịch vụ chăm sóc khách
                    hàng xuất sắc.
                  </p>
                </div>

                {/* Vision */}
                <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
                  <div className="text-4xl mb-4">🔮</div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Tầm nhìn</h2>
                  <p className="text-gray-600 leading-relaxed">
                    Trở thành nền tảng đặt vé máy bay trực tuyến hàng đầu tại Việt Nam và khu vực
                    Đông Nam Á, được khách hàng tin tưởng và lựa chọn.
                  </p>
                </div>
              </div>

              {/* Core Values */}
              <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Giá trị cốt lõi</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { icon: '⭐', title: 'Chất lượng', desc: 'Cam kết cung cấp dịch vụ chất lượng cao nhất' },
                    { icon: '🚀', title: 'Đổi mới', desc: 'Không ngừng cải tiến và áp dụng công nghệ mới' },
                    { icon: '🤝', title: 'Tin cậy', desc: 'Xây dựng niềm tin với khách hàng thông qua sự minh bạch' },
                    { icon: '🌱', title: 'Bền vững', desc: 'Đóng góp tích cực cho cộng đồng và môi trường' }
                  ].map((value, index) => (
                    <div key={index} className="text-center bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <div className="text-3xl mb-3">{value.icon}</div>
                      <h3 className="font-bold text-gray-800 mb-2">{value.title}</h3>
                      <p className="text-sm text-gray-600">{value.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl font-bold text-center text-gray-800 mb-4">Đội ngũ lãnh đạo</h2>
              <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
                Những con người tài năng và tận tâm đứng sau thành công của chúng tôi
              </p>
              
              <div className="grid md:grid-cols-3 gap-8">
                {teamMembers.map((member, index) => (
                  <div key={member.name} className="group">
                    <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                      <div className="relative mb-6">
                        <img
                          className="w-32 h-32 rounded-full mx-auto object-cover ring-4 ring-blue-100 group-hover:ring-blue-300 transition-all duration-300"
                          src={member.image}
                          alt={member.name}
                        />
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{member.name}</h3>
                        <p className="text-blue-600 font-medium mb-4">{member.position}</p>
                        <p className="text-gray-600 text-sm leading-relaxed mb-6">{member.bio}</p>
                        
                        <div className="flex justify-center space-x-3">
                          <a href={member.social.linkedin} className="w-10 h-10 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center transition-colors duration-300">
                            <span className="text-blue-600">💼</span>
                          </a>
                          <a href={member.social.twitter} className="w-10 h-10 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center transition-colors duration-300">
                            <span className="text-blue-600">🐦</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'milestones' && (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold text-center text-gray-800 mb-4">Hành trình phát triển</h2>
              <p className="text-center text-gray-600 mb-12">
                Những cột mốc quan trọng trong quá trình phát triển của chúng tôi
              </p>
              
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
                
                <div className="space-y-12">
                  {milestones.map((milestone, index) => (
                    <div key={milestone.year} className={`relative flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                      {/* Timeline dot */}
                      <div className="absolute left-1/2 transform -translate-x-1/2 w-16 h-16 bg-white rounded-full shadow-lg border-4 border-blue-500 flex items-center justify-center text-2xl z-10">
                        {milestone.icon}
                      </div>
                      
                      {/* Content */}
                      <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                        <div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-2xl font-bold text-blue-600">{milestone.year}</span>
                          </div>
                          <h3 className="text-xl font-bold text-gray-800 mb-3">{milestone.title}</h3>
                          <p className="text-gray-600 leading-relaxed">{milestone.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Sẵn sàng khám phá thế giới?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Hãy để chúng tôi giúp bạn tìm chuyến bay hoàn hảo với giá tốt nhất
          </p>
          <button 
            onClick={() => navigate('/')} 
            className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Đặt vé ngay ✈️
          </button>
        </div>
      </div>
    </div>
  )
} 