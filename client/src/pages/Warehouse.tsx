import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/_core/hooks/useAuth";
import { Package, Plus, ArrowRight, FileText, Boxes } from "lucide-react";
import { useState } from "react";

interface CostCenter {
  id: number;
  code: string;
  name: string;
  type: "warehouse" | "kitchen" | "dining" | "bar";
  itemCount: number;
  totalValue: number;
}

interface WarehouseMovement {
  id: number;
  from: string;
  to: string;
  product: string;
  quantity: number;
  date: string;
  status: "pending" | "approved" | "completed";
}

export default function Warehouse() {
  const { user } = useAuth();
  const [costCenters] = useState<CostCenter[]>([
    {
      id: 1,
      code: "ALM-001",
      name: "Almoxarifado Central",
      type: "warehouse",
      itemCount: 45,
      totalValue: 12500.00,
    },
    {
      id: 2,
      code: "REST-001",
      name: "Restaurante SS",
      type: "dining",
      itemCount: 28,
      totalValue: 5200.00,
    },
    {
      id: 3,
      code: "COZ-001",
      name: "Cozinha SS",
      type: "kitchen",
      itemCount: 32,
      totalValue: 8900.00,
    },
  ]);

  const [movements] = useState<WarehouseMovement[]>([
    {
      id: 1,
      from: "Almoxarifado Central",
      to: "Restaurante SS",
      product: "Refrigerante 2L",
      quantity: 12,
      date: "2025-11-13",
      status: "completed",
    },
    {
      id: 2,
      from: "Almoxarifado Central",
      to: "Cozinha SS",
      product: "Frango Congelado",
      quantity: 5,
      date: "2025-11-13",
      status: "approved",
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    product: "",
    quantity: "",
    costCenter: "",
    type: "entry",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.product || !formData.quantity || !formData.costCenter) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }
    alert(`Movimento registrado: ${formData.product} - ${formData.quantity} unidades`);
    setFormData({ product: "", quantity: "", costCenter: "", type: "entry" });
    setIsDialogOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Concluído";
      case "approved":
        return "Aprovado";
      case "pending":
        return "Pendente";
      default:
        return status;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Almoxarifado</h1>
            <p className="text-muted-foreground mt-2">Gestão centralizada de estoque e requisições</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Nova Movimentação
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Registrar Movimentação</DialogTitle>
                <DialogDescription>
                  Registre uma entrada, saída ou transferência de produtos
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="type">Tipo de Movimentação</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Entrada</SelectItem>
                      <SelectItem value="exit">Saída</SelectItem>
                      <SelectItem value="transfer">Transferência</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="product">Produto</Label>
                  <Input
                    id="product"
                    placeholder="Nome do produto"
                    value={formData.product}
                    onChange={(e) => handleInputChange("product", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="quantity">Quantidade</Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="0"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange("quantity", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="costCenter">Centro de Custo</Label>
                  <Select value={formData.costCenter} onValueChange={(value) => handleInputChange("costCenter", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {costCenters.map((cc) => (
                        <SelectItem key={cc.id} value={cc.id.toString()}>
                          {cc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleSubmit} className="w-full">
                  Registrar Movimentação
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="centers" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="centers">Centros de Custo</TabsTrigger>
            <TabsTrigger value="movements">Movimentações</TabsTrigger>
            <TabsTrigger value="requisitions">Requisições</TabsTrigger>
          </TabsList>

          <TabsContent value="centers" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {costCenters.map((center) => (
                <Card key={center.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{center.name}</CardTitle>
                        <CardDescription className="text-xs mt-1">{center.code}</CardDescription>
                      </div>
                      <Boxes className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Itens:</span>
                      <span className="font-semibold">{center.itemCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Valor Total:</span>
                      <span className="font-semibold text-green-600">
                        R$ {center.totalValue.toFixed(2)}
                      </span>
                    </div>
                    <Button variant="outline" className="w-full text-xs" size="sm">
                      Ver Detalhes
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="movements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Últimas Movimentações</CardTitle>
                <CardDescription>Histórico de entradas, saídas e transferências</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {movements.map((movement) => (
                    <div key={movement.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3 flex-1">
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{movement.product}</p>
                          <p className="text-xs text-muted-foreground">
                            {movement.from} → {movement.to}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-semibold">{movement.quantity} un</p>
                          <p className="text-xs text-muted-foreground">{movement.date}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(movement.status)}`}>
                          {getStatusLabel(movement.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requisitions" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Requisições de Estoque</CardTitle>
                    <CardDescription>Apenas administradores podem criar requisições</CardDescription>
                  </div>
                  {user?.role === "admin" && (
                    <Button className="gap-2" size="sm">
                      <Plus className="w-4 h-4" />
                      Nova Requisição
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Nenhuma requisição pendente</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
