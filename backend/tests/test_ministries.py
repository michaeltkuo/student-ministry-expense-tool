def test_list_ministries_public(client):
    response = client.get('/api/ministries')
    assert response.status_code == 200
    names = [m['name'] for m in response.json()]
    assert 'College Ministry' in names


def test_create_ministry_requires_auth(client):
    response = client.post('/api/ministries', json={'name': 'New Ministry'})
    assert response.status_code == 401


def test_create_update_delete_ministry(client, auth_headers):
    create = client.post('/api/ministries', json={'name': 'Campus Outreach'}, headers=auth_headers)
    assert create.status_code == 201
    ministry_id = create.json()['id']

    duplicate = client.post('/api/ministries', json={'name': 'Campus Outreach'}, headers=auth_headers)
    assert duplicate.status_code == 400

    update = client.patch(f'/api/ministries/{ministry_id}', json={'name': 'Campus Outreach Updated'}, headers=auth_headers)
    assert update.status_code == 200
    assert update.json()['name'] == 'Campus Outreach Updated'

    delete = client.delete(f'/api/ministries/{ministry_id}', headers=auth_headers)
    assert delete.status_code == 204

    missing = client.patch(f'/api/ministries/{ministry_id}', json={'name': 'x'}, headers=auth_headers)
    assert missing.status_code == 404
