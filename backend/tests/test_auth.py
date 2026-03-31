def test_login_success(client):
    response = client.post('/api/auth/login', json={'password': 'changeme'})
    assert response.status_code == 200
    body = response.json()
    assert 'access_token' in body
    assert body['token_type'] == 'bearer'


def test_login_invalid_password(client):
    response = client.post('/api/auth/login', json={'password': 'wrong-password'})
    assert response.status_code == 401
    assert response.json()['detail'] == 'Invalid password'
