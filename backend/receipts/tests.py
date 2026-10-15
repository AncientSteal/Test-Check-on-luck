import pytest
from django.contrib.auth import get_user_model
from django.conf import settings
from datetime import datetime, timedelta
import zoneinfo
from django.urls import reverse
from .admin import ReceiptAdminForm

from .models import Receipt
from .serializers import ReceiptSerializer

User = get_user_model()


@pytest.fixture
def promo_dates():
    """Фикстура для получения корректных дат акции"""
    start = datetime.strptime(settings.PROMO_START_DATE, '%Y-%m-%d').replace(tzinfo=zoneinfo.ZoneInfo('UTC'))
    end = datetime.strptime(settings.PROMO_END_DATE, '%Y-%m-%d').replace(
        hour=23, minute=59, second=59, tzinfo=zoneinfo.ZoneInfo('UTC')
    )
    return start, end


@pytest.fixture
def test_user():
    """Фикстура для создания тестового пользователя в БД"""
    return User.objects.create_user(username='testuser', password='password123')


# --- ТЕСТЫ ДЛЯ ВАЛИДАЦИИ ДАННЫХ ---
@pytest.mark.django_db
def test_valid_receipt_serializer(promo_dates):
    """Проверка валидации корректного чека"""
    start_date, _ = promo_dates
    valid_data = {
        'fn': '1111222233334444',
        'fd': '7788',
        'fp': '99887766',
        'purchase_date': start_date + timedelta(days=1),
        'amount': 1500.00
    }
    serializer = ReceiptSerializer(data=valid_data)
    assert serializer.is_valid() is True


@pytest.mark.django_db
def test_amount_less_than_1000_fails(promo_dates):
    """Проверка ограничения на минимальную сумму (менее 1000 руб)"""
    start_date, _ = promo_dates
    invalid_data = {
        'fn': '1111222233334444',
        'fd': '7788',
        'fp': '99887766',
        'purchase_date': start_date + timedelta(days=1),
        'amount': 950.00
    }
    serializer = ReceiptSerializer(data=invalid_data)
    assert serializer.is_valid() is False
    assert 'amount' in serializer.errors


@pytest.mark.django_db
def test_purchase_date_out_of_promo_fails(promo_dates):
    """Проверка отклонения чека вне периода акции"""
    start_date, _ = promo_dates
    invalid_data = {
        'fn': '1111222233334444',
        'fd': '7788',
        'fp': '99887766',
        'purchase_date': start_date - timedelta(days=5),
        'amount': 2000.00
    }
    serializer = ReceiptSerializer(data=invalid_data)
    assert serializer.is_valid() is False
    assert 'purchase_date' in serializer.errors


@pytest.mark.django_db
def test_purchase_date_last_day_of_promo(promo_dates):
    """Проверка корректной обработки чека в последний день периода акции"""
    _, end_date = promo_dates
    valid_data = {
        'fn': '1111222233334444',
        'fd': '7788',
        'fp': '99887766',
        'purchase_date': end_date,
        'amount': 2000.00
    }
    serializer = ReceiptSerializer(data=valid_data)
    assert serializer.is_valid() is True


@pytest.mark.django_db
def test_receipt_unique_constraint(promo_dates, test_user):
    """Проверка уникальности связки ФН + ФД + ФП"""
    start_date, _ = promo_dates

    # Создаем первый чек
    Receipt.objects.create(
        user=test_user,
        fn='1111222233334444',
        fd='7788',
        fp='99887766',
        purchase_date=start_date + timedelta(days=1),
        amount=1500.00
    )

    # Проверяем, что дубликат не пройдет валидацию
    duplicate_data = {
        'fn': '1111222233334444',
        'fd': '7788',
        'fp': '99887766',
        'purchase_date': start_date + timedelta(days=1),
        'amount': 3000.00
    }
    serializer = ReceiptSerializer(data=duplicate_data)
    assert serializer.is_valid() is False
    expected_message = "Чек с такой комбинацией ФН, ФД и ФП уже зарегистрирован в акции."
    assert serializer.errors['non_field_errors'][0] == expected_message


# --- ТЕСТЫ ДЛЯ MAIN_REDIRECT_VIEW ---
@pytest.mark.django_db
def test_main_redirect_anonymous_user(client):
    """Анонимного пользователя с главной страницы должно редиректить на логин DRF"""
    # reverse('main-index') автоматически вычислит путь "/" из urls.py
    response = client.get(reverse('main-index'))

    # Проверяем, что сервер возвращает статус редиректа (302)
    assert response.status_code == 302
    # Проверяем, что редирект ведет именно на страницу входа DRF
    assert response.url == reverse('rest_framework:login')


@pytest.mark.django_db
def test_main_redirect_authenticated_user(client, test_user):
    """ Авторизованного пользователя должно редиректить на React (порт 5173)"""
    # Логиним пользователя в нашем тестовом браузере
    client.force_login(test_user)

    response = client.get(reverse('main-index'))

    assert response.status_code == 302
    assert response.url == 'http://localhost:5173/'


# --- ТЕСТЫ НА БЕЗОПАСНОСТЬ VIEWSET (Ограничение чужих чеков) ---
@pytest.mark.django_db
def test_viewset_anonymous_user_denied(client):
    """Анонимный пользователь получает 403 Forbidden при попытке запросить API"""
    # Пытаемся постучаться на эндпоинт чеков роутера: /api/receipts/
    response = client.get('/api/receipts/')

    # Так как стоит permission_classes = [IsAuthenticated], сервер должен заблокировать запрос
    assert response.status_code == 403


@pytest.mark.django_db
def test_viewset_returns_only_owner_receipts(client, test_user, promo_dates):
    """ViewSet должен возвращать чеки ТОЛЬКО текущего пользователя"""
    start_date, _ = promo_dates

    my_receipt = Receipt.objects.create(
        user=test_user,
        fn='1111222233334444',
        fd='111',
        fp='111',
        purchase_date=start_date + timedelta(days=1),
        amount=1500
    )

    # 2. Создаем ЧУЖОЙ чек
    other_user = User.objects.create_user(username='victim', password='password')
    other_receipt = Receipt.objects.create(
        user=other_user,
        fn='5555666677778888',
        fd='222',
        fp='222',
        purchase_date=start_date + timedelta(days=1),
        amount=3000
    )

    client.force_login(test_user)
    response = client.get('/api/receipts/')
    assert response.status_code == 200

    # Вытаскиваем список результатов из JSON-ответа
    results = response.json().get('results', [])

    # ПРОВЕРКА БЕЗОПАСНОСТИ (Уязвимость BOLA/IDOR):
    # В списке должен быть ровно 1 чек, и его ID должен совпадать с чеком залогиненного пользователя
    assert len(results) == 1
    assert results[0]['id'] == my_receipt.id
    # Чужого чека в ответе быть не может
    assert all(item['id'] != other_receipt.id for item in results)


@pytest.mark.django_db
def test_viewset_receipts_does_not_have_all_methods(client, test_user, promo_dates):
    """ViewSet не имеет встроенного метода для удаления или редактирования чека"""
    start_date, _ = promo_dates

    my_receipt = Receipt.objects.create(
        user=test_user,
        fn='1111222233334444',
        fd='111',
        fp='111',
        purchase_date=start_date + timedelta(days=1),
        amount=1500
    )
    client.force_login(test_user)

    # Метод DELETE для списка запрещен (405 Method Not Allowed)
    response_del = client.delete('/api/receipts/')
    assert response_del.status_code == 405

    # Роуты для работы с конкретным ID отсутствуют в архитектуре роутера
    response_put = client.put(f'/api/receipts/{my_receipt.id}/')
    assert response_put.status_code == 404
    response_patch = client.patch(f'/api/receipts/{my_receipt.id}/')
    assert response_patch.status_code == 404


# --- ТЕСТЫ ДЛЯ АДМИНКИ ---
@pytest.mark.django_db
def test_admin_form_validation_requires_reason_on_error_status(test_user, promo_dates):
    """Форма ReceiptAdminForm должна блокировать сохранение, если статус 'error', но причина пустая"""
    start_date, _ = promo_dates

    # Пытаемся отправить некорректные данные через форму админки
    invalid_form_data = {
        'user': test_user.id,
        'fn': '1111222233334444',
        'fd': '7788',
        'fp': '99887766',
        'purchase_date': start_date + timedelta(days=1),
        'amount': 2000.00,
        'status': 'rejected',  # статус
        'reject_reason': ''  # причину оставили пустой!
    }

    form = ReceiptAdminForm(data=invalid_form_data)

    # Форма должна признать данные невалидными
    assert form.is_valid() is False
    # И выдать кастомную ошибку во внутреннем словаре
    assert 'reject_reason' in form.errors
    assert ("При переводе чека в статус ошибки необходимо обязательно указать причину отказа!"
            in form.errors['reject_reason'][0])

    # Проверяем, что с заполненной причиной форма успешно проходит валидацию
    valid_form_data = invalid_form_data.copy()
    valid_form_data['reject_reason'] = 'Неверная сумма в чеке'

    success_form = ReceiptAdminForm(data=valid_form_data)
    assert success_form.is_valid() is True
