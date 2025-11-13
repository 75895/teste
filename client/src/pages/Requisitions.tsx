import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/_core/hooks/useAuth";
import { Plus, Check, X, Clock, FileText } from "lucide-react";
import { useState } from "react";

interface RequisitionItem {
  id: number;
  product: string;
  requestedQuantity: number;
  approvedQuantity: number;
  unit: string;
}

interface Requisition {
  id: number;
  number: string;
  from: string;
  to: string;
  status: "pending" | "approved" | "rejected" | "completed";
  totalItems: number;
  requestedBy: string;
  requestedAt: string;
  items: RequisitionItem[];
}

export default function Requisitions() {
  const { user } = useAuth();
  const [requisitions, setRequisitions] = useState<Requisition[]>([
    {
      id: 1,
      number: "REQ-001",
      from: "Almoxarifado Central",
      to: "Restaurante SS",
      status: "pending",
      totalItems: 3,
      requestedBy: "João Silva",
      requestedAt: "2025-11-13 10:30",
      items: [
        { id: 1, product: "Refrigerante 2L", requestedQuantity: 12, approvedQuantity: 0, unit: "un" },
        { id: 2, product: "Cerveja", requestedQuantity: 24, approvedQuantity: 0, unit: "un" },
        { id: 3, product: "Água Mineral", requestedQuantity: 20, approvedQuantity: 0, unit: "un" },
      ],
    },
    {
      id: 2,
      number: "REQ-002",
      from: "Almoxarifado Central",
      to: "Cozinha SS",
      status: "approved",
      totalItems: 2,
      requestedBy: "Maria Santos",
      requestedAt: "2025-11-12 14:15",
      items: [
        { id: 1, product: "Frango Congelado", requestedQuantity: 5, approvedQuantity: 5, unit: "kg" },
        { id: 2, product: "Arroz Integral", requestedQuantity: 10, approvedQuantity: 10, unit: "kg" },
      ],
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    from: "1",
    to: "2",
    product: "",
    quantity: "",
    notes: "",
  });

  const costCenters = [
    { id: "1", name: "Almoxarifado Central" },
    { id: "2", name: "Restaurante SS" },
    { id: "3", name: "Cozinha SS" },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.product || !formData.quantity || formData.from === formData.to) {
      alert("Preencha todos os campos corretamente");
      return;
    }

    const fromName = costCenters.find((c) => c.id === formData.from)?.name || "";
    const toName = costCenters.find((c) => c.id === formData.to)?.name || "";

    const newRequisition: Requisition = {
      id: Math.max(...requisitions.map((r) => r.id), 0) + 1,
      number: `REQ-${String(Math.max(...requisitions.map((r) => parseInt(r.number.split("-")[1])), 0) + 1).padStart(3, "0")}`,
      from: fromName,
      to: toName,
      status: "pending",
      totalItems: 1,
      requestedBy: user?.name || "Admin",
      requestedAt: new Date().toLocaleString("pt-BR"),
      items: [
        {
          id: 1,
          product: formData.product,
          requestedQuantity: parseFloat(formData.quantity),
          approvedQuantity: 0,
          unit: "un",
        },
      ],
    };

    setRequisitions((prev) => [newRequisition, ...prev]);
    setFormData({ from: "1", to: "2", product: "", quantity: "", notes: "" });
    setIsDialogOpen(false);
    alert("Requisição criada com sucesso!");
  };

  const handleApprove = (id: number) => {
    setRequisitions((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "approved",
              items: r.items.map((item) => ({
                ...item,
                approvedQuantity: item.requestedQuantity,
              })),
            }
          : r
      )
    );
  };

  const handleReject = (id: number) => {
    setRequisitions((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "rejected" } : r))
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendente";
      case "approved":
        return "Aprovado";
      case "completed":
        return "Concluído";
      case "rejected":
        return "Rejeitado";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "approved":
        return <Check className="w-4 h-4" />;
      case "rejected":
        return <X className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Requisições de Estoque</h1>
            <p className="text-muted-foreground mt-2">
              {user?.role === "admin"
                ? "Gerenciar requisições entre centros de custo"
                : "Visualizar requisições (apenas admin pode criar)"}
            </p>
          </div>
          {user?.role === "admin" && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Nova Requisição
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Nova Requisição de Estoque</DialogTitle>
                  <DialogDescription>
                    Crie uma requisição para transferir produtos entre centros de custo
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="from">De (Origem)</Label>
                    <Select value={formData.from} onValueChange={(value) => handleInputChange("from", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {costCenters.map((cc) => (
                          <SelectItem key={cc.id} value={cc.id}>
                            {cc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="to">Para (Destino)</Label>
                    <Select value={formData.to} onValueChange={(value) => handleInputChange("to", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {costCenters.map((cc) => (
                          <SelectItem key={cc.id} value={cc.id}>
                            {cc.name}
                          </SelectItem>
                        ))}
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
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea
                      id="notes"
                      placeholder="Adicione observações..."
                      value={formData.notes}
                      onChange={(e) => handleInputChange("notes", e.target.value)}
                    />
                  </div>

                  <Button onClick={handleSubmit} className="w-full">
                    Criar Requisição
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="space-y-4">
          {requisitions.map((requisition) => (
            <Card key={requisition.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{requisition.number}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${getStatusColor(requisition.status)}`}>
                          {getStatusIcon(requisition.status)}
                          {getStatusLabel(requisition.status)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {requisition.from} → {requisition.to}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Solicitado por</p>
                      <p className="font-semibold">{requisition.requestedBy}</p>
                      <p className="text-xs text-muted-foreground mt-1">{requisition.requestedAt}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm font-semibold mb-2">Itens ({requisition.totalItems})</p>
                    <div className="space-y-2">
                      {requisition.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                          <div>
                            <p className="font-medium">{item.product}</p>
                            <p className="text-xs text-muted-foreground">
                              Solicitado: {item.requestedQuantity} {item.unit}
                            </p>
                          </div>
                          {requisition.status === "approved" && (
                            <p className="text-xs text-green-600 font-semibold">
                              Aprovado: {item.approvedQuantity} {item.unit}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {user?.role === "admin" && requisition.status === "pending" && (
                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(requisition.id)}
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-red-600 hover:text-red-700"
                        onClick={() => handleReject(requisition.id)}
                      >
                        <X className="w-3 h-3 mr-1" />
                        Rejeitar
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {requisitions.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhuma requisição encontrada</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
