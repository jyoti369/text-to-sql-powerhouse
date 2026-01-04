import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dbPool from '../config/db.js';
import logger from '../config/logger.js';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
      ORDER BY t.table_name, c.ordinal_position;`,
    );

    const tables = {};
    res.rows.forEach(({ table_name, column_name, data_type, is_nullable }) => {
      if (!tables[table_name]) {
        tables[table_name] = {
          name: table_name,
          columns: [],
        };
      }
      tables[table_name].columns.push({
        name: column_name,
        type: data_type,
        nullable: is_nullable === 'YES',
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
    service: 'SQL_GENERATOR_AI',
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

  const foundForbiddenKeyword = forbiddenKeywords.find(
    keyword =>
      normalizedSql.includes(` ${keyword} `) ||
      normalizedSql.startsWith(`${keyword} `),
  );

  if (foundForbiddenKeyword) {
    logger.warn('SQL validation failed - forbidden keyword detected', {
      forbiddenKeyword: foundForbiddenKeyword,
      service: 'SQL_GENERATOR_AI',
    });
    return {
      isValid: false,
      error: 'Query contains a forbidden write-operation keyword.',
    };
  }

  const client = await dbPool.connect();
  try {
    logger.debug('Executing EXPLAIN query for validation', {
      service: 'SQL_GENERATOR_AI',
    });
    await client.query(`EXPLAIN ${sqlQuery}`);
    logger.info('SQL validation passed', {
      service: 'SQL_GENERATOR_AI',
    });
    return { isValid: true };
  } catch (error) {
    logger.error('SQL validation failed', {
      error: error.message,
      sqlQuery: `${sqlQuery.substring(0, 100)}...`,
      service: 'SQL_GENERATOR_AI',
    });
    return { isValid: false, error: error.message };
  } finally {
    client.release();
  }
};

const buildPrompt = (question, tables) => {
  const schemaDescription = tables
    .map(table => {
      const columns = table.columns
        .map(
          col => `${col.name} (${col.type}${col.nullable ? ', nullable' : ''})`,
        )
        .join(', ');
      return `Table: ${table.name}\nColumns: ${columns}`;
    })
    .join('\n\n');

  return `You are a PostgreSQL expert. Generate a SQL query to answer the user's question.

DATABASE SCHEMA:
${schemaDescription}

RULES:
1. Return ONLY the SQL query, no explanations or markdown
2. Use PostgreSQL syntax
3. Only use SELECT statements (no INSERT, UPDATE, DELETE, DROP, etc.)
4. Add LIMIT 100 to prevent returning too many rows
5. Use proper JOINs when needed
6. The query must be valid and executable

USER QUESTION:
${question}

SQL QUERY:`;
};

const cleanSqlResponse = response => {
  // Remove markdown code blocks if present
  let sql = response.trim();

  // Remove ```sql or ``` markers
  sql = sql
    .replace(/^```sql\n?/i, '')
    .replace(/^```\n?/, '')
    .replace(/\n?```$/, '');

  // Remove any leading/trailing whitespace
  sql = sql.trim();

  // Remove any explanatory text before or after the query
  const lines = sql.split('\n');
  const sqlLines = lines.filter(line => {
    const trimmed = line.trim();
    return (
      trimmed &&
      !trimmed.startsWith('--') &&
      !trimmed.toLowerCase().startsWith('here') &&
      !trimmed.toLowerCase().startsWith('this query')
    );
  });

  return sqlLines.join('\n').trim();
};

export const generateSqlFromQuestion = async question => {
  const startTime = Date.now();
  logger.info('Starting AI-powered SQL generation', {
    questionLength: question.length,
    question: question.substring(0, 100) + (question.length > 100 ? '...' : ''),
    service: 'SQL_GENERATOR_AI',
  });

  try {
    // Get table schema
    const tables = await getTableSchema();
    logger.debug('Retrieved table schema', {
      tableCount: tables.length,
      tables: tables.map(t => t.name),
      service: 'SQL_GENERATOR_AI',
    });

    // Build prompt for Gemini
    const prompt = buildPrompt(question, tables);

    logger.debug('Calling Gemini AI', {
      model: 'gemini-2.5-flash',
      service: 'SQL_GENERATOR_AI',
    });

    // Call Gemini AI
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
    const result = await model.generateContent(prompt);
    const { response } = result;
    const sqlQuery = cleanSqlResponse(response.text());

    logger.debug('Received response from Gemini', {
      responseLength: sqlQuery.length,
      service: 'SQL_GENERATOR_AI',
    });

    // Validate the generated SQL
    const validationResult = await validateSqlSyntax(sqlQuery);
    if (!validationResult.isValid) {
      throw new Error(`Generated SQL is invalid: ${validationResult.error}`);
    }

    const duration = Date.now() - startTime;
    logger.info('AI SQL generation completed successfully', {
      duration: `${duration}ms`,
      finalQueryLength: sqlQuery.length,
      service: 'SQL_GENERATOR_AI',
    });

    return sqlQuery;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('AI SQL generation failed', {
      error: error.message,
      duration: `${duration}ms`,
      service: 'SQL_GENERATOR_AI',
    });
    throw error;
  }
};
