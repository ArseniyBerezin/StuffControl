from django.shortcuts import render
import os
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import vk_api
from vk_api.utils import get_random_id
from .models import UserInfo
from django.utils.dateparse import parse_date
from dotenv import load_dotenv

load_dotenv()

VK_ACCESS_TOKEN = os.getenv("VK_ACCESS_TOKEN")
VK_CONFIRMATION_TOKEN = os.getenv("VK_CONFIRMATION_TOKEN")

vk_session = vk_api.VkApi(token=VK_ACCESS_TOKEN)
vk = vk_session.get_api()


@csrf_exempt
def vk_webhook(request):
    if request.method == 'POST':
        body = json.loads(request.body)

        if body['type'] == 'confirmation':
            return JsonResponse({'response': VK_CONFIRMATION_TOKEN})

        elif body['type'] == 'message_new':
            message = body['object']['message']
            user_id = message['from_id']
            text = message['text']

            if text.startswith('!regstuff'):
                parts = text.split()
                if len(parts) >= 7:
                    _, nickname, email, position, date_established_str, date_promotion_str, *note_parts = parts
                    note = ' '.join(note_parts)

                    # Преобразование дат из строки
                    date_established = parse_date(date_established_str)
                    date_promotion = parse_date(date_promotion_str)

                    # Создание записи в базе данных
                    user_info = UserInfo(
                        nickname=nickname,
                        email=email,
                        position=position,
                        date_established=date_established,
                        date_promotion=date_promotion,
                        note=note
                    )
                    user_info.save()

                    response = (
                        f"Получены и сохранены данные:\n"
                        f"Nickname: {nickname}\n"
                        f"Гугл почта: {email}\n"
                        f"Должность: {position}\n"
                        f"Дата постановления: {date_established}\n"
                        f"Дата повышения: {date_promotion}\n"
                        f"Примечание: {note}"
                    )
                else:
                    response = "Ошибка: Неверное количество аргументов."

                vk.messages.send(
                    user_id=user_id,
                    message=response,
                    random_id=get_random_id()
                )

            return JsonResponse({'status': 'ok'})

    return JsonResponse({'error': 'bad request'}, status=400)
