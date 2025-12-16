FROM mcr.microsoft.com/dotnet/sdk:9.0
WORKDIR /app
EXPOSE 5222

COPY *.csproj ./
RUN dotnet restore

COPY . .

ENTRYPOINT ["dotnet", "watch", "run", "--urls", "http://0.0.0.0:5222"]