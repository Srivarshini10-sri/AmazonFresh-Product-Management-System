let editingProductId = null;

document.addEventListener("DOMContentLoaded", function () {
    loadProducts();

    document
        .getElementById("productForm")
        .addEventListener("submit", handleFormSubmit);
});


// ==============================
// LOAD PRODUCTS
// ==============================

async function loadProducts() {

    const tableBody = document.getElementById("productTableBody");

    tableBody.innerHTML = `
        <tr>
            <td colspan="7" class="loading">
                Loading products...
            </td>
        </tr>
    `;

    try {

        const response = await fetch("/api/products");

        if (!response.ok) {
            throw new Error("Unable to load products");
        }

        const products = await response.json();

        displayProducts(products);

    } catch (error) {

        console.error(error);

        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="loading">
                    Unable to load products.
                </td>
            </tr>
        `;
    }
}


// ==============================
// DISPLAY PRODUCTS
// ==============================

function displayProducts(products) {

    const tableBody = document.getElementById("productTableBody");

    tableBody.innerHTML = "";

    if (products.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="loading">
                    No products found.
                </td>
            </tr>
        `;

        return;
    }

    products.forEach(product => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHTML(product.ProductID)}</td>

            <td>${escapeHTML(product.ProductName || "")}</td>

            <td>₹${formatPrice(product.PricePerUnit)}</td>

            <td>${product.StockQuantity ?? ""}</td>

            <td>${escapeHTML(product.SupplierID || "")}</td>

            <td>${product.CategoryID ?? ""}</td>

            <td>

                <button
                    class="action-btn view-btn"
                    onclick="viewProduct('${escapeAttribute(product.ProductID)}')">
                    View
                </button>

                <button
                    class="action-btn edit-btn"
                    onclick="editProduct('${escapeAttribute(product.ProductID)}')">
                    Edit
                </button>

                <button
                    class="action-btn delete-btn"
                    onclick="deleteProduct('${escapeAttribute(product.ProductID)}')">
                    Delete
                </button>

            </td>
        `;

        tableBody.appendChild(row);
    });
}


// ==============================
// ADD / UPDATE FORM
// ==============================

async function handleFormSubmit(event) {

    event.preventDefault();

    const productData = {

        ProductID: document.getElementById("ProductID").value.trim(),

        ProductName: document.getElementById("ProductName").value.trim(),

        PricePerUnit: document.getElementById("PricePerUnit").value,

        StockQuantity: document.getElementById("StockQuantity").value,

        SupplierID: document.getElementById("SupplierID").value.trim(),

        CategoryID: document.getElementById("CategoryID").value
    };


    if (!productData.ProductID || !productData.ProductName) {

        alert("Please enter Product ID and Product Name.");

        return;
    }


    try {

        let response;

        if (editingProductId === null) {

            // CREATE
            response = await fetch("/api/products", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(productData)
            });

        } else {

            // UPDATE
            response = await fetch(
                `/api/products/${encodeURIComponent(editingProductId)}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(productData)
                }
            );
        }


        const result = await response.json();


        if (!response.ok || !result.success) {

            alert(result.message || "Operation failed.");

            return;
        }


        alert(result.message);

        resetForm();

        await loadProducts();

    } catch (error) {

        console.error(error);

        alert("Server connection error.");
    }
}


// ==============================
// VIEW PRODUCT
// ==============================

async function viewProduct(productId) {

    try {

        const response = await fetch("/api/products");

        const products = await response.json();

        const product = products.find(
            item => String(item.ProductID) === String(productId)
        );


        if (!product) {

            alert("Product not found.");

            return;
        }


        document.getElementById("productDetails").innerHTML = `

            <div class="detail-row">
                <span class="detail-label">Product ID</span>
                <span class="detail-value">
                    ${escapeHTML(product.ProductID)}
                </span>
            </div>

            <div class="detail-row">
                <span class="detail-label">Product Name</span>
                <span class="detail-value">
                    ${escapeHTML(product.ProductName || "")}
                </span>
            </div>

            <div class="detail-row">
                <span class="detail-label">Price</span>
                <span class="detail-value">
                    ₹${formatPrice(product.PricePerUnit)}
                </span>
            </div>

            <div class="detail-row">
                <span class="detail-label">Stock Quantity</span>
                <span class="detail-value">
                    ${product.StockQuantity ?? ""}
                </span>
            </div>

            <div class="detail-row">
                <span class="detail-label">Supplier ID</span>
                <span class="detail-value">
                    ${escapeHTML(product.SupplierID || "")}
                </span>
            </div>

            <div class="detail-row">
                <span class="detail-label">Category ID</span>
                <span class="detail-value">
                    ${product.CategoryID ?? ""}
                </span>
            </div>
        `;


        document.getElementById("viewModal").style.display = "flex";

    } catch (error) {

        console.error(error);

        alert("Unable to load product details.");
    }
}


// ==============================
// CLOSE MODAL
// ==============================

function closeModal() {

    document.getElementById("viewModal").style.display = "none";
}


// ==============================
// EDIT PRODUCT
// ==============================

async function editProduct(productId) {

    try {

        const response = await fetch("/api/products");

        const products = await response.json();

        const product = products.find(
            item => String(item.ProductID) === String(productId)
        );


        if (!product) {

            alert("Product not found.");

            return;
        }


        editingProductId = product.ProductID;


        document.getElementById("ProductID").value =
            product.ProductID || "";

        document.getElementById("ProductName").value =
            product.ProductName || "";

        document.getElementById("PricePerUnit").value =
            product.PricePerUnit ?? "";

        document.getElementById("StockQuantity").value =
            product.StockQuantity ?? "";

        document.getElementById("SupplierID").value =
            product.SupplierID || "";

        document.getElementById("CategoryID").value =
            product.CategoryID ?? "";


        document.getElementById("ProductID").disabled = true;

        document.getElementById("formTitle").textContent =
            "Update Product";

        document.getElementById("submitButton").textContent =
            "Update Product";

        document.getElementById("cancelButton").style.display =
            "inline-block";


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    } catch (error) {

        console.error(error);

        alert("Unable to load product.");
    }
}


// ==============================
// DELETE PRODUCT
// ==============================

async function deleteProduct(productId) {

    const confirmDelete = confirm(
        `Are you sure you want to delete Product ${productId}?`
    );


    if (!confirmDelete) {
        return;
    }


    try {

        const response = await fetch(
            `/api/products/${encodeURIComponent(productId)}`,
            {
                method: "DELETE"
            }
        );


        const result = await response.json();


        if (!response.ok || !result.success) {

            alert(result.message || "Delete failed.");

            return;
        }


        alert(result.message);

        await loadProducts();

    } catch (error) {

        console.error(error);

        alert("Server connection error.");
    }
}


// ==============================
// CANCEL EDIT
// ==============================

function cancelEdit() {

    resetForm();
}


// ==============================
// RESET FORM
// ==============================

function resetForm() {

    editingProductId = null;

    document.getElementById("productForm").reset();

    document.getElementById("ProductID").disabled = false;

    document.getElementById("formTitle").textContent =
        "Add New Product";

    document.getElementById("submitButton").textContent =
        "Add Product";

    document.getElementById("cancelButton").style.display =
        "none";
}


// ==============================
// SEARCH PRODUCTS
// ==============================

function searchProducts() {

    const searchValue =
        document.getElementById("searchInput")
        .value
        .toLowerCase()
        .trim();


    const rows =
        document.querySelectorAll("#productTableBody tr");


    rows.forEach(row => {

        const text = row.textContent.toLowerCase();

        if (text.includes(searchValue)) {

            row.style.display = "";

        } else {

            row.style.display = "none";
        }
    });
}


// ==============================
// FORMAT PRICE
// ==============================

function formatPrice(price) {

    if (price === null || price === undefined || price === "") {
        return "0.00";
    }

    return Number(price).toFixed(2);
}


// ==============================
// SECURITY HELPERS
// ==============================

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function escapeAttribute(value) {

    return String(value)
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");
}


// ==============================
// CLOSE MODAL WHEN CLICKING OUTSIDE
// ==============================

window.addEventListener("click", function (event) {

    const modal = document.getElementById("viewModal");

    if (event.target === modal) {
        closeModal();
    }
});