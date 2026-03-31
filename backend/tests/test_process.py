import routers.process as process_router


def test_process_rejects_non_image(client):
    response = client.post(
        '/api/process-receipt',
        files={'file': ('receipt.txt', b'not-image', 'text/plain')},
    )
    assert response.status_code == 400
    assert response.json()['detail'] == 'File must be an image'


def test_process_returns_extracted_payload(client, monkeypatch):
    async def fake_extract(_image_bytes: bytes):
        return {
            'vendor': 'Costco',
            'date': '2026-03-01',
            'amount': 24.99,
            'currency': 'USD',
            'category': 'Supplies & Materials',
            'description': 'Event supplies',
        }

    monkeypatch.setattr(process_router, 'extract_receipt_data', fake_extract)

    response = client.post(
        '/api/process-receipt',
        files={'file': ('receipt.jpg', b'\xff\xd8\xff\xd9', 'image/jpeg')},
    )
    assert response.status_code == 200
    body = response.json()
    assert body['vendor'] == 'Costco'
    assert body['date'] == '2026-03-01'
    assert body['amount'] == 24.99
