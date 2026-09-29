FROM node:22-slim

WORKDIR /app

# Копируем файлы конфигурации
COPY package*.json /app/

# Устанавливаем зависимости
RUN npm install

# Копируем весь код фронта
COPY . /app/

# Открываем порт для Vite
EXPOSE 5173

# Запускаем Vite с флагом --host, чтобы он слушал внешние подключения в Docker
CMD ["npm", "run", "dev", "--", "--host"]