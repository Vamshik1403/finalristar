import React, { useState, useEffect } from "react";
import { Search, Plus, Trash2, Pencil, FileText, Eye } from "lucide-react";
import AddProductForm from "./AddProductForm";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

// Define Msds type if not already defined or imported
interface Msds {
  msdsCertificate: any;
  // Add appropriate fields here, for example:
  id: number;
  documentUrl: string;
  // Add other fields as needed
}

// Add interface for Product type
interface Product {
  shippingName: any;

  id: number;
  status: string;
  productId: string; // Note: matches backend field name
  productName: string;
  tradeName: string;
  productType: string;
  grade: string;
  containerCategory: string;
  containerType: string;
  classType: string;
  derivative?: string;
  cleanType?: string;
  unCode?: string;
  packaging?: string;
  msds: Msds[];
}

const ProductsInventoryPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // <-- Add searchTerm state

  // Fetch products when component mounts
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:8000/products");
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch products: ${errorText}`);
        }
        const data = await response.json();
        // Map productMSDS to msds for frontend compatibility
        const mappedData = data.map((product: any) => ({
          ...product,
          msds: product.productMSDS || [], // <-- map here
          productId: product.productId,
          shipperName: product.shippingName,
        }));
        setProducts(mappedData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch products"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [showModal]); // Refetch when modal closes

  // Filtered products based on searchTerm
  const filteredProducts = products.filter((product) => {
    const term = searchTerm.toLowerCase();
    return (
      product.productId?.toLowerCase().includes(term) ||
      product.productName?.toLowerCase().includes(term) ||
      product.tradeName?.toLowerCase().includes(term) ||
      product.productType?.toLowerCase().includes(term) ||
      product.grade?.toLowerCase().includes(term) ||
      product.containerCategory?.toLowerCase().includes(term) ||
      product.containerType?.toLowerCase().includes(term) ||
      product.classType?.toLowerCase().includes(term) ||
      product.derivative?.toLowerCase().includes(term) ||
      product.cleanType?.toLowerCase().includes(term) ||
      product.unCode?.toLowerCase().includes(term) ||
      product.packaging?.toLowerCase().includes(term) ||
      product.shippingName?.toLowerCase().includes(term) ||
      (product.msds &&
        product.msds.some((msds) =>
          (msds.msdsCertificate || "").toString().toLowerCase().includes(term)
        ))
    );
  });

  if (loading) {
    return <div className="text-white text-center p-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">Error: {error}</div>;
  }

  function handleDelete(id: number): void {
    if (window.confirm("Are you sure you want to delete this product?")) {
      fetch(`http://localhost:8000/products/${id}`, {
        method: "DELETE",
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to delete product");
          }
          // Remove the deleted product from the state
          setProducts((prev) => prev.filter((product) => product.id !== id));
        })
        .catch((err) => {
          setError(
            err instanceof Error ? err.message : "Failed to delete product"
          );
        });
    }
  }

  function handleEditClick(id: number): void {
    const productToEdit = products.find((p) => p.id === id);
    if (productToEdit) {
      // Map the data to match the form fields
      const editData = {
        ...productToEdit,
        productId: productToEdit.productId, // Map backend field to frontend field
        shipperName: productToEdit.shippingName, // Map backend field to frontend field
      };
      setEditingProduct(editData);
      setShowModal(true);
    }

    // Removed incorrect mapping of data here; already handled in fetchProducts.
  }

  const handleProductSubmit = async ({ formData, msdsRecords, editData }: any) => {
    try {
      setIsSaving(true);
      
      if (editData) {
        // For edit: Process MSDS files first
        const msdsArray = await Promise.all(msdsRecords.map(async (record: any) => {
          // Start with the existing certificate name or empty string
          let certificateName = record.certificateName || "";
          
          // If there's a new file, upload it first
          if (record.certificate && record.certificate instanceof File) {
            const fileForm = new FormData();
            fileForm.append("file", record.certificate);
            
            try {
              const uploadRes = await axios.post(
                "http://localhost:8000/product-msds/upload",
                fileForm,
                { headers: { "Content-Type": "multipart/form-data" } }
              );
              
              certificateName = uploadRes.data.filename;
            } catch (error) {
              console.error("File upload failed:", error);
              // Don't throw - continue with existing certificate if available
            }
          }
          
          // Always include these fields, even if empty
          return {
            msdcIssueDate: record.issueDate || new Date().toISOString().split('T')[0],
            msdsCertificate: certificateName,
            remark: record.remark || ""
          };
        }));

        // Prepare update data
        const updateData = {
          status: formData.status,
          productId: formData.productId,
          productName: formData.productName,
          tradeName: formData.tradeName,
          grade: formData.grade,
          productType: formData.productType,
          derivative: formData.derivative || '',
          cleanType: formData.cleanType,
          unCode: formData.unCode,
          packaging: formData.packaging,
          shippingName: formData.shippingName,
          containerCategory: formData.containerCategory,
          containerType: formData.containerType,
          classType: formData.classType,
          msds: msdsArray
        };
        // Send update
        await axios({
          method: "patch",
          url: `http://localhost:8000/products/${editData.id}`,
          data: updateData,
          headers: { "Content-Type": "application/json" }
        });
        
        setShowModal(false);
        setEditingProduct(null);
        
        // Refresh the products list
        const response = await fetch("http://localhost:8000/products");
        if (response.ok) {
          const data = await response.json();
          const mappedData = data.map((product: any) => ({
            ...product,
            msds: product.productMSDS || [],
            productId: product.productId,
            shipperName: product.shippingName,
          }));
          setProducts(mappedData);
        }
      } 
      else {
        // For new product: Create first, then add MSDS records separately
        const productRes = await axios.post(
          "http://localhost:8000/products",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        
        const productId = productRes.data.id;
        
        // 2. Create MSDS records (if any)
        for (const record of msdsRecords ?? []) {
          if (record.certificate) {
            // If there's a file, use the upload endpoint first
            const fileForm = new FormData();
            fileForm.append("file", record.certificate);
            
            const uploadRes = await axios.post(
              "http://localhost:8000/product-msds/upload",
              fileForm,
              { headers: { "Content-Type": "multipart/form-data" } }
            );
            
            // Then create the MSDS record with the file path returned from upload
            await axios.post("http://localhost:8000/product-msds", {
              productId: Number(productId),
              msdcIssueDate: record.issueDate,
              msdsCertificate: uploadRes.data.filename,
              remark: record.remark || "",
            });
          } else {
            // If no file, just create the MSDS record
            await axios.post("http://localhost:8000/product-msds", {
              productId: Number(productId),
              msdcIssueDate: record.issueDate, 
              msdsCertificate: "",
              remark: record.remark || "",
            });
          }
        }
      }

      setShowModal(false);
      setEditingProduct(null);
    } catch (error: any) {
      alert(
        error?.response?.data?.message || error.message || "Something went wrong"
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="px-4 pt-0 pb-4">
      <div className="flex items-center justify-between mt-0 mb-4">
        <div className="relative w-full mr-4">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            type="text"
            placeholder="Search products..."
            className="p-2 pl-10 rounded-lg bg-neutral-900 text-white placeholder-neutral-400 border border-neutral-800 focus:outline-none focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button
          onClick={() => setShowModal(true)}
          disabled={isSaving}
          className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium py-2 px-6 shadow rounded-md whitespace-nowrap"
        >
          {isSaving ? "Saving..." : <>Add Product</>}
        </Button>
      </div>

      {/* Add Product Modal */}
      {showModal && (
        <AddProductForm
          onClose={() => {
            setShowModal(false);
            setEditingProduct(null);
          }}
          editData={editingProduct}
          onSubmit={handleProductSubmit}
        />
      )}

      {/* Table Container */}
      <div className="rounded-lg shadow border border-border bg-background overflow-x-auto mt-4">
        <Table>
          <TableHeader className="bg-background">
            <TableRow>
              <TableHead className="text-foreground">Product ID</TableHead>
              <TableHead className="text-foreground">Product Name</TableHead>
              <TableHead className="text-foreground">Trade Name</TableHead>
              <TableHead className="text-foreground">Type</TableHead>
              <TableHead className="text-foreground">Grade</TableHead>
              <TableHead className="text-foreground">Shipper Name</TableHead>
              <TableHead className="text-foreground">Cont. Category</TableHead>
              <TableHead className="text-foreground">Cont. Type</TableHead>
              <TableHead className="text-foreground">Cont. Class</TableHead>
              <TableHead className="text-foreground">Status</TableHead>
              <TableHead className="text-foreground">Actions</TableHead>
              <TableHead className="text-foreground">MSDS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id} className="hover:bg-muted border-b border-border bg-background text-foreground">
                <TableCell>{product.productId}</TableCell>
                <TableCell>{product.productName}</TableCell>
                <TableCell>{product.tradeName}</TableCell>
                <TableCell>{product.productType}</TableCell>
                <TableCell>{product.grade}</TableCell>
                <TableCell>{product.shippingName}</TableCell>
                <TableCell>{product.containerCategory}</TableCell>
                <TableCell>{product.containerType}</TableCell>
                <TableCell>{product.classType}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      product.status === "Approved"
                        ? "bg-green-200 text-green-900 dark:bg-green-700 dark:text-green-100"
                        : "bg-yellow-200 text-yellow-900 dark:bg-yellow-700 dark:text-yellow-100"
                    }`}
                  >
                    {product.status}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2 items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Edit"
                      onClick={() => handleEditClick(product.id)}
                      className="hover:bg-blue-100 hover:text-blue-900 dark:hover:bg-blue-900 dark:hover:text-blue-400 text-muted-foreground transition-all duration-200"
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Delete"
                      onClick={() => handleDelete(product.id)}
                      className="hover:bg-red-900 hover:text-red-400 text-neutral-300 transition-all duration-200"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {product.msds && product.msds.length > 0 ? (
                      product.msds.map((msds, idx) =>
                        msds.msdsCertificate ? (
                          <a
                            key={idx}
                            href={
                              msds.msdsCertificate.startsWith("http")
                                ? msds.msdsCertificate
                                : `http://localhost:8000/uploads/${msds.msdsCertificate}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-600"
                            title={`View PDF ${idx + 1}`}
                          >
                            <Eye size={18} />
                            {/* Optionally: <span className="sr-only">View PDF {idx + 1}</span> */}
                          </a>
                        ) : (
                          <span key={idx} className="text-neutral-400">
                            No PDF
                          </span>
                        )
                      )
                    ) : (
                      <span className="text-neutral-400">No MSDS</span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ProductsInventoryPage;
