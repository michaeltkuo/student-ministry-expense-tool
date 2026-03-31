import asyncio

import ai.extractor as extractor


class _FakeResponse:
    def __init__(self, payload):
        self._payload = payload

    def raise_for_status(self):
        return None

    def json(self):
        return self._payload


class _FakeAsyncClient:
    def __init__(self, payload):
        self._payload = payload

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, tb):
        return False

    async def post(self, url, json):
        return _FakeResponse(self._payload)


def test_extract_receipt_data_parses_json(monkeypatch):
    monkeypatch.setattr(
        extractor.httpx,
        'AsyncClient',
        lambda *args, **kwargs: _FakeAsyncClient({'response': '{"vendor":"Trader Joe\\u0027s","amount":18.2,"currency":"USD"}'}),
    )

    result = asyncio.run(extractor.extract_receipt_data(b'bytes'))

    assert result['vendor'] == "Trader Joe's"
    assert result['amount'] == 18.2
    assert result['currency'] == 'USD'


def test_extract_receipt_data_returns_empty_on_unstructured_text(monkeypatch):
    monkeypatch.setattr(
        extractor.httpx,
        'AsyncClient',
        lambda *args, **kwargs: _FakeAsyncClient({'response': 'no json here'}),
    )

    result = asyncio.run(extractor.extract_receipt_data(b'bytes'))

    assert result['vendor'] is None
    assert result['amount'] is None
    assert result['currency'] == 'USD'
