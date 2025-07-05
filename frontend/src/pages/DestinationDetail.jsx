import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'

const destinationsData = {
  1: {
    id: 1,
    name: 'Gia Lai',
    image: '/images/destinations/gialai.png',
    description: 'Cao nguyên xanh mướt với những đồi chè bất tận',
    detailedDescription: 'Gia Lai - vùng đất Tây Nguyên hùng vĩ với những cảnh quan thiên nhiên tuyệt đẹp. Nơi đây nổi tiếng với những đồi chè xanh mướt, những hồ nước trong xanh và văn hóa các dân tộc thiểu số đặc sắc.',
    highlights: ['Biển Hồ', 'Đồi chè Chư Sê', 'Núi Hàm Rồng', 'Làng Kon Tum', 'Thác Sekumpul', 'Rừng Quốc gia Kon Ka Kinh'],
    weather: '22°C',
    bestTime: 'Tháng 10 - Tháng 3',
    activities: ['Trekking khám phá núi rừng', 'Thăm làng dân tộc', 'Ngắm hoàng hôn trên cao nguyên', 'Chụp ảnh đồi chè'],
    specialFood: ['Cơm lam', 'Thịt nướng lá chuối', 'Ruou cần', 'Bánh ít lá gai', 'Canh chua cá lăng'],
    region: 'Tây Nguyên',
    gallery: [
      '/images/destinations/gialai-1.jpg',
      '/images/destinations/gialai-2.jpg',
      '/images/destinations/gialai-3.jpg',
    ]
  },
  2: {
    id: 2,
    name: 'Hà Nội',
    image: '/images/destinations/hanoi.png',
    description: 'Thủ đô nghìn năm văn hiến với những di tích lịch sử',
    detailedDescription: 'Hà Nội - thành phố cổ kính với hơn 1000 năm lịch sử, nơi giao thoa giữa truyền thống và hiện đại. Từ những con phố cổ kính đến các tòa nhà hiện đại, Hà Nội luôn mang trong mình nét đẹp riêng biệt.',
    highlights: ['Hồ Hoàn Kiếm', 'Phố Cổ', 'Văn Miếu', 'Lăng Bác', 'Chợ Đồng Xuân', 'Nhà hát Lớn'],
    weather: '25°C',
    bestTime: 'Tháng 9 - Tháng 11, Tháng 3 - Tháng 5',
    activities: ['Thăm quan di tích lịch sử', 'Khám phá ẩm thực phố cổ', 'Dạo bộ quanh Hồ Hoàn Kiếm', 'Mua sắm tại chợ đêm'],
    specialFood: ['Phở Hà Nội', 'Bún chả', 'Chả cá Lã Vọng', 'Bánh cuốn', 'Cà phê trứng'],
    region: 'Miền Bắc',
    gallery: [
      '/images/destinations/hanoi-1.jpg',
      '/images/destinations/hanoi-2.jpg',
      '/images/destinations/hanoi-3.jpg',
    ]
  },
  3: {
    id: 3,
    name: 'Nghệ An',
    image: '/images/destinations/nghean.png',
    description: 'Vùng đất anh hùng với thiên nhiên hùng vĩ',
    detailedDescription: 'Nghệ An - vùng đất anh hùng với lịch sử hào hùng và cảnh quan thiên nhiên tuyệt đẹp. Nơi đây có cả biển và núi, từ những bãi biển hoang sơ đến những dãy núi hùng vĩ.',
    highlights: ['Phong Nha Kẻ Bàng', 'Biển Cửa Lò', 'Đền Cuông', 'Làng Sen', 'Bãi biển Diễn Thành', 'Núi Cửa Sốt'],
    weather: '26°C',
    bestTime: 'Tháng 4 - Tháng 8',
    activities: ['Tắm biển và thể thao nước', 'Khám phá hang động', 'Thăm quê Bác Hồ', 'Leo núi trekking'],
    specialFood: ['Nem chua Thanh Hóa', 'Cá nướng lá chuối', 'Bánh mướt', 'Tôm càng xanh', 'Chè Lam'],
    region: 'Miền Trung',
    gallery: [
      '/images/destinations/nghean-1.jpg',
      '/images/destinations/nghean-2.jpg',
      '/images/destinations/nghean-3.jpg',
    ]
  },
  4: {
    id: 4,
    name: 'Phú Quốc',
    image: '/images/destinations/phuquoc.png',
    description: 'Đảo ngọc với những bãi biển hoang sơ tuyệt đẹp',
    detailedDescription: 'Phú Quốc - đảo ngọc xinh đẹp với những bãi biển hoang sơ và làn nước trong như pha lê. Thiên đường nghỉ dưỡng với các resort cao cấp và ẩm thực hải sản tuyệt vời.',
    highlights: ['Cáp treo Hòn Thơm', 'Chợ đêm Dinh Cậu', 'Bãi Sao', 'VinWonders', 'Bãi Trường', 'Rừng nguyên sinh'],
    weather: '29°C',
    bestTime: 'Tháng 11 - Tháng 4',
    activities: ['Lặn ngắm san hô', 'Câu cá trên biển', 'Tham quan vườn tiêu', 'Ngắm hoàng hôn'],
    specialFood: ['Ghẹ Hàm Ninh', 'Hàu nướng', 'Nhum biển', 'Tôm tít', 'Nước mắm Phú Quốc'],
    region: 'Miền Nam',
    gallery: [
      '/images/destinations/phuquoc-1.jpg',
      '/images/destinations/phuquoc-2.jpg',
      '/images/destinations/phuquoc-3.jpg',
    ]
  },
  5: {
    id: 5,
    name: 'Quảng Bình',
    image: '/images/destinations/quangbinh.png',
    description: 'Miền đất phong động với hang động kỳ vĩ',
    detailedDescription: 'Quảng Bình - miền đất của những hang động kỳ vĩ và cảnh quan karst tuyệt đẹp. Nơi đây có hang Sơn Trà - hang động lớn nhất thế giới và vườn quốc gia Phong Nha - Kẻ Bàng.',
    highlights: ['Hang Sơn Trà', 'Phong Nha Kẻ Bàng', 'Biển Nhật Lệ', 'Hang Thiên Đường', 'Suối nước Moọc', 'Động Phong Nha'],
    weather: '24°C',
    bestTime: 'Tháng 2 - Tháng 8',
    activities: ['Khám phá hang động', 'Trekking trong rừng quốc gia', 'Chèo kayak sông Chày', 'Tắm biển'],
    specialFood: ['Bánh khoái', 'Nem nướng', 'Cháo canh', 'Bánh ép', 'Cà phê Trung Nguyên'],
    region: 'Miền Trung',
    gallery: [
      '/images/destinations/quangbinh-1.jpg',
      '/images/destinations/quangbinh-2.jpg',
      '/images/destinations/quangbinh-3.jpg',
    ]
  },
  6: {
    id: 6,
    name: 'Thanh Hóa',
    image: '/images/destinations/thanhhoa.png',
    description: 'Vùng đất lịch sử với cảnh quan thiên nhiên hùng vĩ',
    detailedDescription: 'Thanh Hóa - vùng đất lịch sử với cảnh quan thiên nhiên đa dạng từ biển đến núi. Nơi đây có bãi biển Sầm Sơn nổi tiếng và nhiều di tích lịch sử quan trọng.',
    highlights: ['Bãi biển Sầm Sơn', 'Động Hoa Tiên', 'Hồ Hòa Bình', 'Citadel Hồ', 'Núi Bài Đính', 'Đền Trần'],
    weather: '23°C',
    bestTime: 'Tháng 4 - Tháng 10',
    activities: ['Tắm biển Sầm Sơn', 'Khám phá động hang', 'Thăm quan di tích lịch sử', 'Leo núi'],
    specialFood: ['Nem chua', 'Bánh cuốn Thanh Hóa', 'Cháo lươn', 'Cá nướng lá chuối', 'Chè lam'],
    region: 'Miền Bắc',
    gallery: [
      '/images/destinations/thanhhoa-1.jpg',
      '/images/destinations/thanhhoa-2.jpg',
      '/images/destinations/thanhhoa-3.jpg',
    ]
  },
  7: {
    id: 7,
    name: 'Đà Lạt',
    image: '/images/destinations/dalat.png',
    description: 'Thành phố ngàn hoa với khí hậu mát mẻ quanh năm',
    detailedDescription: 'Đà Lạt - thành phố ngàn hoa với khí hậu mát mẻ quanh năm. Được mệnh danh là Paris thu nhỏ với những villa Pháp cổ kính và những vườn hoa rực rỡ.',
    highlights: ['Hồ Xuân Hương', 'Valley of Love', 'Crazy House', 'Chùa Linh Phước', 'Đồi Mộng Mơ', 'Đường hầm đất sét'],
    weather: '18°C',
    bestTime: 'Quanh năm',
    activities: ['Thăm quan vườn hoa', 'Dạo phố về đêm', 'Thử món ăn đặc sản', 'Chụp ảnh cưới'],
    specialFood: ['Bánh tráng nướng', 'Nem nướng Đà Lạt', 'Sữa đậu nành', 'Artichoke', 'Bánh căn mini'],
    region: 'Miền Nam',
    gallery: [
      '/images/destinations/dalat-1.jpg',
      '/images/destinations/dalat-2.jpg',
      '/images/destinations/dalat-3.jpg',
    ]
  },
  8: {
    id: 8,
    name: 'Sapa',
    image: '/images/destinations/sapa.png',
    description: 'Vùng núi tuyệt đẹp với ruộng bậc thang hùng vĩ',
    detailedDescription: 'Sapa - vùng núi phía Bắc với cảnh quan thiên nhiên hùng vĩ và văn hóa dân tộc đặc sắc. Ruộng bậc thang Sapa được UNESCO công nhận là di sản văn hóa thế giới.',
    highlights: ['Ruộng bậc thang', 'Đỉnh Fansipan', 'Bản Cát Cát', 'Thác Bạc', 'Núi Hàm Rồng', 'Chợ tình Sapa'],
    weather: '15°C',
    bestTime: 'Tháng 3 - Tháng 5, Tháng 9 - Tháng 11',
    activities: ['Trekking khám phá ruộng bậc thang', 'Chinh phục đỉnh Fansipan', 'Thăm bản làng dân tộc', 'Ngắm cảnh núi non'],
    specialFood: ['Thịt trâu gác bếp', 'Cá suối nướng', 'Rau rừng', 'Bánh chưng đen', 'Rượu táo mèo'],
    region: 'Miền Bắc',
    gallery: [
      '/images/destinations/sapa-1.jpg',
      '/images/destinations/sapa-2.jpg',
      '/images/destinations/sapa-3.jpg',
    ]
  },
  9: {
    id: 9,
    name: 'Hội An',
    image: '/images/destinations/hoian.png',
    description: 'Phố cổ với kiến trúc độc đáo và văn hóa đặc sắc',
    detailedDescription: 'Hội An - phố cổ với kiến trúc độc đáo được UNESCO công nhận là di sản văn hóa thế giới. Nơi đây gìn giữ được nét đẹp cổ kính với những ngôi nhà cổ, hội quán và đèn lồng rực rỡ.',
    highlights: ['Phố cổ Hội An', 'Chùa Cầu', 'Đèn lồng', 'Nhà cổ Tấn Ký', 'Chợ Hội An', 'Rừng dừa Bảy Mẫu'],
    weather: '27°C',
    bestTime: 'Tháng 2 - Tháng 8',
    activities: ['Dạo phố cổ về đêm', 'Thả đèn hoa đăng', 'Học nấu ăn truyền thống', 'Tour rừng dừa'],
    specialFood: ['Cao lầu', 'Bánh mì Hội An', 'Com hen', 'Bánh bao bánh vạc', 'Chè bưởi'],
    region: 'Miền Trung',
    gallery: [
      '/images/destinations/hoian-1.jpg',
      '/images/destinations/hoian-2.jpg',
      '/images/destinations/hoian-3.jpg',
    ]
  },
  10: {
    id: 10,
    name: 'Cần Thơ',
    image: '/images/destinations/cantho.png',
    description: 'Thủ phủ miền Tây với chợ nổi và vườn trái cây',
    detailedDescription: 'Cần Thơ - thủ phủ miền Tây Nam Bộ với hệ thống sông nước và văn hóa đồng bằng sông Cửu Long đặc sắc. Nơi đây nổi tiếng với chợ nổi Cái Răng và những vườn trái cây xanh mướt.',
    highlights: ['Chợ nổi Cái Răng', 'Vườn trái cây', 'Nhà cổ Bình Thủy', 'Chùa Khmer', 'Khu du lịch Mỹ Khánh', 'Cồn Sơn'],
    weather: '28°C',
    bestTime: 'Tháng 12 - Tháng 4',
    activities: ['Du ngoạn chợ nổi', 'Thăm vườn trái cây', 'Chèo thuyền trên sông', 'Thưởng thức đặc sản miền Tây'],
    specialFood: ['Bánh cần', 'Lẩu mắm', 'Cá lóc nướng trui', 'Bánh xèo miền Tây', 'Chè thái'],
    region: 'Miền Nam',
    gallery: [
      '/images/destinations/cantho-1.jpg',
      '/images/destinations/cantho-2.jpg',
      '/images/destinations/cantho-3.jpg',
    ]
  }
}

export default function DestinationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const destination = destinationsData[id]
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedImage, setSelectedImage] = useState(null)

  if (!destination) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy điểm đến</h1>
          <Link to="/" className="text-blue-500 hover:text-blue-600">Quay về trang chủ</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-80 overflow-hidden">
        <img
          src={destination.image}
          alt={destination.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-3">{destination.name}</h1>
            <p className="text-lg mb-4">{destination.description}</p>
            <div className="flex items-center justify-center space-x-4">
              <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                🌤️ {destination.weather}
              </span>
              <span className="bg-blue-500 px-4 py-2 rounded-full font-semibold">
                📍 {destination.region}
              </span>
            </div>
          </div>
        </div>
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all duration-200 hover:scale-105"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex space-x-1 bg-white p-1 rounded-xl mb-6 shadow-sm border border-gray-200">
              {[
                { id: 'overview', label: 'Tổng quan' },
                { id: 'attractions', label: 'Điểm tham quan' },
                { id: 'food', label: 'Ẩm thực' },
                { id: 'activities', label: 'Hoạt động' },
                { id: 'gallery', label: 'Hình ảnh' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50 bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              {activeTab === 'overview' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Về {destination.name}</h2>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {destination.detailedDescription}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">📅 Thời gian tốt nhất</h3>
                      <p className="text-gray-600">{destination.bestTime}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">🌡️ Khí hậu</h3>
                      <p className="text-gray-600">Nhiệt độ: {destination.weather}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'attractions' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Điểm tham quan</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {destination.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors duration-200">
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <span className="text-gray-800 font-medium">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'food' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Ẩm thực đặc sản</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {destination.specialFood.map((food, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-amber-50 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors duration-200">
                        <span className="text-xl">🍽️</span>
                        <span className="text-gray-800 font-medium">{food}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'activities' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Hoạt động thú vị</h2>
                  <div className="space-y-3">
                    {destination.activities.map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors duration-200">
                        <span className="text-xl">🎯</span>
                        <span className="text-gray-800 font-medium">{activity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'gallery' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Thư viện ảnh</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {destination.gallery.map((image, index) => (
                      <div key={index} className="relative group overflow-hidden rounded-lg cursor-pointer" onClick={() => setSelectedImage(image)}>
                        <img
                          src={image}
                          alt={`${destination.name} ${index + 1}`}
                          className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300"></div>
                      </div>
                    ))}
                  </div>
                  {selectedImage && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setSelectedImage(null)}>
                      <div className="relative" onClick={e => e.stopPropagation()}>
                        <img src={selectedImage} alt="Phóng to" className="max-w-[90vw] max-h-[80vh] rounded-xl shadow-2xl" />
                        <button
                          className="absolute top-2 right-2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow"
                          onClick={() => setSelectedImage(null)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Quick Info */}
            <div className="bg-white rounded-xl p-5 shadow-sm mb-6">
              <h3 className="font-bold text-gray-900 mb-3">📍 Thông tin</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Khu vực:</span>
                  <span className="font-medium">{destination.region}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Khí hậu:</span>
                  <span className="font-medium">{destination.weather}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Thời gian tốt:</span>
                  <span className="font-medium text-sm">{destination.bestTime}</span>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl p-5 shadow-sm border border-blue-200">
              <h3 className="font-bold text-gray-900 mb-3">💡 Mẹo du lịch</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start space-x-2">
                  <span className="text-blue-400">•</span>
                  <span className="text-gray-700">Nên đặt chỗ trước</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-400">•</span>
                  <span className="text-gray-700">Mang kem chống nắng</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-400">•</span>
                  <span className="text-gray-700">Tôn trọng văn hóa địa phương</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-400">•</span>
                  <span className="text-gray-700">Chuẩn bị giày thoải mái</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 