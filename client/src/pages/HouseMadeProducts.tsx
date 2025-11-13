import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit2, Trash2, ChefHat } from "lucide-react";
import { useState } from "react";

interface HouseMadeProduct {
  id: number;
  code: string;
  name: string;
  description: string;
  yieldQuantity: number;
  yieldUnit: string;
  costPrice: number;
  ingredients: { name: string; quantity: number; unit: string }[];
}

export default function HouseMadeProducts() {
  const [products, setProducts] = useState<HouseMadeProduct[]>([
    {
      id: 1,
      code: "HMP-001",
      name: "Molho Roti",
      description: "Molho especial para pratos principais",
      yieldQuantity: 500,
      yieldUnit: "ml",
      costPrice: 15.50,
      ingredients: [
        { name: "Tomate", quantity: 200, unit: "g" },
        { name: "Cebola", quantity: 100, unit: "g" },
        { name: "Alho", quantity: 50, unit: "g" },
      ],
    },
    {
      id: 2,
      code: "HMP-002",
      name: "Molho Madeira",
      description: "Molho clássico para carnes",
      yieldQuantity: 400,
      yieldUnit: "ml",
      costPrice: 22.00,
      ingredients: [
        { name: "Vinho Tinto", quantity: 200, unit: "ml" },
        { name: "Caldo de Carne", quantity: 150, unit: "ml" },
        { name: "Manteiga", quantity: 50, unit: "g" },
      ],
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    yieldQuantity: "",
    yieldUnit: "ml",
    costPrice: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.code || !formData.name || !formData.yieldQuantity || !formData.costPrice) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    if (editingId) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? {
                ...p,
                code: formData.code,
                name: formData.name,
                description: formData.description,
                yieldQuantity: parseFloat(formData.yieldQuantity),
                yieldUnit: formData.yieldUnit,
                costPrice: parseFloat(formData.costPrice),
              }
            : p
        )
      );
      setEditingId(null);
    } else {
      const newProduct: HouseMadeProduct = {
        id: Math.max(...products.map((p) => p.id), 0) + 1,
        code: formData.code,
        name: formData.name,
        description: formData.description,
        yieldQuantity: parseFloat(formData.yieldQuantity),
        yieldUnit: formData.yieldUnit,
        costPrice: parseFloat(formData.costPrice),
        ingredients: [],
      };
      setProducts((prev) => [...prev, newProduct]);
    }

    setFormData({ code: "", name: "", description: "", yieldQuantity: "", yieldUnit: "ml", costPrice: "" });
    setIsDialogOpen(false);
  };

  const handleEdit = (product: HouseMadeProduct) => {
    setFormData({
      code: product.code,
      name: product.name,
      description: product.description,
      yieldQuantity: product.yieldQuantity.toString(),
      yieldUnit: product.yieldUnit,
      costPrice: product.costPrice.toString(),
    });
    setEditingId(product.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja deletar este produto?")) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Produtos Feitos na Casa</h1>
            <p className="text-muted-foreground mt-2">Gerenciar molhos, preparos e produtos artesanais</p>
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
                <DialogTitle>{editingId ? "Editar Produto" : "Novo Produto Feito na Casa"}</DialogTitle>
                <DialogDescription>
                  Cadastre um novo produto artesanal ou molho
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="code">Código</Label>
                  <Input
                    id="code"
                    placeholder="HMP-001"
                    value={formData.code}
                    onChange={(e) => handleInputChange("code", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="name">Nome do Produto</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Molho Roti"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
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
                    <Label htmlFor="yieldQuantity">Rendimento</Label>
                    <Input
                      id="yieldQuantity"
                      type="number"
                      placeholder="500"
                      value={formData.yieldQuantity}
                      onChange={(e) => handleInputChange("yieldQuantity", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="yieldUnit">Unidade</Label>
                    <Select value={formData.yieldUnit} onValueChange={(value) => handleInputChange("yieldUnit", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="g">Gramas (g)</SelectItem>
                        <SelectItem value="kg">Quilogramas (kg)</SelectItem>
                        <SelectItem value="ml">Mililitros (ml)</SelectItem>
                        <SelectItem value="l">Litros (l)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="costPrice">Custo de Produção (R$)</Label>
                  <Input
                    id="costPrice"
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    value={formData.costPrice}
                    onChange={(e) => handleInputChange("costPrice", e.target.value)}
                  />
                </div>

                <Button onClick={handleSubmit} className="w-full">
                  {editingId ? "Atualizar" : "Criar Produto"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <CardDescription className="text-xs mt-1">{product.code}</CardDescription>
                  </div>
                  <ChefHat className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rendimento:</span>
                    <span className="font-semibold">
                      {product.yieldQuantity} {product.yieldUnit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Custo:</span>
                    <span className="font-semibold text-green-600">
                      R$ {product.costPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ingredientes:</span>
                    <span className="font-semibold">{product.ingredients.length}</span>
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

        {products.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ChefHat className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum produto feito na casa cadastrado</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
