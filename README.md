# 🧠 Mentor AI – Backend

## 🚀 Backend Setup Instructions

Follow these steps to set up and run the backend server locally:

---

### 📁 1. Clone the Repository

```bash
git clone git@github.com:rapuruprudhvi/Mentor-ai-api.git
cd Mentor-ai-api
npm install

### 📁 **2. Database Setup**

- **Create a `.env` file** in the root of the project directory.
- **Add the following environment variables** to the `.env` file:

DB_HOST=localhost
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
DB_DATABASE=Mentor_AI_db
JWT_SECRET=your_jwt_secret_key

**Note:**
Create the **Mentor_AI_db** database in your local MySQL instance
To generate the JWT secret, run the following command in your terminal:

```bash
openssl rand -hex 32


### 📁 3. **Migrations**
Run the following commands to set up your database schema:

```bash

# Generate migrations (Note: Frontend team should avoid this command)
npm run migration:generate

# Run migrations
npm run migration:run

# Revert migrations (Note: Frontend team should avoid this command)
npm run migration:revert

### 📁 4. **server start**

```bash
npm run dev
