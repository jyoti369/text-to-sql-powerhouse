# Text-to-SQL Powerhouse 🚀

A powerful text-to-SQL conversion system that translates natural language questions into SQL queries
using Google Gemini AI.

## ✨ Features

- 🤖 **AI-Powered** - Google Gemini 2.5 Flash for intelligent SQL generation
- 🗄️ **PostgreSQL Integration** - Direct database connectivity and validation
- 🧠 **Smart Understanding** - Handles complex natural language questions with JOINs and
  aggregations
- ✅ **SQL Validation** - Automatic syntax validation before execution
- 🔒 **Security** - Built-in protection against write operations (INSERT, UPDATE, DELETE)
- 📝 **Comprehensive Logging** - Winston-based logging with daily rotation

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **AI**: Google Gemini AI (gemini-2.5-flash)
- **Database**: PostgreSQL
- **Logging**: Winston

## 🚀 Quick Start

### Prerequisites

- Node.js (v18+)
- PostgreSQL
- pnpm
- Google Gemini API Key ([Get one here](https://aistudio.google.com/apikey))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/jyoti369/text-to-sql-powerhouse.git
cd text-to-sql-powerhouse

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# 4. Create and populate database
createdb text_to_sql_db
psql -d text_to_sql_db -f setup-demo-db.sql

# 5. Start development server
pnpm run dev
```

Server will start at `http://localhost:3001`

### Environment Configuration

Edit `.env` file:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=text_to_sql_db
DB_USER=postgres
DB_PASSWORD=

# Google Gemini AI (REQUIRED)
GEMINI_API_KEY=your_gemini_api_key_here

# Server
PORT=3001
NODE_ENV=development
LOG_LEVEL=info
```

## 📖 API Usage

### Endpoint

**POST** `/api/generate-sql`

### Request

```json
{
  "question": "Show me users who ordered electronics"
}
```

### Response

```json
{
  "sql": "SELECT DISTINCT u.id, u.name, u.email FROM users AS u JOIN orders AS o ON u.id = o.user_id JOIN order_items AS oi ON o.id = oi.order_id JOIN products AS p ON oi.product_id = p.id WHERE p.category = 'electronics' LIMIT 100"
}
```

### Example Queries

```bash
# Simple query
curl -X POST http://localhost:3001/api/generate-sql \
  -H "Content-Type: application/json" \
  -d '{"question":"Show all active users"}'

# Complex query with JOIN
curl -X POST http://localhost:3001/api/generate-sql \
  -H "Content-Type: application/json" \
  -d '{"question":"Find users who spent more than $500"}'

# Aggregation
curl -X POST http://localhost:3001/api/generate-sql \
  -H "Content-Type: application/json" \
  -d '{"question":"Total revenue from completed orders"}'
```

## 📊 Database Schema

The demo database includes:

**Tables**:

- `users` - User accounts (id, name, email, status, created_at)
- `products` - Product catalog (id, name, price, category, stock_quantity)
- `orders` - Order records (id, user_id, total_amount, status, created_at)
- `order_items` - Order line items (id, order_id, product_id, quantity, price)

**Sample Data**:

- 5 users
- 8 products (Electronics, Furniture, Stationery)
- 5 orders with items

## 🎯 Supported Query Types

The AI can handle:

- **Simple SELECT**: "Show all users", "List products"
- **Filtering**: "Show active users", "Products under $100"
- **Aggregations**: "Total revenue", "Count of orders"
- **JOINs**: "Users who ordered electronics", "Products never ordered"
- **Grouping**: "Orders by user", "Top selling products"
- **Date Ranges**: "Orders in last 30 days"

## 🔒 Security Features

- Automatically blocks write operations (INSERT, UPDATE, DELETE, DROP)
- SQL syntax validation using PostgreSQL EXPLAIN
- Query sanitization and validation
- Read-only database access

## 🧪 Testing

```bash
# Run test script with multiple queries
./test-queries.sh

# Or test manually
curl -X POST http://localhost:3001/api/generate-sql \
  -H "Content-Type: application/json" \
  -d '{"question":"Your question here"}'
```

## 📁 Project Structure

```
text-to-sql-powerhouse/
├── src/
│   ├── config/
│   │   ├── db.js              # PostgreSQL connection
│   │   └── logger.js          # Winston logging
│   ├── routes/
│   │   └── api.js             # API endpoints
│   ├── services/
│   │   ├── sqlGeneratorAI.js  # Gemini AI integration
│   │   └── sqlGeneratorSimple.js  # Pattern-based fallback
│   └── scheduler/             # Background jobs
├── logs/                      # Application logs
├── setup-demo-db.sql          # Database schema & sample data
├── test-queries.sh            # Test script
├── .env.example               # Environment template
└── index.js                   # Application entry point
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

ISC

## 👤 Author

**Debojyoti Mandal** - [jyoti369](https://github.com/jyoti369)

---

### 🔑 Getting Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key and add it to your `.env` file

### ⚠️ Important Notes

- The Gemini API has free tier rate limits
- Keep your API key secure and never commit it to version control
- The demo database is for testing - use your own schema for production
