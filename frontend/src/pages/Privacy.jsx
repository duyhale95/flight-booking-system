import Card from '../components/ui/Card'

const Privacy = () => {
  const sections = [
    {
      title: "Thông tin chúng tôi thu thập",
      icon: "📊",
      content: [
        "Thông tin cá nhân: Họ tên, ngày sinh, quốc tịch, số CMND/CCCD/Hộ chiếu",
        "Thông tin liên lạc: Email, số điện thoại, địa chỉ",
        "Thông tin thanh toán: Số thẻ, thông tin ngân hàng (được mã hóa)",
        "Thông tin kỹ thuật: Địa chỉ IP, loại trình duyệt, hệ điều hành",
        "Lịch sử giao dịch: Các chuyến bay đã đặt, tùy chọn dịch vụ"
      ]
    },
    {
      title: "Mục đích sử dụng thông tin",
      icon: "🎯",
      content: [
        "Xử lý đặt vé và cung cấp dịch vụ đã yêu cầu",
        "Xác nhận danh tính và thông tin thanh toán",
        "Liên lạc về trạng thái đơn hàng và chuyến bay",
        "Cải thiện chất lượng dịch vụ và trải nghiệm người dùng",
        "Tuân thủ các quy định pháp luật và an ninh hàng không",
        "Gửi thông tin khuyến mãi (nếu đã đăng ký nhận)",
        "Phân tích và nghiên cứu thị trường"
      ]
    },
    {
      title: "Chia sẻ thông tin với bên thứ ba",
      icon: "🤝",
      content: [
        "Hãng hàng không: Để xử lý vé và dịch vụ bay",
        "Nhà cung cấp thanh toán: Để xử lý giao dịch tài chính",
        "Cơ quan chính phủ: Khi có yêu cầu hợp pháp",
        "Đối tác công nghệ: Để duy trì và cải thiện hệ thống",
        "Không bán hoặc cho thuê thông tin cho mục đích thương mại",
        "Yêu cầu tất cả đối tác tuân thủ tiêu chuẩn bảo mật cao"
      ]
    },
    {
      title: "Bảo mật thông tin",
      icon: "🔒",
      content: [
        "Mã hóa SSL 256-bit cho tất cả giao dịch",
        "Lưu trữ dữ liệu tại trung tâm có chứng nhận bảo mật",
        "Kiểm soát truy cập nghiêm ngặt với xác thực đa yếu tố",
        "Sao lưu dữ liệu định kỳ với mã hóa",
        "Giám sát hệ thống 24/7 để phát hiện bất thường",
        "Đào tạo nhân viên về bảo mật thông tin",
        "Kiểm tra bảo mật định kỳ bởi chuyên gia độc lập"
      ]
    },
    {
      title: "Cookies và công nghệ theo dõi",
      icon: "🍪",
      content: [
        "Cookies cần thiết: Duy trì phiên đăng nhập và chức năng cơ bản",
        "Cookies phân tích: Theo dõi cách sử dụng để cải thiện website",
        "Cookies tiếp thị: Hiển thị quảng cáo phù hợp (có thể tắt)",
        "Bạn có thể quản lý cookies trong cài đặt trình duyệt",
        "Một số tính năng có thể bị hạn chế khi tắt cookies"
      ]
    },
    {
      title: "Quyền của người dùng",
      icon: "⚖️",
      content: [
        "Quyền truy cập: Xem thông tin cá nhân chúng tôi lưu trữ",
        "Quyền chỉnh sửa: Yêu cầu sửa đổi thông tin không chính xác",
        "Quyền xóa: Yêu cầu xóa tài khoản và dữ liệu cá nhân",
        "Quyền di chuyển: Xuất dữ liệu sang định dạng khác",
        "Quyền hạn chế: Giới hạn việc xử lý dữ liệu",
        "Quyền từ chối: Không nhận thông tin marketing",
        "Quyền khiếu nại: Báo cáo vi phạm quyền riêng tư"
      ]
    },
    {
      title: "Lưu trữ và xóa dữ liệu",
      icon: "📦",
      content: [
        "Dữ liệu được lưu trữ theo quy định pháp luật Việt Nam",
        "Thông tin giao dịch lưu trữ tối thiểu 5 năm",
        "Dữ liệu marketing được xóa khi người dùng hủy đăng ký",
        "Tài khoản không hoạt động quá 3 năm sẽ được xóa",
        "Người dùng có thể yêu cầu xóa dữ liệu bất cứ lúc nào",
        "Một số thông tin có thể được lưu để tuân thủ pháp luật"
      ]
    }
  ]

  const quickLinks = [
    { title: "Điều khoản sử dụng", href: "/terms", icon: "📜" },
    { title: "Câu hỏi thường gặp", href: "/faq", icon: "❓" },
    { title: "Liên hệ", href: "mailto:privacy@flightbooking.vn", icon: "📧" },
    { title: "Báo cáo vi phạm", href: "mailto:security@flightbooking.vn", icon: "🚨" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block p-4 bg-gradient-to-r from-green-600 to-blue-600 rounded-full text-white text-4xl mb-6 shadow-lg">
              🛡️
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Chính sách bảo mật
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn. Tìm hiểu cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu của bạn.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
              <span>📅</span>
              Cập nhật: 20/12/2024
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {quickLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="block bg-white rounded-xl p-4 text-center shadow-lg border-0 hover:shadow-xl transition-all duration-300 hover:scale-105 group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">
                  {link.icon}
                </div>
                <div className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-300">
                  {link.title}
                </div>
              </a>
            ))}
          </div>

          {/* Privacy Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <Card key={index} className="shadow-xl border-0 overflow-hidden">
                <Card.Header className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
                  <h2 className="text-xl font-bold flex items-center gap-3">
                    <span className="text-2xl">{section.icon}</span>
                    {section.title}
                  </h2>
                </Card.Header>
                <Card.Body>
                  <div className="space-y-3">
                    {section.content.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0 w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                          ✓
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>

          {/* Action Section */}
          <div className="mt-16">
            <Card className="shadow-2xl border-0 overflow-hidden">
              <Card.Body className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center p-8">
                <div className="text-4xl mb-4">🔐</div>
                <h2 className="text-2xl font-bold mb-4">
                  Thực hiện quyền của bạn
                </h2>
                <p className="text-purple-100 mb-6 text-lg max-w-2xl mx-auto">
                  Bạn có quyền kiểm soát hoàn toàn thông tin cá nhân của mình. Liên hệ với chúng tôi để thực hiện các quyền này.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a 
                    href="mailto:privacy@flightbooking.vn"
                    className="bg-white text-purple-600 font-semibold py-3 px-8 rounded-xl hover:bg-purple-50 transition-colors duration-200 shadow-lg"
                  >
                    📧 Yêu cầu dữ liệu
                  </a>
                  <a 
                    href="mailto:privacy@flightbooking.vn"
                    className="bg-purple-700 text-white font-semibold py-3 px-8 rounded-xl hover:bg-purple-800 transition-colors duration-200 shadow-lg border border-purple-500"
                  >
                    🗑️ Xóa tài khoản
                  </a>
                </div>
              </Card.Body>
            </Card>
          </div>

          {/* Contact Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-lg border-0">
              <Card.Body className="bg-blue-50 p-6">
                <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <span className="text-xl">📞</span>
                  Liên hệ bảo mật
                </h3>
                <p className="text-blue-700 mb-4">
                  Có thắc mắc về chính sách bảo mật?
                </p>
                <div className="space-y-2">
                  <a href="mailto:privacy@flightbooking.vn" className="block text-blue-600 hover:text-blue-700 font-medium">
                    📧 privacy@flightbooking.vn
                  </a>
                  <a href="tel:1900-1234" className="block text-blue-600 hover:text-blue-700 font-medium">
                    📞 1900-1234
                  </a>
                </div>
              </Card.Body>
            </Card>

            <Card className="shadow-lg border-0">
              <Card.Body className="bg-red-50 p-6">
                <h3 className="text-lg font-bold text-red-900 mb-3 flex items-center gap-2">
                  <span className="text-xl">🚨</span>
                  Báo cáo vi phạm
                </h3>
                <p className="text-red-700 mb-4">
                  Phát hiện sử dụng thông tin không đúng?
                </p>
                <div className="space-y-2">
                  <a href="mailto:security@flightbooking.vn" className="block text-red-600 hover:text-red-700 font-medium">
                    📧 security@flightbooking.vn
                  </a>
                  <a href="/terms" className="block text-red-600 hover:text-red-700 font-medium">
                    📜 Xem điều khoản
                  </a>
                </div>
              </Card.Body>
            </Card>
          </div>

          {/* Compliance Footer */}
          <div className="mt-8">
            <Card className="shadow-lg border-0">
              <Card.Body className="bg-gray-50 text-center p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Tuân thủ pháp luật Việt Nam
                </h3>
                <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
                  <span className="bg-white px-3 py-1 rounded-full">🇻🇳 Luật An toàn thông tin mạng</span>
                  <span className="bg-white px-3 py-1 rounded-full">🏛️ Nghị định 13/2023/NĐ-CP</span>
                  <span className="bg-white px-3 py-1 rounded-full">🔒 ISO 27001</span>
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Privacy 