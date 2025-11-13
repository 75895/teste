import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit2, Trash2, Package, Search } from "lucide-react";
import { useState } from "react";

interface Product {
  id: number;
  code: string;
  name: string;
  category: string;
  costPrice: number;
  salePrice: number;
  description: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      code: "2001",
      name: "Frango à Parmegiana",
      category: "Pratos Principais",
      costPrice: 12.50,
      salePrice: 35.00,
      description: "Frango empanado com molho de tomate e queijo derretido",
    },
    {
      id: 2,
      code: "2002",
      name: "Bife à Milanesa",
      category: "Pratos Principais",
      costPrice: 15.00,
      salePrice: 42.00,
      description: "Bife bovino empanado e frito",
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    category: "Pratos Principais",
    costPrice: "",
    salePrice: "",
    description: "",
  });

  const categories = [
    "Pratos Principais",
    "Acompanhamentos",
    "Bebidas",
    "Sobremesas",
    "Entradas",
  ];

  const getNextProductCode = () => {
    if (products.length === 0) return "2001";
    const maxCode = Math.max(...products.map((p) => parseInt(p.code)));
    return (maxCode + 1).toString();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.costPrice || !formData.salePrice) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    if (editingId) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? {
                ...p,
                name: formData.name,
                category: formData.category,
                costPrice: parseFloat(formData.costPrice),
                salePrice: parseFloat(formData.salePrice),
                description: formData.description,
              }
            : p
        )
      );
      setEditingId(null);
    } else {
      const newProduct: Product = {
        id: Math.max(...products.map((p) => p.id), 0) + 1,
        code: getNextProductCode(),
        name: formData.name,
        category: formData.category,
        costPrice: parseFloat(formData.costPrice),
        salePrice: parseFloat(formData.salePrice),
        description: formData.description,
      };
      setProducts((prev) => [...prev, newProduct]);
    }

    setFormData({
      name: "",
      category: "Pratos Principais",
      costPrice: "",
      salePrice: "",
      description: "",
    });
    setIsDialogOpen(false);
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      category: product.category,
      costPrice: product.costPrice.toString(),
      salePrice: product.salePrice.toString(),
      description: product.description,
    });
    setEditingId(product.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja deletar este produto?")) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const filteredProducts = products.filter((p) =>
    searchQuery === ""
      ? true
      : p.code.includes(searchQuery) ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateMargin = (product: Product) => {
    return (((product.salePrice - product.costPrice) / product.salePrice) * 100).toFixed(1);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
            <p className="text-muted-foreground mt-2">Gerenciar cardápio e estoque</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingId ? "Editar Produto" : "Novo Produto"}</DialogTitle>
                <DialogDescription>
                  {editingId
                    ? "Atualize os dados do produto"
                    : `Código será gerado automaticamente: ${getNextProductCode()}`}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome do Produto</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Frango à Parmegiana"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva o produto..."
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="costPrice">Custo (R$)</Label>
                    <Input
                      id="costPrice"
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      value={formData.costPrice}
                      onChange={(e) => handleInputChange("costPrice", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="salePrice">Preço Venda (R$)</Label>
                    <Input
                      id="salePrice"
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      value={formData.salePrice}
                      onChange={(e) => handleInputChange("salePrice", e.target.value)}
                    />
                  </div>
                </div>

                <Button onClick={handleSubmit} className="w-full">
                  {editingId ? "Atualizar" : "Criar Produto"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center gap-2 bg-white p-3 rounded-lg border">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por código (2000+) ou descrição..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-0 focus-visible:ring-0"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <CardDescription className="text-xs mt-1">Código: {product.code}</CardDescription>
                  </div>
                  <Package className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Categoria:</span>
                    <span className="font-semibold">{product.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Custo:</span>
                    <span className="font-semibold">R$ {product.costPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Venda:</span>
                    <span className="font-semibold text-green-600">R$ {product.salePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Margem:</span>
                    <span className="font-semibold text-blue-600">{calculateMargin(product)}%</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(product)}
                  >
                    <Edit2 className="w-3 h-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Deletar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? "Nenhum produto encontrado" : "Nenhum produto cadastrado"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
