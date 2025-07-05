import Card from '../components/ui/Card'

const Terms = () => {
  const sections = [
    {
      title: "1. Điều khoản chung",
      icon: "📋",
      content: [
        "Website đặt vé máy bay này được vận hành bởi Công ty Du lịch và Hàng không Việt Nam.",
        "Việc sử dụng website này đồng nghĩa với việc bạn đồng ý tuân thủ toàn bộ các điều khoản và điều kiện được quy định dưới đây.",
        "Chúng tôi có quyền thay đổi, sửa đổi các điều khoản này bất cứ lúc nào mà không cần thông báo trước. Người dùng có trách nhiệm kiểm tra các cập nhật định kỳ.",
        "Nếu bạn không đồng ý với bất kỳ điều khoản nào, vui lòng ngừng sử dụng dịch vụ của chúng tôi ngay lập tức."
      ]
    },
    {
      title: "2. Quy định đặt vé và thanh toán",
      icon: "💳",
      content: [
        "Giá vé hiển thị trên website đã bao gồm thuế và phí theo quy định của pháp luật.",
        "Khách hàng có 40 phút để hoàn tất thanh toán sau khi chọn vé. Quá thời hạn này, vé sẽ tự động bị hủy.",
        "Mọi giao dịch thanh toán đều được thực hiện qua các cổng thanh toán bảo mật được ủy quyền.",
        "Chúng tôi không chịu trách nhiệm về các khoản phí phát sinh từ ngân hàng hoặc nhà cung cấp dịch vụ thanh toán.",
        "Việc xác nhận đặt vé chỉ có hiệu lực khi chúng tôi nhận được thanh toán đầy đủ và gửi email xác nhận đến khách hàng."
      ]
    },
    {
      title: "3. Chính sách hủy và đổi vé",
      icon: "🔄",
      content: [
        "Việc hủy hoặc đổi vé phải tuân thủ theo chính sách của từng hãng hàng không cụ thể.",
        "Phí hủy/đổi vé sẽ được tính theo quy định của hãng hàng không và có thể thay đổi tùy theo loại vé.",
        "Yêu cầu hủy/đổi vé phải được gửi trước giờ khởi hành ít nhất 2 giờ đối với chuyến bay nội địa, 4 giờ đối với chuyến bay quốc tế.",
        "Một số loại vé khuyến mãi hoặc vé giá rẻ có thể không được phép hủy hoặc đổi.",
        "Tiền hoàn trả (nếu có) sẽ được chuyển về tài khoản ngân hàng của khách hàng trong vòng 7-15 ngày làm việc."
      ]
    },
    {
      title: "4. Trách nhiệm của khách hàng",
      icon: "👤",
      content: [
        "Khách hàng có trách nhiệm cung cấp thông tin chính xác, đầy đủ khi đặt vé.",
        "Đảm bảo tên trên vé trùng khớp hoàn toàn với giấy tờ tùy thân được sử dụng khi bay.",
        "Tuân thủ các quy định về giấy tờ tùy thân, visa (nếu cần) và các quy định an ninh hàng không.",
        "Có mặt tại sân bay đúng thời gian quy định: trước 90 phút đối với chuyến bay nội địa, 120 phút đối với chuyến bay quốc tế.",
        "Tuân thủ các quy định về hành lý của từng hãng hàng không.",
        "Không sử dụng dịch vụ cho các mục đích bất hợp pháp hoặc gây tổn hại đến hệ thống."
      ]
    },
    {
      title: "5. Trách nhiệm của chúng tôi",
      icon: "🏢",
      content: [
        "Chúng tôi cam kết cung cấp thông tin chuyến bay chính xác và cập nhật nhất có thể.",
        "Hỗ trợ khách hàng trong suốt quá trình đặt vé và giải quyết các vấn đề phát sinh.",
        "Bảo mật thông tin cá nhân của khách hàng theo quy định pháp luật.",
        "Thông báo kịp thời về các thay đổi lịch bay, hủy chuyến từ phía hãng hàng không.",
        "Tuy nhiên, chúng tôi không chịu trách nhiệm về các delay, hủy chuyến hoặc thay đổi do hãng hàng không quyết định.",
        "Không chịu trách nhiệm về thiệt hại gián tiếp như chi phí khách sạn, phương tiện di chuyển do delay/hủy chuyến."
      ]
    },
    {
      title: "6. Bảo mật thông tin",
      icon: "🔒",
      content: [
        "Thông tin cá nhân của khách hàng được bảo vệ theo tiêu chuẩn bảo mật quốc tế.",
        "Chúng tôi sử dụng công nghệ mã hóa SSL 256-bit để bảo vệ các giao dịch thanh toán.",
        "Thông tin chỉ được chia sẻ với các đối tác cần thiết để hoàn thành dịch vụ (hãng hàng không, nhà cung cấp thanh toán).",
        "Khách hàng có quyền yêu cầu xem, sửa đổi hoặc xóa thông tin cá nhân của mình.",
        "Chúng tôi không bán hoặc cho thuê thông tin cá nhân của khách hàng cho bên thứ ba."
      ]
    },
    {
      title: "7. Giới hạn trách nhiệm",
      icon: "⚠️",
      content: [
        "Chúng tôi chỉ đóng vai trò là đại lý bán vé, không phải là hãng hàng không vận chuyển.",
        "Mọi vấn đề liên quan đến dịch vụ bay (delay, hủy chuyến, mất hành lý, etc.) thuộc trách nhiệm của hãng hàng không.",
        "Tổng trách nhiệm bồi thường của chúng tôi không vượt quá giá trị vé máy bay đã thanh toán.",
        "Không chịu trách nhiệm về thiệt hại do sự cố kỹ thuật, thiên tai, chiến tranh, dịch bệnh.",
        "Khách hàng nên mua bảo hiểm du lịch để được bảo vệ tốt hơn."
      ]
    },
    {
      title: "8. Quyền sở hữu trí tuệ",
      icon: "©️",
      content: [
        "Toàn bộ nội dung website bao gồm văn bản, hình ảnh, logo, thiết kế thuộc quyền sở hữu của chúng tôi.",
        "Khách hàng không được sao chép, sử dụng lại nội dung cho mục đích thương mại mà không có sự đồng ý.",
        "Việc sử dụng website chỉ nhằm mục đích cá nhân để đặt vé máy bay.",
        "Nghiêm cấm việc sử dụng robot, crawler hoặc công cụ tự động để thu thập dữ liệu."
      ]
    },
    {
      title: "9. Luật áp dụng và giải quyết tranh chấp",
      icon: "⚖️",
      content: [
        "Các điều khoản này được điều chỉnh bởi pháp luật Việt Nam.",
        "Mọi tranh chấp phát sinh sẽ được ưu tiên giải quyết thông qua thương lượng.",
        "Trường hợp không thể thương lượng, tranh chấp sẽ được giải quyết tại Tòa án có thẩm quyền tại Việt Nam.",
        "Khách hàng có thể liên hệ hotline hoặc email để được hỗ trợ giải quyết vấn đề."
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block p-4 bg-gradient-to-r from-slate-600 to-blue-600 rounded-full text-white text-4xl mb-6 shadow-lg">
              📜
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Điều khoản sử dụng
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Điều khoản và điều kiện sử dụng dịch vụ đặt vé máy bay. Vui lòng đọc kỹ trước khi sử dụng dịch vụ.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
              <span>📅</span>
              Cập nhật lần cuối: 15/06/2025
            </div>
          </div>

          {/* Table of Contents */}
          <Card className="mb-8 shadow-lg border-0">
            <Card.Header className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <span className="text-2xl">📑</span>
                Mục lục
              </h2>
            </Card.Header>
            <Card.Body>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sections.map((section, index) => (
                  <a
                    key={index}
                    href={`#section-${index}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
                  >
                    <span className="text-xl">{section.icon}</span>
                    <span className="text-gray-700 group-hover:text-blue-600 transition-colors duration-200">
                      {section.title}
                    </span>
                  </a>
                ))}
              </div>
            </Card.Body>
          </Card>

          {/* Terms Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <Card key={index} id={`section-${index}`} className="shadow-lg border-0 overflow-hidden">
                <Card.Header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <h2 className="text-xl font-bold flex items-center gap-3">
                    <span className="text-2xl">{section.icon}</span>
                    {section.title}
                  </h2>
                </Card.Header>
                <Card.Body className="prose max-w-none">
                  <div className="space-y-4">
                    {section.content.map((paragraph, pIndex) => (
                      <div key={pIndex} className="flex gap-4">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mt-1">
                          {pIndex + 1}
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          {paragraph}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>

          {/* Footer Section */}
          <div className="mt-16">
            <Card className="shadow-xl border-0 overflow-hidden">
              <Card.Body className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center p-8">
                <div className="text-4xl mb-4">✅</div>
                <h2 className="text-2xl font-bold mb-4">
                  Đồng ý với điều khoản
                </h2>
                <p className="text-blue-100 mb-6 text-lg max-w-2xl mx-auto">
                  Bằng việc sử dụng dịch vụ của chúng tôi, bạn xác nhận đã đọc, hiểu và đồng ý với toàn bộ các điều khoản trên.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a 
                    href="/"
                    className="bg-white text-blue-600 font-semibold py-3 px-8 rounded-xl hover:bg-blue-50 transition-colors duration-200 shadow-lg"
                  >
                    🏠 Về trang chủ
                  </a>
                  <a 
                    href="/faq"
                    className="bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl hover:bg-blue-800 transition-colors duration-200 shadow-lg border border-blue-500"
                  >
                    ❓ Xem FAQ
                  </a>
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Terms 