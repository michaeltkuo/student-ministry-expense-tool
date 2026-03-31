import os


def test_create_submission_with_image(client, first_ministry_id):
    response = client.post(
        '/api/submissions',
        data={
            'ministry_id': str(first_ministry_id),
            'student_name': 'Alice Student',
            'vendor': 'Target',
            'transaction_date': '2026-03-30',
            'amount': '35.50',
            'currency': 'USD',
            'category': 'Supplies & Materials',
            'description': 'Snacks',
            'raw_ai_response': '{"vendor":"Target"}',
        },
        files={'file': ('receipt.jpg', b'\xff\xd8\xff\xd9', 'image/jpeg')},
    )
    assert response.status_code == 201
    body = response.json()
    assert body['student_name'] == 'Alice Student'
    assert body['image_path'] is not None


def test_admin_list_get_update_delete_submission(client, auth_headers, first_ministry_id):
    created = client.post(
        '/api/submissions',
        data={'ministry_id': str(first_ministry_id), 'student_name': 'Bob'},
        files={'file': ('receipt.jpg', b'\xff\xd8\xff\xd9', 'image/jpeg')},
    )
    assert created.status_code == 201
    submission_id = created.json()['id']
    image_path = created.json()['image_path']

    unauth_list = client.get('/api/submissions')
    assert unauth_list.status_code == 401

    list_resp = client.get('/api/submissions', headers=auth_headers)
    assert list_resp.status_code == 200
    assert len(list_resp.json()) == 1

    get_resp = client.get(f'/api/submissions/{submission_id}', headers=auth_headers)
    assert get_resp.status_code == 200
    assert get_resp.json()['id'] == submission_id

    patch_resp = client.patch(
        f'/api/submissions/{submission_id}',
        headers=auth_headers,
        json={'status': 'reviewed', 'vendor': 'Walmart', 'amount': 19.99},
    )
    assert patch_resp.status_code == 200
    assert patch_resp.json()['status'] == 'reviewed'
    assert patch_resp.json()['vendor'] == 'Walmart'

    upload_dir = os.environ.get('UPLOAD_DIR', './uploads')
    maybe_file = os.path.join(upload_dir, image_path) if image_path else None

    delete_resp = client.delete(f'/api/submissions/{submission_id}', headers=auth_headers)
    assert delete_resp.status_code == 204

    missing = client.get(f'/api/submissions/{submission_id}', headers=auth_headers)
    assert missing.status_code == 404


def test_export_csv_marks_rows_exported(client, auth_headers, first_ministry_id):
    created = client.post(
        '/api/submissions',
        data={
            'ministry_id': str(first_ministry_id),
            'student_name': 'Charlie',
            'vendor': 'Costco',
            'transaction_date': '2026-03-25',
            'amount': '42.10',
            'currency': 'USD',
            'category': 'Meals & Entertainment',
            'description': 'Retreat meal',
        },
    )
    assert created.status_code == 201
    submission_id = created.json()['id']

    export_resp = client.get('/api/export', headers=auth_headers)
    assert export_resp.status_code == 200
    text = export_resp.text
    assert 'Employee Name,Ministry,Expense Type,Transaction Date,Vendor,Amount,Currency,Business Purpose' in text
    assert 'Charlie' in text
    assert 'Costco' in text

    fetched = client.get(f'/api/submissions/{submission_id}', headers=auth_headers)
    assert fetched.status_code == 200
    assert fetched.json()['status'] == 'exported'
