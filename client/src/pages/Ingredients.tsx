import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit2, Trash2, Leaf, Search } from "lucide-react";
import { useState } from "react";

interface Ingredient {
  id: number;
  code: string;
  name: string;
  description: string;
  unit: string;
  costPrice: number;
  salePrice: number;
  supplier: string;
}

export default function Ingredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    {
      id: 1,
      code: "ING-1001",
      name: "FRANGO CONGELADO",
      description: "Peito de frango congelado 1kg",
      unit: "kg",
      costPrice: 12.50,
      salePrice: 18.00,
      supplier: "Fornecedor A",
    },
    {
      id: 2,
      code: "ING-1002",
      name: "ARROZ INTEGRAL",
      description: "Arroz integral 5kg",
      unit: "kg",
      costPrice: 8.00,
      salePrice: 12.00,
      supplier: "Fornecedor B",
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    unit: "kg",
    costPrice: "",
    salePrice: "",
    supplier: "",
  });

  const getNextIngredientCode = () => {
    if (ingredients.length === 0) return "ING-1001";
    const maxNum = Math.max(
      ...ingredients.map((i) => parseInt(i.code.split("-")[1]))
    );
    return `ING-${maxNum + 1}`;
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === "name") {
      setFormData((prev) => ({ ...prev, [field]: value.toUpperCase() }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.costPrice) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    if (editingId) {
      setIngredients((prev) =>
        prev.map((i) =>
          i.id === editingId
            ? {
                ...i,
                name: formData.name.toUpperCase(),
                description: formData.description,
                unit: formData.unit,
                costPrice: parseFloat(formData.costPrice),
                salePrice: parseFloat(formData.salePrice) || 0,
                supplier: formData.supplier,
              }
            : i
        )
      );
      setEditingId(null);
    } else {
      const newIngredient: Ingredient = {
        id: Math.max(...ingredients.map((i) => i.id), 0) + 1,
        code: getNextIngredientCode(),
        name: formData.name.toUpperCase(),
        description: formData.description,
        unit: formData.unit,
        costPrice: parseFloat(formData.costPrice),
        salePrice: parseFloat(formData.salePrice) || 0,
        supplier: formData.supplier,
      };
      setIngredients((prev) => [...prev, newIngredient]);
    }

    setFormData({
      name: "",
      description: "",
      unit: "kg",
      costPrice: "",
      salePrice: "",
      supplier: "",
    });
    setIsDialogOpen(false);
  };

  const handleEdit = (ingredient: Ingredient) => {
    setFormData({
      name: ingredient.name,
      description: ingredient.description,
      unit: ingredient.unit,
      costPrice: ingredient.costPrice.toString(),
      salePrice: ingredient.salePrice.toString(),
      supplier: ingredient.supplier,
    });
    setEditingId(ingredient.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja deletar este insumo?")) {
      setIngredients((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const filteredIngredients = ingredients.filter((i) =>
    searchQuery === ""
      ? true
      : i.code.includes(searchQuery) ||
        i.name.includes(searchQuery.toUpperCase()) ||
        i.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateMargin = (ingredient: Ingredient) => {
    if (ingredient.salePrice === 0) return 0;
    return (((ingredient.salePrice - ingredient.costPrice) / ingredient.salePrice) * 100).toFixed(1);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Insumos e Matérias Primas</h1>
            <p className="text-muted-foreground mt-2">Gerenciar ingredientes com código 1:1 (1000+)</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Insumo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingId ? "Editar Insumo" : "Novo Insumo"}</DialogTitle>
                <DialogDescription>
                  {editingId
                    ? "Atualize os dados do insumo"
                    : `Código será gerado automaticamente: ${getNextIngredientCode()}`}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome do Insumo (CAIXA ALTA)</Label>
                  <Input
                    id="name"
                    placeholder="Ex: FRANGO CONGELADO"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva o insumo..."
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="unit">Unidade</Label>
                    <Select value={formData.unit} onValueChange={(value) => handleInputChange("unit", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="g">Gramas (g)</SelectItem>
                        <SelectItem value="kg">Quilogramas (kg)</SelectItem>
                        <SelectItem value="ml">Mililitros (ml)</SelectItem>
                        <SelectItem value="l">Litros (l)</SelectItem>
                        <SelectItem value="un">Unidades (un)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="supplier">Fornecedor</Label>
                    <Input
                      id="supplier"
                      placeholder="Nome do fornecedor"
                      value={formData.supplier}
                      onChange={(e) => handleInputChange("supplier", e.target.value)}
                    />
                  </div>
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
                  {editingId ? "Atualizar" : "Criar Insumo"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center gap-2 bg-white p-3 rounded-lg border">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por código (ING-1000+) ou nome..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-0 focus-visible:ring-0"
          />
        </div>

        <div className="grid gap-4">
          {filteredIngredients.map((ingredient) => (
            <Card key={ingredient.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <Leaf className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{ingredient.name}</h3>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{ingredient.code}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{ingredient.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Unidade:</span>
                          <p className="font-semibold">{ingredient.unit}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Custo:</span>
                          <p className="font-semibold">R$ {ingredient.costPrice.toFixed(2)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Venda:</span>
                          <p className="font-semibold text-green-600">R$ {ingredient.salePrice.toFixed(2)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Margem:</span>
                          <p className="font-semibold text-blue-600">{calculateMargin(ingredient)}%</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">Fornecedor: {ingredient.supplier}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(ingredient)}
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(ingredient.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredIngredients.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Leaf className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? "Nenhum insumo encontrado" : "Nenhum insumo cadastrado"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
