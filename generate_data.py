import pandas as pd
import numpy as np
import json
import os

# Create data directory
data_dir = "C:/Users/nabee/.gemini/antigravity/scratch/lumina-data/data"
os.makedirs(data_dir, exist_ok=True)

# 1. Sales Data (CSV)
regions = ["North", "South", "East", "West"]
products = ["Laptop", "Smartphone", "Tablet", "Monitor", "Keyboard"]
dates = pd.date_range(start="2023-01-01", periods=100)

sales_data = {
    "Date": np.random.choice(dates, 100),
    "Region": np.random.choice(regions, 100),
    "Product": np.random.choice(products, 100),
    "Sales": np.random.randint(200, 2000, 100),
    "Profit": np.random.randint(50, 500, 100)
}
df_sales = pd.DataFrame(sales_data)
df_sales.to_csv(os.path.join(data_dir, "sales_data.csv"), index=False)

# 2. Employee Data (JSON)
departments = ["Engineering", "Marketing", "Sales", "HR", "Finance"]
employees = []
for i in range(1, 21):
    employees.append({
        "id": i,
        "name": f"Employee {i}",
        "department": np.random.choice(departments),
        "salary": int(np.random.randint(50000, 120000)),
        "hire_date": pd.to_datetime(np.random.choice(dates)).strftime('%Y-%m-%d')
    })

with open(os.path.join(data_dir, "employee_data.json"), "w") as f:
    json.dump(employees, f, indent=4)

print(f"Synthetic data created in {data_dir}")
