import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Flight Booking</h3>
            <p className="text-gray-400">
              Đặt vé máy bay trực tuyến với giá tốt nhất. Hỗ trợ 24/7.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Liên kết</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/search" className="text-gray-400 hover:text-white">
                  Tìm chuyến bay
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white">
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link to="/destinations" className="text-gray-400 hover:text-white">
                  Điểm đến
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Hỗ trợ</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-white">
                  Câu hỏi thường gặp
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-white">
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-white">
                  Chính sách bảo mật
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Hotline: 1900 1234</li>
              <li>Email: support@flightbooking.com</li>
              <li>Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Flight Booking. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
} 