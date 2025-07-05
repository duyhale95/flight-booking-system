import { Link } from 'react-router-dom'

const destinations = [
  {
    id: 1,
    name: 'Gia Lai',
    image: '/images/destinations/gialai.png',
    description: 'Cao nguyên xanh mướt với những đồi chè bất tận',
    weather: '22°C',
    region: 'Tây Nguyên',
  },
  {
    id: 2,
    name: 'Hà Nội',
    image: '/images/destinations/hanoi.png',
    description: 'Thủ đô nghìn năm văn hiến với những di tích lịch sử',
    weather: '25°C',
    region: 'Miền Bắc',
  },
  {
    id: 3,
    name: 'Nghệ An',
    image: '/images/destinations/nghean.png',
    description: 'Vùng đất anh hùng với thiên nhiên hùng vĩ',
    weather: '26°C',
    region: 'Miền Trung',
  },
  {
    id: 4,
    name: 'Phú Quốc',
    image: '/images/destinations/phuquoc.png',
    description: 'Đảo ngọc với những bãi biển hoang sơ tuyệt đẹp',
    weather: '29°C',
    region: 'Miền Nam',
  },
]

export default function PopularDestinations() {
  return (
    <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Điểm đến tuyệt vời
          </h2>
          <p className="text-lg text-gray-600">
            Khám phá vẻ đẹp Việt Nam
          </p>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.map((destination) => (
            <Link
              key={destination.id}
              to={`/destination/${destination.id}`}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Image Container */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                
                {/* Weather Badge */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium text-gray-700">
                  🌤️ {destination.weather}
                </div>

                {/* Region Badge */}
                <div className="absolute top-4 left-4 bg-blue-500/80 text-white text-xs px-3 py-1 rounded-full font-medium">
                  📍 {destination.region}
                </div>
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-300 transition-colors">
                  {destination.name}
                </h3>
                <p className="text-gray-200 mb-3 text-sm line-clamp-2">
                  {destination.description}
                </p>
                {/* CTA */}
                <div className="flex items-center justify-between">
                  <div className="text-blue-300 text-sm font-medium">
                    Khám phá ngay
                  </div>
                  <div className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-full text-sm font-medium transition-colors group-hover:bg-blue-400">
                    Tìm hiểu →
                  </div>
                </div>
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-10">
          <Link
            to="/destinations"
            className="inline-flex items-center bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-3 rounded-full transition-colors duration-300 shadow-lg hover:shadow-xl"
          >
            <span>Xem tất cả điểm đến</span>
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
} 