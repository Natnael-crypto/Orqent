from fastapi import FastAPI, HTTPException, Depends, Header, Query
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="Demo Product API")

# Hardcoded API Key for demo purposes
API_KEY = "demo-api-key-123"

# Product Model
class Product(BaseModel):
    id: int
    name: str
    category: str
    price: float
    description: str

# Mock Data (10+ products, 3 categories)
products_db = [
    {"id": 1, "name": "Laptop", "category": "Electronics", "price": 1200.00, "description": "High-performance laptop"},
    {"id": 2, "name": "Smartphone", "category": "Electronics", "price": 800.00, "description": "Latest flagship smartphone"},
    {"id": 3, "name": "Headphones", "category": "Electronics", "price": 150.00, "description": "Noise-cancelling headphones"},
    {"id": 4, "name": "Office Chair", "category": "Home", "price": 250.00, "description": "Ergonomic office chair"},
    {"id": 5, "name": "Desk Lamp", "category": "Home", "price": 45.00, "description": "Modern LED desk lamp"},
    {"id": 6, "name": "Coffee Maker", "category": "Home", "price": 90.00, "description": "Automatic drip coffee maker"},
    {"id": 7, "name": "T-Shirt", "category": "Clothing", "price": 25.00, "description": "Cotton crew neck t-shirt"},
    {"id": 8, "name": "Jeans", "category": "Clothing", "price": 60.00, "description": "Classic blue slim-fit jeans"},
    {"id": 9, "name": "Jacket", "category": "Clothing", "price": 120.00, "description": "Waterproof winter jacket"},
    {"id": 10, "name": "Smart Watch", "category": "Electronics", "price": 299.00, "description": "Fitness tracking smart watch"},
    {"id": 11, "name": "Blender", "category": "Home", "price": 75.00, "description": "High-speed kitchen blender"},
]

# Authentication Dependency
def verify_api_key(x_api_key: str = Header(...)):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API Key")
    return x_api_key

@app.get("/")
def read_root():
    return {"message": "Welcome to the Demo Product API. Use /products to see our items."}

@app.get("/products", response_model=List[Product])
def get_products(
    category: Optional[str] = Query(None, description="Filter by category"),
    min_price: Optional[float] = Query(None, description="Minimum price filter"),
    max_price: Optional[float] = Query(None, description="Maximum price filter"),
    api_key: str = Depends(verify_api_key)
):
    """
    List products with optional filters.
    Requires 'X-API-Key' in headers.
    """
    filtered_products = products_db

    if category:
        filtered_products = [p for p in filtered_products if p["category"].lower() == category.lower()]
    
    if min_price is not None:
        filtered_products = [p for p in filtered_products if p["price"] >= min_price]
        
    if max_price is not None:
        filtered_products = [p for p in filtered_products if p["price"] <= max_price]

    return filtered_products

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
