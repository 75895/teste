import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { FileText, Edit2, Plus, Trash2, AlertCircle, Download } from "lucide-react";
import { useEffect, useState } from "react";

interface ProductWithSheet {
  id: number;
  name: string;
  sku: string;
  description?: string | null;
  weight?: string | number | null;
  weightUnit?: string | null;
  costPrice: string | number;
  salePrice: string | number;
  stockQty: number;
  stockMin: number;
}

export default function TechnicalSheet() {
  const { user } = useAuth();
  const [restaurantId, setRestaurantId] = useState<number | null>(null);
  const [products, setProducts] = useState<ProductWithSheet[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithSheet | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    weight: "",
    weightUnit: "g",
  });

  const restaurantsQuery = trpc.restaurant.list.useQuery();
  const productsQuery = trpc.product.list.useQuery(
    { restaurantId: restaurantId || 0 },
    { enabled: !!restaurantId }
  );

  useEffect(() => {
    if (restaurantsQuery.data && restaurantsQuery.data.length > 0) {
      setRestaurantId(restaurantsQuery.data[0].id);
    }
  }, [restaurantsQuery.data]);

  useEffect(() => {
    if (productsQuery.data) {
      setProducts(productsQuery.data as ProductWithSheet[]);
    }
  }, [productsQuery.data]);

  const handleEditSheet = (product: ProductWithSheet) => {
    setSelectedProduct(product);
    setFormData({
      weight: product.weight?.toString() || "",
      weightUnit: product.weightUnit || "g",
    });
    setIsDialogOpen(true);
  };

  const handleSaveSheet = async () => {
    if (!selectedProduct || !formData.weight) {
      alert("Preencha a gramatura");
      return;
    }

    // Aqui você faria a chamada para atualizar o produto
    alert(`Ficha técnica atualizada: ${formData.weight}${formData.weightUnit}`);
    setIsDialogOpen(false);
  };

  const calculateStockByWeight = (product: ProductWithSheet) => {
    if (!product.weight || !product.stockQty) return "N/A";
    const weight = typeof product.weight === 'string' ? parseFloat(product.weight) : product.weight;
    const totalWeight = weight * product.stockQty;
    return `${totalWeight.toFixed(2)} ${product.weightUnit}`;
  };

  const calculatePortions = (product: ProductWithSheet) => {
    if (!product.weight) return "N/A";
    return product.stockQty;
  };

  if (!user) {
    return <div>Carregando...</div>;
  }

  if (user.role !== "admin" && user.role !== "manager") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Card>
            <CardHeader>
              <CardTitle>Acesso Negado</CardTitle>
              <CardDescription>Apenas administradores podem acessar fichas técnicas</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <FileText className="h-8 w-8" />
              Fichas Técnicas
            </h1>
            <p className="text-muted-foreground">Gerenciar gramatura e estoque dos produtos</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>

        {/* Info Card */}
        <Card className="border-l-4 border-l-blue-500 bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <span className="text-blue-700">Como Funciona</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-700">
              Defina a gramatura/medida de cada produto. O sistema fará a baixa automática de estoque conforme as vendas. 
              Por exemplo: se um prato tem 300g e você vende 5 unidades, o estoque baixa 1.5kg automaticamente.
            </p>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Produtos</CardTitle>
            <CardDescription>Clique em um produto para editar sua ficha técnica</CardDescription>
          </CardHeader>
          <CardContent>
            {productsQuery.isLoading ? (
              <div className="text-center py-12">Carregando produtos...</div>
            ) : products.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold">SKU</th>
                      <th className="text-left py-3 px-4 font-semibold">Produto</th>
                      <th className="text-left py-3 px-4 font-semibold">Gramatura</th>
                      <th className="text-left py-3 px-4 font-semibold">Estoque (Unidades)</th>
                      <th className="text-left py-3 px-4 font-semibold">Estoque Total</th>
                      <th className="text-left py-3 px-4 font-semibold">Preço Venda</th>
                      <th className="text-center py-3 px-4 font-semibold">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b border-border hover:bg-accent transition-colors">
                        <td className="py-3 px-4 font-medium text-xs">{product.sku}</td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.description}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {product.weight ? (
                            <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                              {product.weight} {product.weightUnit}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs italic">Não definido</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-semibold">{calculatePortions(product)}</td>
                        <td className="py-3 px-4">{calculateStockByWeight(product)}</td>
                        <td className="py-3 px-4">R$ {Number(product.salePrice).toFixed(2)}</td>
                        <td className="py-3 px-4 text-center">
                          <Dialog open={isDialogOpen && selectedProduct?.id === product.id} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditSheet(product)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>

                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Editar Ficha Técnica</DialogTitle>
                                <DialogDescription>{product.name}</DialogDescription>
                              </DialogHeader>

                              <div className="space-y-4">
                                {/* Gramatura */}
                                <div className="grid grid-cols-3 gap-4">
                                  <div className="col-span-2 space-y-2">
                                    <Label>Gramatura/Medida</Label>
                                    <Input
                                      type="number"
                                      step="0.001"
                                      value={formData.weight}
                                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                      placeholder="Ex: 300"
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label>Unidade</Label>
                                    <Select value={formData.weightUnit} onValueChange={(value) => setFormData({ ...formData, weightUnit: value })}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="g">Gramas (g)</SelectItem>
                                        <SelectItem value="kg">Quilos (kg)</SelectItem>
                                        <SelectItem value="ml">Mililitros (ml)</SelectItem>
                                        <SelectItem value="l">Litros (l)</SelectItem>
                                        <SelectItem value="un">Unidades (un)</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                {/* Informações do Produto */}
                                <div className="bg-accent p-3 rounded-lg space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Estoque Atual:</span>
                                    <span className="font-semibold">{product.stockQty} unidades</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Estoque Mínimo:</span>
                                    <span className="font-semibold">{product.stockMin} unidades</span>
                                  </div>
                                  {formData.weight && (
                                    <>
                                      <div className="flex justify-between pt-2 border-t">
                                        <span className="text-sm text-muted-foreground">Total em Estoque:</span>
                                        <span className="font-semibold text-green-600">
                                          {(Number(formData.weight) * product.stockQty).toFixed(2)} {formData.weightUnit}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Preço por Unidade:</span>
                                        <span className="font-semibold">R$ {Number(product.salePrice).toFixed(2)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Preço por {formData.weightUnit}:</span>
                                        <span className="font-semibold text-blue-600">
                                          R$ {(Number(product.salePrice) / parseFloat(formData.weight)).toFixed(2)}
                                        </span>
                                      </div>
                                    </>
                                  )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2 pt-4">
                                  <Button onClick={handleSaveSheet} className="flex-1">
                                    Salvar Ficha Técnica
                                  </Button>
                                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                                    Cancelar
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground">Nenhum produto encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumo de Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Produtos com Ficha</p>
                <p className="text-2xl font-bold text-blue-600">
                  {products.filter((p) => p.weight).length}
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Sem Ficha Técnica</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {products.filter((p) => !p.weight).length}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Total de Produtos</p>
                <p className="text-2xl font-bold text-green-600">{products.length}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Estoque Baixo</p>
                <p className="text-2xl font-bold text-red-600">
                  {products.filter((p) => p.stockQty <= p.stockMin).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
