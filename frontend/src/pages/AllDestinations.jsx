import { Link } from 'react-router-dom'
import { useState } from 'react'

const destinations = [
  {
    id: 1,
    name: 'Gia Lai',
    image: '/images/destinations/gialai.png',
    description: 'Cao nguyên xanh mướt với những đồi chè bất tận',
    highlights: ['Biển Hồ', 'Đồi chè Chư Sê'],
    weather: '22°C',
    region: 'Tây Nguyên',
  },
  {
    id: 2,
    name: 'Hà Nội',
    image: '/images/destinations/hanoi.png',
    description: 'Thủ đô nghìn năm văn hiến với những di tích lịch sử',
    highlights: ['Hồ Hoàn Kiếm', 'Phố Cổ'],
    weather: '25°C',
    region: 'Miền Bắc',
  },
  {
    id: 3,
    name: 'Nghệ An',
    image: '/images/destinations/nghean.png',
    description: 'Vùng đất anh hùng với thiên nhiên hùng vĩ',
    highlights: ['Phong Nha Kẻ Bàng', 'Biển Cửa Lò'],
    weather: '26°C',
    region: 'Miền Trung',
  },
  {
    id: 4,
    name: 'Phú Quốc',
    image: '/images/destinations/phuquoc.png',
    description: 'Đảo ngọc với những bãi biển hoang sơ tuyệt đẹp',
    highlights: ['Cáp treo Hòn Thơm', 'Bãi Sao'],
    weather: '29°C',
    region: 'Miền Nam',
  },
  {
    id: 5,
    name: 'Quảng Bình',
    image: '/images/destinations/quangbinh.png',
    description: 'Miền đất phong động với hang động kỳ vĩ',
    highlights: ['Hang Sơn Trà', 'Phong Nha Kẻ Bàng'],
    weather: '24°C',
    region: 'Miền Trung',
  },
  {
    id: 6,
    name: 'Thanh Hóa',
    image: '/images/destinations/thanhhoa.png',
    description: 'Vùng đất lịch sử với cảnh quan thiên nhiên hùng vĩ',
    highlights: ['Bãi biển Sầm Sơn', 'Động Hoa Tiên'],
    weather: '23°C',
    region: 'Miền Bắc',
  },
  {
    id: 7,
    name: 'Đà Lạt',
    image: '/images/destinations/dalat.png',
    description: 'Thành phố ngàn hoa với khí hậu mát mẻ quanh năm',
    highlights: ['Hồ Xuân Hương', 'Valley of Love'],
    weather: '18°C',
    region: 'Miền Nam',
  },
  {
    id: 8,
    name: 'Sapa',
    image: '/images/destinations/sapa.png',
    description: 'Vùng núi tuyệt đẹp với ruộng bậc thang hùng vĩ',
    highlights: ['Ruộng bậc thang', 'Đỉnh Fansipan'],
    weather: '15°C',
    region: 'Miền Bắc',
  },
  {
    id: 9,
    name: 'Hội An',
    image: '/images/destinations/hoian.png',
    description: 'Phố cổ với kiến trúc độc đáo và văn hóa đặc sắc',
    highlights: ['Phố cổ Hội An', 'Chùa Cầu'],
    weather: '27°C',
    region: 'Miền Trung',
  },
  {
    id: 10,
    name: 'Cần Thơ',
    image: '/images/destinations/cantho.png',
    description: 'Thủ phủ miền Tây với chợ nổi và vườn trái cây',
    highlights: ['Chợ nổi Cái Răng', 'Vườn trái cây'],
    weather: '28°C',
    region: 'Miền Nam',
  },
]

const regions = ['Tất cả', 'Miền Bắc', 'Miền Trung', 'Miền Nam', 'Tây Nguyên']

export default function AllDestinations() {
  const [selectedRegion, setSelectedRegion] = useState('Tất cả')
  const [sortBy, setSortBy] = useState('name')

  const filteredDestinations = destinations
    .filter(dest => selectedRegion === 'Tất cả' || dest.region === selectedRegion)
    .sort((a, b) => {
      if (sortBy === 'temperature') {
        return parseInt(a.weather) - parseInt(b.weather)
      }
      if (sortBy === 'name-desc') {
        return b.name.localeCompare(a.name)
      }
      return a.name.localeCompare(b.name)
    })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-500 to-sky-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Khám phá Việt Nam</h1>
          <p className="text-lg mb-6">
            {destinations.length} điểm đến tuyệt vời
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Region Filter */}
            <div className="flex items-center space-x-4">
              <span className="font-medium text-gray-700">Khu vực:</span>
              <div className="flex flex-wrap gap-2">
                {regions.map((region) => (
                  <button
                    key={region}
                    onClick={() => setSelectedRegion(region)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedRegion === region
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-4">
              <span className="font-medium text-gray-700">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="name">Tên A → Z</option>
                <option value="name-desc">Tên Z → A</option>
                <option value="temperature">Nhiệt độ thấp → cao</option>
              </select>
            </div>
          </div>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDestinations.map((destination) => (
            <Link
              key={destination.id}
              to={`/destination/${destination.id}`}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                
                {/* Region Badge */}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-gray-700">
                  📍 {destination.region}
                </div>

                {/* Weather Badge */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-gray-700">
                  🌤️ {destination.weather}
                </div>

                {/* Title on Image */}
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                    {destination.name}
                  </h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <p className="text-gray-600 mb-3 text-sm line-clamp-2">
                  {destination.description}
                </p>
                
                {/* Highlights */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {destination.highlights.map((highlight, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <div className="flex items-center justify-between">
                  <div className="text-blue-500 text-sm font-medium">
                    Khám phá ngay
                  </div>
                  <div className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors group-hover:bg-blue-400">
                    Tìm hiểu →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredDestinations.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏔️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Không tìm thấy điểm đến
            </h3>
            <p className="text-gray-600 mb-6">
              Hãy thử thay đổi bộ lọc để xem các điểm đến khác
            </p>
            <button
              onClick={() => setSelectedRegion('Tất cả')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full font-medium transition-colors"
            >
              Xem tất cả điểm đến
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 