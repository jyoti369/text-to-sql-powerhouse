# Text-to-SQL Powerhouse 🚀

A powerful text-to-SQL conversion system that translates natural language questions into SQL
queries. Built with Node.js, Express, and PostgreSQL.

## Features

- 🤖 **AI-Powered** - Uses Google Gemini AI for intelligent SQL generation
- 🗄️ **PostgreSQL Integration** - Direct database connectivity and validation
- 📊 **Multiple Query Types** - Support for SELECT, COUNT, SUM, and JOIN operations
- 🧠 **Smart Understanding** - Handles complex natural language questions
- 📝 **Comprehensive Logging** - Winston-based logging with daily rotation
- ✅ **SQL Validation** - Automatic syntax validation before execution
- 🔒 **Security** - Built-in protection against write operations (INSERT, UPDATE, DELETE)
- 🎯 **RESTful API** - Clean and simple API design

## Tech Stack

- **Backend**: Node.js, Express.js
- **AI**: Google Gemini AI (gemini-2.0-flash-exp)
- **Database**: PostgreSQL
- **Logging**: Winston
- **Development**: ESLint, Prettier, Husky
- **Process Management**: Nodemon

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL
- pnpm

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env

# Create and populate database
createdb text_to_sql_db
psql -d text_to_sql_db -f setup-demo-db.sql

# Start development server
pnpm run dev
```

The server will start at `http://localhost:3001`

## API Usage

### Generate SQL Query

**Endpoint**: `POST /api/generate-sql`

**Request**:

```json
{
  "question": "Show me all active users"
}
```

**Response**:

```json
{
  "sql": "SELECT * FROM users WHERE status = 'active' LIMIT 100"
}
```

## Supported Query Patterns

### Count Queries

- "Count all users"
- "How many products"
- "Count completed orders"

### List Queries

- "Show all users"
- "Show active users"
- "Show electronics products"
- "Show completed orders"

### Aggregate Queries

- "Total revenue"
- "Top products"
- "Orders by user"
- "Recent orders in last 30 days"

## Database Schema

```sql
users
├── id
├── name
├── email
├── created_at
└── status

products
├── id
├── name
├── description
├── price
├── category
└── stock_quantity

orders
├── id
├── user_id
├── total_amount
├── status
└── created_at

order_items
├── id
├── order_id
├── product_id
├── quantity
└── price
```

## Project Structure

```
text-to-sql-powerhouse/
├── src/
│   ├── config/
│   │   ├── db.js              # Database configuration
│   │   └── logger.js          # Logging configuration
│   ├── routes/
│   │   └── api.js             # API routes
│   ├── services/
│   │   └── sqlGeneratorSimple.js  # SQL generation logic
│   └── scheduler/             # Background jobs
├── setup-demo-db.sql          # Database setup script
├── test-queries.sh            # Test script
└── index.js                   # Application entry point
```

## Development

```bash
# Run in development mode
pnpm run dev

# Lint code
pnpm run lint

# Format code
pnpm run format

# Run tests
./test-queries.sh
```

## Security Features

- **Read-only queries**: Automatically blocks INSERT, UPDATE, DELETE, DROP operations
- **SQL validation**: Uses PostgreSQL EXPLAIN to validate syntax
- **Input sanitization**: Pattern-based validation
- **Rate limiting**: Ready for production rate limiting

## Example Queries

```bash
# Show all users
curl -X POST http://localhost:3001/api/generate-sql \
  -H "Content-Type: application/json" \
  -d '{"question":"Show me all users"}'

# Count products
curl -X POST http://localhost:3001/api/generate-sql \
  -H "Content-Type: application/json" \
  -d '{"question":"Count all products"}'

# Total revenue
curl -X POST http://localhost:3001/api/generate-sql \
  -H "Content-Type: application/json" \
  -d '{"question":"Total revenue"}'
```

## Configuration

All configuration is done through environment variables in `.env`:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=text_to_sql_db
DB_USER=postgres
DB_PASSWORD=

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Server
PORT=3001
NODE_ENV=development

# Logging
LOG_LEVEL=info
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

ISC

## Author

**Debojyoti Mandal** - [jyoti369](https://github.com/jyoti369)
