import pandas as pd
import numpy as np
import os

data_dir = "C:/Users/nabee/.gemini/antigravity/scratch/lumina-data/data"
os.makedirs(data_dir, exist_ok=True)

# Generate 50,000 rows of synthetic e-commerce data
num_rows = 10000
dates = pd.date_range(start="2022-01-01", periods=num_rows, freq="h")
categories = ["Electronics", "Fashion", "Home & Kitchen", "Books", "Sports", "Beauty"]
regions = ["North America", "Europe", "Asia-Pacific", "Latin America", "Middle East"]
payment_methods = ["Credit Card", "PayPal", "Bank Transfer", "Crypto"]

data = {
    "Transaction_ID": [f"TRX-{i:06d}" for i in range(num_rows)],
    "Date": np.random.choice(dates, num_rows),
    "Category": np.random.choice(categories, num_rows),
    "Region": np.random.choice(regions, num_rows),
    "Sales_Amount": np.round(np.random.uniform(10, 5000, num_rows), 2),
    "Quantity": np.random.randint(1, 10, num_rows),
    "Discount": np.round(np.random.uniform(0, 0.3, num_rows), 2),
    "Profit_Margin": np.round(np.random.uniform(0.05, 0.4, num_rows), 2),
    "Payment_Method": np.random.choice(payment_methods, num_rows),
    "Customer_Rating": np.round(np.random.uniform(1, 5, num_rows), 1)
}

df = pd.DataFrame(data)
# Add a calculated column
df["Net_Profit"] = np.round(df["Sales_Amount"] * df["Profit_Margin"], 2)

file_path = os.path.join(data_dir, "global_sales_large.csv")
df.to_csv(file_path, index=False)

print(f"✅ Generated large dataset: {file_path} ({num_rows} rows)")
