from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health() -> None:
    response = client.get('/health')

    assert response.status_code == 200
    assert response.json() == {'status': 'ok'}


def test_filter_contains() -> None:
    payload = {
        'rows': [
            {'team': 'platform', 'score': '91'},
            {'team': 'growth', 'score': '42'},
        ],
        'column': 'team',
        'operator': 'contains',
        'value': 'plat',
    }

    response = client.post('/api/filter', json=payload)

    assert response.status_code == 200
    assert len(response.json()['rows']) == 1
    assert response.json()['rows'][0]['team'] == 'platform'


def test_filter_greater_than_requires_numeric_value() -> None:
    payload = {
        'rows': [{'team': 'platform', 'score': '91'}],
        'column': 'score',
        'operator': 'greater_than',
        'value': 'abc',
    }

    response = client.post('/api/filter', json=payload)

    assert response.status_code == 400
    assert response.json()['detail'] == 'Filter value must be numeric for greater_than'
