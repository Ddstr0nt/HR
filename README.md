
## Описание

Этот проект представляет собой веб-приложение для управления персоналом. В нем есть несколько HTML-страниц, таких как домашняя страница, страницы входа, регистрации и таблиц.

## Структура проекта

Backend:
- `server.js`: Точка входа приложения, подключает модули маршрутов и обработчик ошибок.
- `src/config/db.js`: Подключение к базе данных (конфигурация через переменные окружения).
- `src/middleware/auth.js`: JWT-аутентификация (`authenticateToken`, `signToken`).
- `src/routes/`:
  - `auth.js`: Авторизация, регистрация, защищённый маршрут.
  - `workers.js`: CRUD для работников (с JOIN справочников).
  - `list.js`: CRUD для истории действий.
  - `positions.js`, `professions.js`, `education.js`: CRUD для справочников.
  - `genders.js`, `actions.js`: чтение справочников.
  - `stats.js`: агрегированные счётчики.

Frontend:
- `public/`: HTML/CSS/JS (статические файлы).
  - `home.html`, `index.html`, `list.html`, `tables.html`, `login.html`, `register.html`, `css/styles.css`.
- `ok.sql`: SQL-скрипт для инициализации БД.

## Установка и запуск

1. Убедитесь, что у вас установлен Node.js.
2. Создайте файл `.env` (опционально):
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=root
   DB_NAME=ok
   DB_PORT=3306
   JWT_SECRET=change_me
   ```
3. Установите зависимости:
   ```bash
   npm install
   ```
4. Запустите сервер:
   ```bash
   node server.js
   ```
   или для разработки с перезапуском:
   ```bash
   npm run dev
   ```

## Лицензия

Этот проект распространяется под лицензией MIT.