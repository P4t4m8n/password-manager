FROM mcr.microsoft.com/mssql/server:2022-latest
USER root
WORKDIR /usr/src/app
COPY . .
RUN chmod +x entrypoint.sh
CMD ["./entrypoint.sh"]
