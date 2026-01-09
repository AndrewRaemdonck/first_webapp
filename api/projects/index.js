
const sql = require('mssql');
const { DefaultAzureCredential } = require('@azure/identity');

module.exports = async function (context, req) {
  const server   = process.env.SQL_SERVER;      // e.g. myserver.database.windows.net
  const database = process.env.SQL_DATABASE;    // e.g. besix_connect
  const user     = process.env.SQL_USER;        // only for SQL auth
  const password = process.env.SQL_PASSWORD;    // only for SQL auth
  const authMode = (process.env.SQL_AUTH_MODE || 'aad').toLowerCase(); // 'aad' | 'sql'

  /** Build connection config */
  let config = { server, database, options: { encrypt: true } };

  try {
    if (authMode === 'sql' && user && password) {
      config.user = user;
      config.password = password;
    } else {
      // Default: Managed Identity / AAD
      const credential = new DefaultAzureCredential();
      const token = await credential.getToken('https://database.windows.net/.default');
      config.authentication = {
        type: 'azure-active-directory-access-token',
        options: { token: token.token }
      };
    }

    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT Id, Gemeente, Straat, Netwerknummer, Infragebied, Piloot, werfnr, bestek, postcode, Werfleider, Projectleider, Einddatum, InspireID
      FROM dbo.ProjectenLite
      ORDER BY Einddatum DESC
    `);

    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: result.recordset
    };
  } catch (err) {
    context.log.error(err);
    context.res = { status: 500, body: `API error: ${err.message}` };
  }
};
