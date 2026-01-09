
# BESIX Connect – SWA + Azure SQL (Projecten)

Deze template bevat:
- Static Web App met SSO (login.html publiek, rest protected)
- `pages/projecten.html` die `/api/projects` aanroept
- Azure Functions API (`/api/projects`) die `dbo.ProjectenLite` leest
- Klik op een project navigeert naar `Map1.html?werfnr=<werfnr>`

## Configuratie

### 1) Azure Static Web Apps – Authentication
Stel in Azure Portal → Static Web App → **Authentication / Identity Providers** → **Microsoft Entra ID**:
- Client ID (App registration)
- Issuer: `https://login.microsoftonline.com/<TENANT-ID>/v2.0`
- Single tenant

### 2) Database connectie
Er zijn twee opties:

**Optie A – Managed Identity (aanbevolen)**
1. Schakel system-assigned managed identity in op de API (SWA API omgeving).
2. In Azure SQL (database):
   ```sql
   CREATE USER [<managed-identity-naam>] FROM EXTERNAL PROVIDER;
   ALTER ROLE db_datareader ADD MEMBER [<managed-identity-naam>];
   ```
3. App settings (API) – *geen wachtwoorden nodig*:
   - `SQL_AUTH_MODE = aad`
   - `SQL_SERVER = myserver.database.windows.net`
   - `SQL_DATABASE = <db-naam>`

**Optie B – SQL gebruiker/wachtwoord (snelstart)**
- Zet in Function App settings:
  - `SQL_AUTH_MODE = sql`
  - `SQL_SERVER = myserver.database.windows.net`
  - `SQL_DATABASE = <db-naam>`
  - `SQL_USER = <user>`
  - `SQL_PASSWORD = <password>`

### 3) Deploy
- Commit & push naar GitHub (SWA triggert CI/CD)
- Ga naar `/pages/projecten.html` → lijst verschijnt
- Klik op een rij → parent frame navigeert naar `Map1.html?werfnr=...`

