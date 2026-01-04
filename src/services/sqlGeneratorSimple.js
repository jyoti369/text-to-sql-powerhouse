import 'dotenv/config';
import dbPool from '../config/db.js';
import logger from '../config/logger.js';

// Simple pattern-based SQL generation for demo purposes
// This replaces the complex AI-based generation when Vertex AI is not available

const getTableSchema = async () => {
  const client = await dbPool.connect();
  try {
    const res = await client.query(
      `SELECT
        t.table_name,
        c.column_name,
        c.data_type,
        c.is_nullable
      FROM information_schema.tables t
      JOIN information_schema.columns c
        ON t.table_name = c.table_name
        AND t.table_schema = c.table_schema
      WHERE t.table_schema = 'public'
        AND t.table_type = 'BASE TABLE'
      ORDER BY t.table_name, c.ordinal_position;`
    );

    const tables = {};
    res.rows.forEach(({ table_name, column_name, data_type, is_nullable }) => {
      if (!tables[table_name]) {
        tables[table_name] = {
          name: table_name,
          columns: []
        };
      }
      tables[table_name].columns.push({
        name: column_name,
        type: data_type,
        nullable: is_nullable === 'YES'
      });
    });

    return Object.values(tables);
  } finally {
    client.release();
  }
};

const validateSqlSyntax = async sqlQuery => {
  logger.debug('Starting SQL syntax validation', {
    queryLength: sqlQuery.length,
    service: 'SQL_GENERATOR_SIMPLE',
  });

  const normalizedSql = sqlQuery.toLowerCase();
  const forbiddenKeywords = [
    'insert',
    'update',
    'delete',
    'drop',
    'create',
    'alter',
    'truncate',
    'grant',
    'revoke',
  ];

  const foundForbiddenKeyword = forbiddenKeywords.find(keyword =>
    normalizedSql.includes(` ${keyword} `) || normalizedSql.startsWith(keyword + ' ')
  );

  if (foundForbiddenKeyword) {
    logger.warn('SQL validation failed - forbidden keyword detected', {
      forbiddenKeyword: foundForbiddenKeyword,
      service: 'SQL_GENERATOR_SIMPLE',
    });
    return {
      isValid: false,
      error: 'Query contains a forbidden write-operation keyword.',
    };
  }

  const client = await dbPool.connect();
  try {
    logger.debug('Executing EXPLAIN query for validation', {
      service: 'SQL_GENERATOR_SIMPLE',
    });
    await client.query(`EXPLAIN ${sqlQuery}`);
    logger.info('SQL validation passed', {
      service: 'SQL_GENERATOR_SIMPLE',
    });
    return { isValid: true };
  } catch (error) {
    logger.error('SQL validation failed', {
      error: error.message,
      sqlQuery: `${sqlQuery.substring(0, 100)}...`,
      service: 'SQL_GENERATOR_SIMPLE',
    });
    return { isValid: false, error: error.message };
  } finally {
    client.release();
  }
};

const generateSimpleQuery = async (question, tables) => {
  const lowerQuestion = question.toLowerCase();
  let sql = '';

  // Pattern matching for common queries
  // Check COUNT queries first (more specific)
  if (lowerQuestion.includes('count') && lowerQuestion.includes('users')) {
    sql = 'SELECT COUNT(*) as total FROM users';
    if (lowerQuestion.includes('active')) {
      sql = "SELECT COUNT(*) as total FROM users WHERE status = 'active'";
    }
  }
  else if (lowerQuestion.includes('count') && lowerQuestion.includes('products')) {
    sql = 'SELECT COUNT(*) as total FROM products';
  }
  else if (lowerQuestion.includes('count') && lowerQuestion.includes('orders')) {
    sql = 'SELECT COUNT(*) as total FROM orders';
    if (lowerQuestion.includes('completed')) {
      sql = "SELECT COUNT(*) as total FROM orders WHERE status = 'completed'";
    }
  }
  else if (lowerQuestion.includes('total revenue') || lowerQuestion.includes('total sales')) {
    sql = "SELECT SUM(total_amount) as total_revenue FROM orders WHERE status = 'completed'";
  }
  // Check specific list queries
  else if (lowerQuestion.includes('users')) {
    sql = 'SELECT * FROM users';
    if (lowerQuestion.includes('active')) {
      sql += " WHERE status = 'active'";
    } else if (lowerQuestion.includes('inactive')) {
      sql += " WHERE status = 'inactive'";
    }
    sql += ' LIMIT 100';
  }
  else if (lowerQuestion.includes('products')) {
    sql = 'SELECT * FROM products';
    if (lowerQuestion.includes('electronics')) {
      sql += " WHERE category = 'Electronics'";
    } else if (lowerQuestion.includes('furniture')) {
      sql += " WHERE category = 'Furniture'";
    } else if (lowerQuestion.includes('stationery')) {
      sql += " WHERE category = 'Stationery'";
    }
    sql += ' LIMIT 100';
  }
  else if (lowerQuestion.includes('orders')) {
    sql = 'SELECT * FROM orders';
    if (lowerQuestion.includes('completed')) {
      sql += " WHERE status = 'completed'";
    } else if (lowerQuestion.includes('pending')) {
      sql += " WHERE status = 'pending'";
    } else if (lowerQuestion.includes('cancelled')) {
      sql += " WHERE status = 'cancelled'";
    }
    sql += ' LIMIT 100';
  }
  else if (lowerQuestion.includes('orders by user') || lowerQuestion.includes('user orders')) {
    sql = `SELECT u.name, u.email, COUNT(o.id) as order_count, SUM(o.total_amount) as total_spent
           FROM users u
           LEFT JOIN orders o ON u.id = o.user_id
           GROUP BY u.id, u.name, u.email
           ORDER BY order_count DESC`;
  }
  else if (lowerQuestion.includes('top products') || lowerQuestion.includes('popular products')) {
    sql = `SELECT p.name, p.category, COUNT(oi.id) as times_ordered, SUM(oi.quantity) as total_quantity
           FROM products p
           JOIN order_items oi ON p.id = oi.product_id
           GROUP BY p.id, p.name, p.category
           ORDER BY times_ordered DESC
           LIMIT 10`;
  }
  else if (lowerQuestion.includes('recent orders')) {
    const days = lowerQuestion.match(/(\d+)\s*(day|days)/);
    const limit = days ? days[1] : '30';
    sql = `SELECT * FROM orders
           WHERE created_at >= NOW() - INTERVAL '${limit} days'
           ORDER BY created_at DESC
           LIMIT 100`;
  }
  else if (lowerQuestion.includes('product') && lowerQuestion.includes('category')) {
    sql = `SELECT category, COUNT(*) as product_count, AVG(price) as avg_price
           FROM products
           GROUP BY category
           ORDER BY product_count DESC`;
  }
  else {
    // Default: try to be helpful by listing available tables
    const tableNames = tables.map(t => t.name).join(', ');
    throw new Error(
      `I couldn't understand your question. Available tables: ${tableNames}. ` +
      `Try queries like: "Show all users", "Count products", "Total revenue", "Top products", "Orders by user", "Recent orders"`
    );
  }

  return sql;
};

export const generateSqlFromQuestion = async question => {
  const startTime = Date.now();
  logger.info('Starting simple SQL generation process', {
    questionLength: question.length,
    question: question.substring(0, 100) + (question.length > 100 ? '...' : ''),
    service: 'SQL_GENERATOR_SIMPLE',
  });

  try {
    // Get table schema
    const tables = await getTableSchema();
    logger.debug('Retrieved table schema', {
      tableCount: tables.length,
      tables: tables.map(t => t.name),
      service: 'SQL_GENERATOR_SIMPLE',
    });

    // Generate SQL based on patterns
    const sqlQuery = await generateSimpleQuery(question, tables);

    logger.debug('Generated SQL query', {
      query: sqlQuery,
      service: 'SQL_GENERATOR_SIMPLE',
    });

    // Validate the generated SQL
    const validationResult = await validateSqlSyntax(sqlQuery);
    if (!validationResult.isValid) {
      throw new Error(`Generated SQL is invalid: ${validationResult.error}`);
    }

    const duration = Date.now() - startTime;
    logger.info('SQL generation completed successfully', {
      duration: `${duration}ms`,
      finalQueryLength: sqlQuery.length,
      service: 'SQL_GENERATOR_SIMPLE',
    });

    return sqlQuery;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('SQL generation failed', {
      error: error.message,
      duration: `${duration}ms`,
      service: 'SQL_GENERATOR_SIMPLE',
    });
    throw error;
  }
};
