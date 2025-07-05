<!-- Banner -->
<p align="center">
  <a href="https://www.uit.edu.vn/" title="University of Information Technology" style="border: none;">
    <img src="https://i.imgur.com/WmMnSRt.png" alt="University of Information Technology">
  </a>
</p>

<h1 align="center"><b>SOFTWARE ENGINEERING INTRODUCTION</b></h1>

# Team Members
| No.    | Student ID    | Full Name              | 
| ------ |:-------------:| ----------------------:|
| 1      | 22520197      | Võ Nguyên Đăng         | 
| 2      | 23520363      | Hà Lê Duy              |    
| 3      | 23521013      | Nguyễn Trần Nghĩa      |                                                          

# COURSE INFORMATION
* **Course Name:** Software Engineering Introduction
* **Course Code:** SE104
* **Class Code:** SE104.P29
* **Academic Year:** 2024-2025
* **Instructor:** Đỗ Văn Tiến

# FINAL PROJECT
* **Project Title:** Flight Booking Management System

## 📋 Project Overview
The Flight Booking Management System is a comprehensive web application designed to facilitate flight reservations and management. Built with modern technologies, this system provides a seamless experience for both customers and administrators.

## 🏗️ System Architecture
- **Frontend:** React.js with Vite, TailwindCSS
- **Backend:** FastAPI (Python)
- **Database:** PostgreSQL
- **Authentication:** JWT-based authentication
- **Deployment:** Docker & Docker Compose

## ✨ Key Features

### 🔐 Authentication & Authorization
- User registration and login
- JWT-based secure authentication
- Role-based access control (User/Admin)
- Protected routes and API endpoints

### 🔍 Flight Search & Booking
- Advanced flight search with filters
- Real-time flight availability
- Multi-city and round-trip booking options
- Seat selection and preferences
- Passenger information management

### 💳 Payment Processing
- Secure payment integration
- Multiple payment methods support
- Booking confirmation and receipts
- Payment history tracking

### 📊 Booking Management
- View booking history
- Booking modifications and cancellations
- Ticket generation and printing
- Booking lookup by reference number

### 👤 User Profile
- Personal information management
- Booking history and preferences
- Profile settings and updates

### 🛠️ Admin Dashboard
- Flight management (CRUD operations)
- User management
- Booking oversight
- System analytics and reporting

### 📱 Additional Features
- Responsive design for all devices
- Popular destinations showcase
- FAQ and support pages
- Contact and about pages
- Privacy policy and terms of service

## 🚀 Getting Started with Docker

### Prerequisites
- Docker and Docker Compose installed
- Git for cloning the repository

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd flight-booking
   ```

2. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Database Configuration
   POSTGRES_SERVER=localhost
   POSTGRES_PORT=5432
   POSTGRES_DB=flight_booking
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=your_password_here
   
   # Docker Images
   DOCKER_IMAGE_BACKEND=flight-booking-backend
   DOCKER_IMAGE_FRONTEND=flight-booking-frontend
   TAG=latest
   
   # Backend Configuration
   SECRET_KEY=your_secret_key_here
   BACKEND_CORS_ORIGINS=http://localhost:5173

   ```

3. **Build and run the application**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### 🔧 Development Setup

For development without Docker:

1. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   alembic upgrade head
   uvicorn app.main:app --reload
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 📊 Tạo Dữ Liệu Test

Để tạo dữ liệu test cho hệ thống, bạn cần thực hiện các bước sau:

### 1. Chỉnh Sửa Ngày Test

Trước khi tạo dữ liệu, bạn cần chỉnh sửa ngày muốn test trong file `backend/gendata.py`:

```python
# Tìm dòng này và thay đổi ngày phù hợp
start_date = datetime(2025, 7, 5)  # Thay đổi ngày ở đây
num_days = 1  # Số ngày muốn tạo dữ liệu
```

### 2. Chạy File Tạo Dữ Liệu

Chạy script để tạo dữ liệu chuyến bay:

```bash
cd backend
python gendata.py
```

Lệnh này sẽ tạo ra file `vietnam_flights_2025.json` chứa dữ liệu các chuyến bay cho ngày bạn đã chỉ định.

### 3. Import Dữ Liệu Vào Database

Chạy script để import dữ liệu vào database:

```bash
python import_flights.py
```

**Lưu ý:** Đảm bảo rằng:
- Backend API đang chạy tại `http://localhost:8000`
- Database đã được khởi tạo và migration đã được chạy
- Có tài khoản admin với thông tin:
  - Username: `admin@example.com`
  - Password: `changethis`

### 4. Kiểm Tra Dữ Liệu

Sau khi import thành công, bạn có thể:
- Truy cập API docs tại `http://localhost:8000/docs` để kiểm tra dữ liệu
- Sử dụng frontend để tìm kiếm các chuyến bay vừa tạo

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

---

<!-- Footer -->
<p align='center'>Copyright © 2025 - HÀ LÊ DUY</p>
