# PostgreSQL (migrated from SQL Server)
FROM postgres:17

COPY Create.pg.sql /docker-entrypoint-initdb.d/01-create.sql
COPY Procedures/User_Procedures.pg.sql /docker-entrypoint-initdb.d/02-user-procedures.sql
COPY Procedures/PasswordEntry_Procedures.pg.sql /docker-entrypoint-initdb.d/03-password-entry-procedures.sql
COPY Procedures/UserSettings_Procedures.pg.sql /docker-entrypoint-initdb.d/04-user-settings-procedures.sql
