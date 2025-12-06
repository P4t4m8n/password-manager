#!/bin/bash
chown -R mssql:root /var/opt/mssql/data

su mssql -c "/opt/mssql/bin/sqlservr" & 
pid=$!
echo "Waiting for SQL Server to start..."
sleep 20
echo "Running Create.sql..."
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P $SA_PASSWORD -C -i /usr/src/app/Create.sql
echo "Running Procedures..."
for f in /usr/src/app/Procedures/*.sql
do
  echo "Processing $f..."
  /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P $SA_PASSWORD -C -i "$f"
done
echo "Done."
wait $pid