from fastapi.testclient import TestClient
from main import app

client = TestClient(app)
API_KEY = "demo-api-key-123"

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to the Demo Product API. Use /products to see our items."}

def test_get_products_no_auth():
    response = client.get("/products")
    assert response.status_code == 422 # Missing header

def test_get_products_invalid_auth():
    response = client.get("/products", headers={"X-API-Key": "wrong-key"})
    assert response.status_code == 403

def test_get_products_valid_auth():
    response = client.get("/products", headers={"X-API-Key": API_KEY})
    assert response.status_code == 200
    assert len(response.json()) == 11

def test_filter_category():
    response = client.get("/products?category=Electronics", headers={"X-API-Key": API_KEY})
    assert response.status_code == 200
    products = response.json()
    assert all(p["category"] == "Electronics" for p in products)
    assert len(products) == 4

def test_filter_price():
    response = client.get("/products?min_price=100&max_price=500", headers={"X-API-Key": API_KEY})
    assert response.status_code == 200
    products = response.json()
    assert all(100 <= p["price"] <= 500 for p in products)
    assert len(products) == 4

if __name__ == "__main__":
    print("Running tests...")
    test_read_root()
    print("Root check passed.")
    test_get_products_no_auth()
    print("Auth check (missing) passed.")
    test_get_products_invalid_auth()
    print("Auth check (invalid) passed.")
    test_get_products_valid_auth()
    print("Auth check (valid) passed.")
    test_filter_category()
    print("Category filter passed.")
    test_filter_price()
    print("Price filter passed.")
    print("All tests passed!")
