# AI-Powered Discord Bot with n8n

โปรเจกต์นี้คือ Discord Bot ที่ใช้ **n8n** เป็นตัวจัดการ Workflow โดยมีความสามารถในการรับข้อความผ่าน Webhook, ประมวลผลด้วย AI (LLM), และส่งคำตอบกลับไปยัง Discord โดยตรง

## รายละเอียด Workflow
Workflow ของคุณทำงานตามลำดับดังนี้:
1.  **Webhook (POST):** รอรับ Data จาก Discord เมื่อมีการเรียกใช้งาน
2.  **Message a model:** ส่งข้อความที่ได้รับไปประมวลผลผ่าน AI Model (เช่น Gemini, OpenAI)
3.  **Edit Fields:** ปรับแต่งค่าข้อมูล (Formatting) เพื่อเตรียมส่งออก
4.  **Send a message (Discord):** ส่งข้อความที่ประมวลผลเสร็จแล้วกลับไปยัง Discord Channel

---

## วิธีการติดตั้ง

เลือกวิธีที่สะดวกที่สุดสำหรับคุณ:

### วิธีที่ 1: ติดตั้งผ่าน Docker (แนะนำ)
ใช้ไฟล์ `docker-compose.yml` และ `.env` ที่ให้มาใน Repository นี้

1.  สร้างไฟล์ `.env` และกรอกข้อมูลของคุณ (ดูตัวอย่างที่หัวข้อ [.env Configuration](#-env-configuration))
2.  รันคำสั่ง:
    ```bash
    docker-compose up -d
    ```
3.  เข้าใช้งานผ่าน: `http://localhost:5678`

### วิธีที่ 2: ติดตั้งแบบ Local (Node.js)
เหมาะสำหรับการทดสอบด่วนบนเครื่องคอมพิวเตอร์
1.  ติดตั้ง n8n ทั่วโลก:
    ```bash
    npm install n8n -g
    ```
2.  รัน n8n:
    ```bash
    n8n start
    ```

---

## การตั้งค่า ngrok (External Access)
เพื่อให้ Discord สามารถส่งข้อมูลหา n8n ที่อยู่ในเครื่องเราได้ ต้องทำ Tunneling ดังนี้:

1.  เปิด Terminal ใหม่และรัน ngrok:
    ```bash
    ngrok http 5678
    ```
2.  Copy **Forwarding URL** ที่ได้ (เช่น `https://xyz.ngrok-free.app`)
3.  **สำคัญมาก:** นำ URL จาก ngrok ไปอัปเดตในไฟล์ `.env` ที่หัวข้อ `WEBHOOK_URL`
    * เช่น `WEBHOOK_URL=https://xyz.ngrok-free.app/`
    * แล้วรัน `docker-compose up -d` อีกครั้งเพื่อโหลดค่าใหม่

---

## การตั้งค่าใน n8n Workflow

### Import Workflow เข้า n8n

1. ไปที่หน้า **n8n Dashboard**
2. กดปุ่ม **Import**
3. เลือกไฟล์ `Discord-bot.json`
4. กด **Import** เพื่อเพิ่ม Workflow เข้าสู่ระบบ

---

### เปิดใช้งาน Workflow

1. เปิด Workflow ที่ import เข้ามา
2. ตรวจสอบ Node ต่าง ๆ ให้เรียบร้อย
3. กดปุ่ม **Activate** เพื่อเริ่มใช้งาน

---

### หมายเหตุ

- หากใช้ n8n แบบ Local:
  - ต้อง expose Webhook ด้วยเครื่องมือ เช่น `ngrok` หรือ `Cloudflare Tunnel`
- ตรวจสอบว่าใช้ **Production Webhook URL** ก่อนนำไปใช้งานจริง

## .env Configuration
สร้างไฟล์ชื่อ `.env` ไว้ที่ Root ของโปรเจกต์ และใส่ข้อมูลดังนี้:

```env
# --- PostgreSQL Database Configuration ---
POSTGRES_USER=n8n_user
POSTGRES_PASSWORD=n8n_password_123
POSTGRES_DB=n8n_db

# --- n8n Service Configuration ---
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=postgres
DB_POSTGRESDB_DATABASE=n8n_db
DB_POSTGRESDB_USER=n8n_user
DB_POSTGRESDB_PASSWORD=n8n_password_123

# การตั้งค่า Timezone
GENERIC_TIMEZONE=Asia/Bangkok
TZ=Asia/Bangkok

# การตั้งค่า URL (เปลี่ยนเป็น URL จาก ngrok เมื่อใช้งานจริง)
N8N_HOST=localhost
N8N_EDITOR_BASE_URL=http://localhost:5678/
WEBHOOK_URL=http://localhost:5678/

# อื่นๆ
N8N_RUNNERS_ENABLED=true

# Discord Credentials
DISCORD_TOKEN=your_bot_token_here
APPLICATION_ID=your_app_id_here
N8N_WEBHOOK=your_full_webhook_url
