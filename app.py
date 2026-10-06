from flask import Flask, render_template, request, jsonify
import mysql.connector

app = Flask(__name__)

# MySQL Database Configuration
db_config = {
    "host": "localhost",
    "user": "amazonfresh_app",
    "password": "AmazonFresh@123",
    "database": "amazonfresh"
}


# Database Connection
def get_db_connection():
    return mysql.connector.connect(**db_config)


# Home Page
@app.route("/")
def home():
    return render_template("index.html")


# READ - Get all products
@app.route("/api/products", methods=["GET"])
def get_products():

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            ProductID,
            ProductName,
            PricePerUnit,
            StockQuantity,
            SupplierID,
            CategoryID
        FROM Products
        ORDER BY ProductID
    """)

    products = cursor.fetchall()

    cursor.close()
    connection.close()

    return jsonify(products)


# CREATE - Add product
@app.route("/api/products", methods=["POST"])
def add_product():

    data = request.json

    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        query = """
            INSERT INTO Products
            (
                ProductID,
                ProductName,
                PricePerUnit,
                StockQuantity,
                SupplierID,
                CategoryID
            )
            VALUES (%s, %s, %s, %s, %s, %s)
        """

        values = (
            data.get("ProductID"),
            data.get("ProductName"),
            data.get("PricePerUnit"),
            data.get("StockQuantity"),
            data.get("SupplierID"),
            data.get("CategoryID")
        )

        cursor.execute(query, values)
        connection.commit()

        return jsonify({
            "success": True,
            "message": "Product added successfully"
        })

    except mysql.connector.Error as error:

        connection.rollback()

        return jsonify({
            "success": False,
            "message": str(error)
        }), 400

    finally:
        cursor.close()
        connection.close()
# UPDATE - Update product
@app.route("/api/products/<product_id>", methods=["PUT"])
def update_product(product_id):
    data = request.json
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        query = """
            UPDATE Products
            SET
                ProductName = %s,
                PricePerUnit = %s,
                StockQuantity = %s,
                SupplierID = %s,
                CategoryID = %s
            WHERE ProductID = %s
        """
        values = (
            data.get("ProductName"),
            data.get("PricePerUnit"),
            data.get("StockQuantity"),
            data.get("SupplierID"),
            data.get("CategoryID"),
            product_id
        )
        cursor.execute(query, values)
        connection.commit()
        return jsonify({
            "success": True,
            "message": "Product updated successfully"
        })
    except mysql.connector.Error as error:
        connection.rollback()
        return jsonify({
            "success": False,
            "message": str(error)
        }), 400
    finally:
        cursor.close()
        connection.close()
# DELETE - Delete product
@app.route("/api/products/<product_id>", methods=["DELETE"])
def delete_product(product_id):
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute(
            "DELETE FROM Products WHERE ProductID = %s",
            (product_id,)
        )
        connection.commit()
        return jsonify({
            "success": True,
            "message": "Product deleted successfully"
        })
    except mysql.connector.Error as error:
        connection.rollback()
        return jsonify({
            "success": False,
            "message": str(error)
        }), 400
    finally:
        cursor.close()
        connection.close()
# Run Flask Application
if __name__ == "__main__":
    app.run(debug=True)