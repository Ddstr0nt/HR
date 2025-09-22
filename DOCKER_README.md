# Развертывание HR-системы с Docker

Этот документ содержит инструкции по развертыванию HR-системы с использованием Docker и Docker Compose.

## Предварительные требования

Убедитесь, что у вас установлены:
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Быстрый запуск

1. **Клонируйте репозиторий** (если еще не сделали):
   ```bash
   git clone https://github.com/Ddstr0nt/HR.git
   cd HR
   ```

2. **Запустите приложение**:
   ```bash
   docker-compose up -d
   ```

3. **Дождитесь инициализации**:
   Первый запуск может занять несколько минут, так как Docker загружает образы и инициализирует базу данных.

4. **Откройте приложение**:
   Перейдите в браузере по адресу: http://localhost:3000

## Структура Docker-конфигурации

### Dockerfile
- Использует официальный образ Node.js 18 Alpine
- Устанавливает зависимости и копирует исходный код
- Создает непривилегированного пользователя для безопасности
- Открывает порт 3000

### docker-compose.yml
Определяет два сервиса:

#### MySQL (mysql)
- **Образ**: mysql:8.0
- **Порт**: 3306
- **База данных**: ok
- **Пользователь**: root/root
- **Том**: Автоматическая инициализация из ok.sql

#### Node.js приложение (app)
- **Порт**: 3000
- **Зависимости**: Ждет готовности MySQL
- **Переменные окружения**: Настроены для подключения к MySQL

## Управление контейнерами

### Запуск
```bash
# Запуск в фоновом режиме
docker-compose up -d

# Запуск с выводом логов
docker-compose up
```

### Остановка
```bash
# Остановка контейнеров
docker-compose down

# Остановка с удалением томов (ВНИМАНИЕ: удалит данные БД)
docker-compose down -v
```

### Просмотр логов
```bash
# Логи всех сервисов
docker-compose logs

# Логи конкретного сервиса
docker-compose logs app
docker-compose logs mysql

# Следить за логами в реальном времени
docker-compose logs -f app
```

### Перезапуск
```bash
# Перезапуск всех сервисов
docker-compose restart

# Перезапуск конкретного сервиса
docker-compose restart app
```

## Доступ к базе данных

### Подключение к MySQL из контейнера
```bash
docker-compose exec mysql mysql -u root -p ok
```

### Подключение к MySQL с хоста
- **Хост**: localhost
- **Порт**: 3307
- **Пользователь**: root
- **Пароль**: root
- **База данных**: ok

## Разработка

### Пересборка образа приложения
После изменения кода:
```bash
docker-compose build app
docker-compose up -d app
```

### Полная пересборка
```bash
docker-compose build --no-cache
docker-compose up -d
```

## Учетные данные по умолчанию

В системе предустановлены следующие пользователи:

| Пользователь | Пароль | Роль |
|-------------|--------|------|
| admin | admin | admin |
| editor | editor | editor |
| user | user | user |

## Порты

- **3000** - Веб-приложение
- **3307** - MySQL база данных (внешний порт)

## Тома Docker

- `mysql_data` - Данные MySQL (персистентное хранилище)

## Сеть

Все сервисы работают в изолированной сети `hr_network`.

## Устранение неполадок

### Проверка статуса контейнеров
```bash
docker-compose ps
```

### Проверка здоровья MySQL
```bash
docker-compose exec mysql mysqladmin ping -h localhost
```

### Очистка и перезапуск
```bash
docker-compose down -v
docker system prune -f
docker-compose up -d
```

### Проблемы с подключением к БД
1. Убедитесь, что MySQL контейнер запущен и здоров
2. Проверьте логи MySQL: `docker-compose logs mysql`
3. Дождитесь полной инициализации БД (может занять 1-2 минуты)

## Производственное развертывание

Для продакшена рекомендуется:

1. **Изменить пароли по умолчанию**
2. **Использовать переменные окружения для секретов**
3. **Настроить SSL/TLS**
4. **Использовать внешний том для MySQL**
5. **Настроить мониторинг и логирование**

### Пример .env файла для продакшена
```env
MYSQL_ROOT_PASSWORD=your_secure_password
MYSQL_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret_key
NODE_ENV=production
```

## Поддержка

При возникновении проблем:
1. Проверьте логи: `docker-compose logs`
2. Убедитесь, что порты 3000 и 3306 свободны
3. Проверьте, что Docker и Docker Compose установлены корректно
