# 🛒 HƯỚNG DẪN CÀI ĐẶT VÀ VẬN HÀNH PHẦN MỀM QUẢN LÝ BÁN HÀNG TẠP HÓA

> **Hệ thống Quản lý Bán hàng Tạp hóa Quy mô vừa** (Node.js + Express.js + MySQL 8.x + React.js + Tailwind CSS).
> Tài liệu này hướng dẫn chi tiết từ A-Z giúp bất kỳ ai (kể cả người mới bắt đầu) cũng có thể cài đặt, chạy thử và đẩy mã nguồn lên GitHub.

---

## 📑 MỤC LỤC
1. [Yêu Cầu Phần Mềm Cần Chuẩn Bị](#1-yêu-cầu-phần-mềm-cần-chuẩn-bị)
2. [Bước 1: Cài Đặt CSDL MySQL Trên XAMPP](#bước-1-cài-đặt-csdl-mysql-trên-xampp)
3. [Bước 2: Cấu Hình & Khởi Chạy Backend (Node.js)](#bước-2-cấu-hình--khởi-chạy-backend-nodejs)
4. [Bước 3: Khởi Chạy Giao Diện Frontend (React.js)](#bước-3-khởi-chạy-giao-diện-frontend-reactjs)
5. [Bước 4: Kết Nối Dự Án Với Kho Chứa GitHub](#bước-4-kết-nối-dự-án-với-kho-chứa-github)
6. [Tài Khoản Dùng Thử & Dữ Liệu Mẫu](#tài-khoản-dùng-thử--dữ-liệu-mẫu)
7. [Xử Lý Lỗi Thường Gặp (Troubleshooting)](#xử-lý-lỗi-thường-gặp-troubleshooting)

---

## 1. YÊU CẦU PHẦN MỀM CẦN CHUẨN BỊ

Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt 4 phần mềm sau:

| Phần mềm | Mục đích sử dụng | Link tải chính thức |
| :--- | :--- | :--- |
| **Node.js (v18+)** | Môi trường chạy Backend & Frontend | [nodejs.org](https://nodejs.org/) |
| **XAMPP** | Quản lý CSDL MySQL & Apache | [apachefriends.org](https://www.apachefriends.org/) |
| **Git** | Quản lý phiên bản & đẩy code lên GitHub | [git-scm.com](https://git-scm.com/) |
| **VS Code** | Trình chỉnh sửa mã nguồn | [code.visualstudio.com](https://code.visualstudio.com/) |

---

## BƯỚC 1: CÀI ĐẶT CSDL MYSQL TRÊN XAMPP

### 1.1 Khởi động MySQL trong XAMPP
1. Mở ứng dụng **XAMPP Control Panel**.
2. Nhấn nút **Start** tại 2 dòng: **Apache** và **MySQL** (Đèn chuyển sang màu xanh lá là thành công).

### 1.2 Import CSDL và Dữ liệu mẫu
1. Mở trình duyệt web, truy cập đường dẫn: `http://localhost/phpmyadmin`
2. Nhấn vào thẻ **Import (Nhập)** ở thanh menu phía trên.
3. Nhấn **Choose File (Chọn tệp)** và chọn file **`schema.sql`** (Nằm tại thư mục gốc dự án `PhanMemQuanLyBanHang/schema.sql`).
4. Cuộn xuống cuối trang và nhấn nút **Import (Nhập)**. Hệ thống sẽ tự động tạo CSDL `grocery_store_db` và 25 bảng.
5. Lặp lại thao tác Import với file thứ 2: **`seed_data.sql`** để nạp dữ liệu mẫu (sản phẩm, tài khoản, mã vạch).

---

## BƯỚC 2: CẤU HÌNH & KHỞI CHẠY BACKEND (NODE.JS)

### 2.1 Mở Terminal và di chuyển vào thư mục Backend
Mở Terminal trong VS Code (hoặc PowerShell) và gõ:
```bash
cd backend
```

### 2.2 Cài đặt các thư viện phụ thuộc (Dependencies)
Gõ lệnh sau và nhấn Enter:
```bash
npm install
```

### 2.3 Kiểm tra cấu hình môi trường `.env`
Mở file `backend/.env` và đảm bảo thông tin kết nối XAMPP như sau:
```env
PORT=5000
NODE_ENV=development

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=grocery_store_db
```
*(Lưu ý: Mặc định XAMPP không có mật khẩu nên `DB_PASSWORD=` để rỗng).*

### 2.4 Chạy Backend Server
Gõ lệnh:
```bash
npm run dev
```

Màn hình hiển thị như sau là Backend đã hoạt động thành công:
```text
✅ Connected to MySQL Database successfully!
🚀 Grocery Store Backend API running on port 5000
🌐 Environment: development
🔗 Base API: http://localhost:5000/api/v1
```

> **Kiểm tra API Healthcheck**: Mở trình duyệt gõ `http://localhost:5000/api/v1/health` -> Nhận phản hồi `"success": true`.

---

## BƯỚC 3: KHỞI CHẠY GIAO DIỆN FRONTEND (REACT.JS)

### 3.1 Mở một cửa sổ Terminal mới và vào thư mục Frontend
```bash
cd frontend
```

### 3.2 Cài đặt thư viện Frontend
```bash
npm install
```

### 3.3 Chạy giao diện phát triển (Dev Server)
```bash
npm run dev
```

Trình duyệt sẽ tự động mở hoặc bạn có thể nhấp vào link hiển thị (thường là `http://localhost:5173` hoặc `http://localhost:3000`).

---

## BƯỚC 4: KẾT NỐI DỰ ÁN VỚI KHO CHỨA GITHUB

Dưới đây là từng câu lệnh chi tiết giúp bạn đẩy toàn bộ dự án dưới máy lên kho lưu trữ GitHub: `https://github.com/KyThuatTVU/PhanMem_Quanlybanhang.git`.

Mở Terminal tại thư mục gốc của dự án (`PhanMemQuanLyBanHang`) và gõ lần lượt 6 lệnh sau:

### Lệnh 1: Khởi tạo kho Git cục bộ
```bash
git init
```

### Lệnh 2: Thêm tất cả file vào danh sách chờ push
```bash
git add .
```

### Lệnh 3: Tạo bản đóng gói Commit
```bash
git commit -m "Initial commit: Completed Database design, Node.js Backend & React Frontend scaffolding"
```

### Lệnh 4: Đổi tên nhánh chính thành `main`
```bash
git branch -M main
```

### Lệnh 5: Kết nối máy cục bộ với kho GitHub
```bash
git remote add origin https://github.com/KyThuatTVU/PhanMem_Quanlybanhang.git
```

### Lệnh 6: Đẩy mã nguồn lên GitHub
```bash
git push -u origin main
```

---

## TÀI KHOẢN DÙNG THỬ & DỮ LIỆU MẪU

Dữ liệu mẫu đã chuẩn bị sẵn để bạn test hệ thống:

### 1. Tài khoản đăng nhập
* **Chủ quán (Admin Google Auth)**: Email `admin.ankhang@gmail.com`
* **Thu ngân quầy POS**: Tên đăng nhập `thungan01` | Mật khẩu: `123456`
* **Nhân viên kho**: Tên đăng nhập `kho01` | Mật khẩu: `123456`

### 2. Mã vạch quét thử nghiệm tại quầy POS
* Quét mã `8934560111118` $\rightarrow$ Tự động ra **1 Lon Coca-Cola 330ml** (Giá 11.000đ).
* Quét mã `8934560111132` $\rightarrow$ Tự động ra **1 Thùng Coca-Cola 24 lon** (Giá 250.000đ, tự trừ 24 lon kho).

---

## XỬ LÝ LỖI THƯỜNG GẶP (TROUBLESHOOTING)

### 🔴 Lỗi 1: `Access denied for user 'root'@'localhost'`
* **Nguyên nhân**: Mật khẩu MySQL trong file `backend/.env` chưa đúng.
* **Cách khắc phục**: Nếu dùng XAMPP, mở `backend/.env` và đặt `DB_PASSWORD=` (để rỗng).

### 🔴 Lỗi 2: `push rejected (fetch first)` khi đẩy Git
* **Nguyên nhân**: Kho trên GitHub đã có sẵn file `README.md` tạo từ trước.
* **Cách khắc phục**: Chạy lệnh đồng bộ rebase trước khi push:
  ```bash
  git pull origin main --rebase
  git push -u origin main
  ```

---
*Chúc bạn thực hiện thành công và làm chủ dự án Quản Lý Bán Hàng Tạp Hóa!*
