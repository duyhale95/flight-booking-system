import { useState } from 'react'
import Card from '../components/ui/Card'

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null)

  const faqData = [
    {
      category: "Đặt vé & Thanh toán",
      icon: "💳",
      questions: [
        {
          question: "Làm thế nào để đặt vé máy bay trên website?",
          answer: "Bạn có thể đặt vé bằng cách: 1) Chọn điểm khởi hành và điểm đến, 2) Chọn ngày bay và số hành khách, 3) Tìm kiếm chuyến bay phù hợp, 4) Chọn ghế và điền thông tin hành khách, 5) Thanh toán và nhận vé điện tử."
        },
        {
          question: "Website hỗ trợ những phương thức thanh toán nào?",
          answer: "Chúng tôi hỗ trợ thanh toán qua: Thẻ tín dụng/ghi nợ (Visa, MasterCard, JCB), VNPay, MoMo, ZaloPay, và chuyển khoản ngân hàng. Tất cả giao dịch đều được bảo mật SSL 256-bit."
        },
        {
          question: "Tôi có thể hủy hoặc đổi vé sau khi đã đặt không?",
          answer: "Có, bạn có thể hủy hoặc đổi vé tùy theo điều kiện của hãng hàng không và loại vé đã mua. Phí hủy/đổi sẽ được áp dụng theo quy định. Vui lòng kiểm tra email xác nhận hoặc liên hệ hotline để biết chi tiết."
        },
        {
          question: "Thời gian thanh toán có bị giới hạn không?",
          answer: "Có, bạn có 40 phút để hoàn tất thanh toán sau khi chọn vé. Nếu quá thời gian này, vé sẽ tự động bị hủy và ghế sẽ được giải phóng cho khách hàng khác."
        }
      ]
    },
    {
      category: "Thông tin chuyến bay",
      icon: "✈️",
      questions: [
        {
          question: "Tôi có thể chọn ghế ngồi không?",
          answer: "Có, bạn có thể chọn ghế ngồi yêu thích trong quá trình đặt vé. Ghế hạng phổ thông thường miễn phí, ghế hạng thương gia có thể có phí bổ sung. Một số ghế đặc biệt (cửa thoát hiểm, hàng đầu) có thể có phí riêng."
        },
        {
          question: "Hành lý xách tay và ký gửi được tính như thế nào?",
          answer: "Hành lý xách tay thường được bao gồm trong giá vé (7-10kg tùy hãng). Hành lý ký gửi có thể có phí bổ sung tùy theo trọng lượng và hãng hàng không. Vui lòng kiểm tra chính sách hành lý của từng hãng."
        },
        {
          question: "Chuyến bay có thể bị delay hoặc hủy không?",
          answer: "Có thể xảy ra delay hoặc hủy chuyến do thời tiết, kỹ thuật hoặc lý do bất khả kháng. Chúng tôi sẽ thông báo ngay lập tức qua email/SMS. Hãng hàng không sẽ bố trí chuyến bay thay thế hoặc hoàn tiền theo quy định."
        },
        {
          question: "Tôi cần check-in online hay có thể check-in tại sân bay?",
          answer: "Bạn có thể check-in online từ 24h trước giờ bay hoặc check-in tại sân bay. Check-in online giúp tiết kiệm thời gian và có thể chọn ghế ngồi tốt hơn."
        }
      ]
    },
    {
      category: "Hành khách & Giấy tờ",
      icon: "👤",
      questions: [
        {
          question: "Cần những giấy tờ gì để đi máy bay nội địa?",
          answer: "Đối với chuyến bay nội địa, bạn cần: CMND/CCCD còn hạn, hoặc Hộ chiếu, hoặc Bằng lái xe (đối với người trên 14 tuổi). Trẻ em dưới 14 tuổi cần giấy khai sinh hoặc CMND/CCCD nếu có."
        },
        {
          question: "Trẻ em đi một mình có được không?",
          answer: "Trẻ em từ 12-18 tuổi có thể đi một mình với dịch vụ hỗ trợ trẻ em (UM - Unaccompanied Minor). Trẻ dưới 12 tuổi bắt buộc phải có người lớn đi cùng. Cần đăng ký dịch vụ này trước khi bay."
        },
        {
          question: "Phụ nữ có thai có được đi máy bay không?",
          answer: "Phụ nữ có thai dưới 32 tuần có thể đi máy bay bình thường. Từ 32-36 tuần cần giấy chứng nhận từ bác sĩ. Sau 36 tuần thường không được phép bay vì lý do an toàn."
        },
        {
          question: "Hành khách khuyết tật cần hỗ trợ gì?",
          answer: "Chúng tôi hỗ trợ hành khách khuyết tật với xe lăn, hỗ trợ lên xuống máy bay, chỗ ngồi ưu tiên. Vui lòng thông báo trước khi đặt vé để chúng tôi chuẩn bị dịch vụ hỗ trợ phù hợp."
        }
      ]
    },
    {
      category: "Hỗ trợ khách hàng",
      icon: "🎧",
      questions: [
        {
          question: "Làm sao để liên hệ với bộ phận hỗ trợ?",
          answer: "Bạn có thể liên hệ qua: Hotline 24/7: 1900-1234, Email: support@flightbooking.vn, Live Chat trên website, hoặc đến trực tiếp văn phòng của chúng tôi tại các thành phố lớn."
        },
        {
          question: "Tôi quên mã đặt chỗ, làm sao để tìm lại?",
          answer: "Bạn có thể tìm lại mã đặt chỗ bằng cách: 1) Kiểm tra email xác nhận đặt vé, 2) Đăng nhập vào tài khoản và xem lịch sử đặt vé, 3) Liên hệ hotline với thông tin cá nhân để được hỗ trợ."
        },
        {
          question: "Website có ứng dụng mobile không?",
          answer: "Hiện tại chúng tôi chưa có ứng dụng mobile riêng, nhưng website được tối ưu hoàn toàn cho mobile. Bạn có thể truy cập dễ dàng qua trình duyệt trên điện thoại với trải nghiệm tương tự như ứng dụng."
        },
        {
          question: "Thông tin cá nhân của tôi có được bảo mật không?",
          answer: "Thông tin của bạn được bảo mật tuyệt đối theo tiêu chuẩn quốc tế. Chúng tôi sử dụng mã hóa SSL, không chia sẻ thông tin với bên thứ ba trái phép, và tuân thủ nghiêm ngặt luật bảo vệ dữ liệu cá nhân."
        }
      ]
    }
  ]

  const toggleAccordion = (categoryIndex, questionIndex) => {
    const index = `${categoryIndex}-${questionIndex}`
    setActiveIndex(activeIndex === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* FAQ Categories */}
          <div className="space-y-8">
            {faqData.map((category, categoryIndex) => (
              <Card key={categoryIndex} className="bg-white shadow-xl border-0 overflow-hidden">
                <Card.Header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <h2 className="text-xl font-bold flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    {category.category}
                  </h2>
                </Card.Header>
                <Card.Body className="p-0">
                  <div className="divide-y divide-gray-200">
                    {category.questions.map((faq, questionIndex) => {
                      const isActive = activeIndex === `${categoryIndex}-${questionIndex}`
                      return (
                        <div key={questionIndex} className="transition-all duration-200">
                          <button
                            onClick={() => toggleAccordion(categoryIndex, questionIndex)}
                            className="w-full bg-white text-left p-6 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors duration-200"
                          >
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-semibold text-gray-900 pr-8">
                                {faq.question}
                              </h3>
                              <div className={`text-blue-600 text-xl transform transition-transform duration-200 ${
                                isActive ? 'rotate-180' : ''
                              }`}>
                                ⌄
                              </div>
                            </div>
                          </button>
                          
                          <div className={`overflow-hidden transition-all duration-300 ${
                            isActive ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                          }`}>
                            <div className="px-6 pb-6">
                              <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                                <p className="text-gray-700 leading-relaxed">
                                  {faq.answer}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FAQ 