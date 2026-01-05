// CẤU HÌNH FIREBASE CỦA BẠN TẠI ĐÂY
// 1. App ID mà bạn dùng trong code JS (nếu bạn không đổi gì thì mặc định là 'default-app-id-uniquekey')
const APP_ID = "default-app-id-uniquekey";

// 2. URL Database của bạn (Lấy trong Firebase Console > Realtime Database)
// Lưu ý: Phải đúng định dạng https://...firebaseio.com (không có dấu / ở cuối)
const DB_URL = "https://uniquekey-a0912-default-rtdb.firebaseio.com";

// 3. Link trang web GitHub Pages của bạn (để chuyển hướng người dùng về)
const GITHUB_PAGE_URL = "https://gzegm.github.io/UniqueKey/";
// Thay https://gzegm.github.io/UniqueKey/ bằng link thật của bạn nếu khác.

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const key = url.searchParams.get("key");

    // Nếu không có key, chuyển về trang chủ GitHub
    if (!key) {
      return Response.redirect(GITHUB_PAGE_URL, 302);
    }

    // Đường dẫn đến node chứa thông tin Key trong Firebase
    // Cấu trúc dựa trên code index.html của bạn: artifacts/{appId}/public/data/keys/{key}
    const firebaseUrl = `${DB_URL}/artifacts/${APP_ID}/public/data/keys/${key}.json`;

    try {
      // Worker gọi lên Firebase lấy dữ liệu (Zalo không làm được, nhưng Worker làm được)
      const fbResponse = await fetch(firebaseUrl);
      const data = await fbResponse.json();

      let title = "Tài liệu bảo mật";
      let description = "Nhấn vào để truy cập nội dung.";

      // Nếu tìm thấy dữ liệu trong Firebase
      if (data) {
        // data.linkName là tên bạn đặt lúc tạo link (VD: Sử 11 CK1)
        if (data.linkName) title = data.linkName;

        // Custom mô tả một chút cho uy tín
        if (data.mode === "single_use") description = "Link chỉ dùng 1 lần.";
        else if (data.mode === "limited_users")
          description = "Link giới hạn số người xem.";
      }

      // Tạo nội dung HTML tĩnh trả về cho Zalo/Facebook đọc
      // Meta tags quan trọng: og:title, og:description
      // Script quan trọng: window.location.href để chuyển người dùng thật về Web App
      const html = `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
          <meta charset="UTF-8">
          <title>${title}</title>
          <meta property="og:title" content="${title}" />
          <meta property="og:description" content="${description}" />
          <meta property="og:image" content="https://cdn-icons-png.flaticon.com/512/281/281760.png" />
          <meta property="og:type" content="website" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          
          <!-- Chuyển hướng ngay lập tức về trang xử lý Key -->
          <script>
              window.location.href = "${GITHUB_PAGE_URL}#redeem?key=${key}";
          </script>
      </head>
      <body>
          <div style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;flex-direction:column;">
              <div style="width:40px;height:40px;border:4px solid #f3f3f3;border-top:4px solid #3498db;border-radius:50%;animation:spin 1s linear infinite;"></div>
              <p style="margin-top:20px;color:#555;">Đang chuyển hướng đến tài liệu...</p>
              <p style="font-weight:bold;font-size:1.2em;">${title}</p>
          </div>
          <style>@keyframes spin {0% {transform: rotate(0deg);} 100% {transform: rotate(360deg);}}</style>
      </body>
      </html>
      `;

      return new Response(html, {
        headers: {
          "content-type": "text/html;charset=UTF-8",
          "cache-control": "no-cache", // Không lưu cache để update trạng thái nhanh
        },
      });
    } catch (err) {
      // Nếu lỗi, cứ chuyển về trang gốc cho chắc
      return Response.redirect(`${GITHUB_PAGE_URL}#redeem?key=${key}`, 302);
    }
  },
};
