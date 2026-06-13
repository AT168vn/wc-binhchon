const { spawn, exec } = require('child_process');
const path = require('path');
const net = require('net');
const os = require('os');

/** Đường dẫn CLI Next.js — spawn với process.execPath, không dùng shell: true (tránh DEP0190). */
function resolveNextCli() {
  return require.resolve('next/dist/bin/next', { paths: [__dirname] });
}

// Hàm mở trình duyệt theo hệ điều hành
function openBrowser(url) {
  const platform = os.platform();
  const cmd = platform === 'win32' ? 'start' :
              platform === 'darwin' ? 'open' :
              'xdg-open';
  
  return new Promise((resolve, reject) => {
    exec(`${cmd} ${url}`, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

// Hàm kiểm tra port có đang được sử dụng không
const isPortInUse = async (port) => {
  return new Promise((resolve) => {
    const server = net.createServer()
      .once('error', () => resolve(true))
      .once('listening', () => {
        server.close();
        resolve(false);
      })
      .listen(port);
  });
};

// Hàm tìm port trống
const findAvailablePort = async (startPort) => {
  let port = startPort;
  while (await isPortInUse(port)) {
    port++;
  }
  return port;
};

// Hàm chính để khởi động dev server
async function startDevServer() {
  try {
    // Tìm port trống bắt đầu từ 3000
    const port = await findAvailablePort(3000);
    
    // Khởi động Next.js dev server (không shell: true + args — Node cảnh báo DEP0190)
    const nextDev = spawn(process.execPath, [resolveNextCli(), 'dev', '-p', String(port)], {
      stdio: 'inherit',
      cwd: path.resolve(__dirname),
      env: process.env,
    });

    // Đợi 3 giây để server khởi động
    setTimeout(async () => {
      try {
        // Mở trình duyệt mặc định với đường dẫn chính xác
        const url = `http://localhost:${port}/login`;
        await openBrowser(url);
        console.log(`\n🚀 Đã mở trình duyệt tại ${url}\n`);
      } catch (error) {
        console.error('Không thể mở trình duyệt:', error.message);
      }
    }, 3000);

    // Xử lý khi process kết thúc
    nextDev.on('close', (code) => {
      if (code !== 0) {
        console.error(`Next.js dev server đã dừng với mã lỗi ${code}`);
      }
      process.exit(code);
    });

    // Xử lý SIGINT (Ctrl+C)
    process.on('SIGINT', () => {
      nextDev.kill('SIGINT');
      process.exit(0);
    });

  } catch (error) {
    process.exit(1);
  }
}

// Khởi chạy server
startDevServer(); 