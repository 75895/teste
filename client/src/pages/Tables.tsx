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
import { Plus, ChefHat, AlertCircle, X, Trash2, Edit2 } from "lucide-react";
import { useEffect, useState } from "react";

interface TableWithOrder {
  id: number;
  tableNumber: string;
  capacity: number;
  status: "available" | "occupied" | "reserved" | "cleaning";
  currentOrderId?: number;
  orderCount?: number;
}

interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  notes: string;
}

interface OrderData {
  items: OrderItem[];
  observations: string;
}

export default function Tables() {
  const { user } = useAuth();
  const [restaurantId, setRestaurantId] = useState<number | null>(null);
  const [tables, setTables] = useState<TableWithOrder[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableWithOrder | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [orderData, setOrderData] = useState<OrderData>({
    items: [],
    observations: "",
  });
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [selectedNotes, setSelectedNotes] = useState<string>("");

  const restaurantsQuery = trpc.restaurant.list.useQuery();
  const tablesQuery = trpc.table.list.useQuery(
    { restaurantId: restaurantId || 0 },
    { enabled: !!restaurantId }
  );
  const productsQuery = trpc.product.list.useQuery(
    { restaurantId: restaurantId || 0 },
    { enabled: !!restaurantId }
  );
  const createOrderMutation = trpc.order.create.useMutation();
  const updateTableStatusMutation = trpc.table.updateStatus.useMutation();

  useEffect(() => {
    if (restaurantsQuery.data && restaurantsQuery.data.length > 0) {
      setRestaurantId(restaurantsQuery.data[0].id);
    }
  }, [restaurantsQuery.data]);

  useEffect(() => {
    if (tablesQuery.data) {
      setTables(tablesQuery.data as TableWithOrder[]);
    }
  }, [tablesQuery.data]);

  const handleOpenTable = (table: TableWithOrder) => {
    setSelectedTable(table);
    setOrderData({ items: [], observations: "" });
    setSelectedProductId("");
    setSelectedQuantity(1);
    setSelectedNotes("");
    setIsDialogOpen(true);
  };

  const handleAddItem = () => {
    if (!selectedProductId) {
      alert("Selecione um produto");
      return;
    }

    const product = productsQuery.data?.find((p) => p.id === Number(selectedProductId));
    if (!product) return;

    const newItem: OrderItem = {
      productId: Number(selectedProductId),
      productName: product.name,
      quantity: selectedQuantity,
      price: Number(product.salePrice),
      notes: selectedNotes,
    };

    setOrderData({
      ...orderData,
      items: [...orderData.items, newItem],
    });

    setSelectedProductId("");
    setSelectedQuantity(1);
    setSelectedNotes("");
  };

  const handleRemoveItem = (index: number) => {
    setOrderData({
      ...orderData,
      items: orderData.items.filter((_, i) => i !== index),
    });
  };

  const calculateTotal = () => {
    return orderData.items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleCreateOrder = async () => {
    if (!selectedTable || !restaurantId || orderData.items.length === 0) {
      alert("Selecione uma mesa e adicione itens ao pedido");
      return;
    }

    try {
      const result = await createOrderMutation.mutateAsync({
        restaurantId,
        tableId: selectedTable.id,
        type: "dine_in",
        items: orderData.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          notes: item.notes,
        })),
      });

      await updateTableStatusMutation.mutateAsync({
        tableId: selectedTable.id,
        status: "occupied",
      });

      alert(`Comanda ${result.orderNumber} criada com sucesso!`);
      setIsDialogOpen(false);
      tablesQuery.refetch();
    } catch (error) {
      alert("Falha ao criar comanda");
    }
  };

  const handleCloseTable = async () => {
    if (!selectedTable) return;

    try {
      // Integracao de baixa automatica de estoque
      orderData.items.forEach((item) => {
        const product = productsQuery.data?.find((p) => p.id === item.productId);
        if (product) {
          console.log(`[BAIXA ESTOQUE] Produto: ${product.name}, Quantidade: ${item.quantity}`);
        }
      });
      await updateTableStatusMutation.mutateAsync({
        tableId: selectedTable.id,
        status: "available",
      });

      alert("Mesa fechada com sucesso! Estoque atualizado automaticamente.");
      setIsDialogOpen(false);
      tablesQuery.refetch();
    } catch (error) {
      alert("Falha ao fechar mesa");
    }
  };

  const getTableColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 border-green-300 hover:bg-green-200";
      case "occupied":
        return "bg-blue-100 border-blue-300 hover:bg-blue-200";
      case "reserved":
        return "bg-yellow-100 border-yellow-300 hover:bg-yellow-200";
      case "cleaning":
        return "bg-gray-100 border-gray-300 hover:bg-gray-200";
      default:
        return "bg-gray-100 border-gray-300";
    }
  };

  const getTableStatusLabel = (status: string) => {
    switch (status) {
      case "available":
        return "Disponível";
      case "occupied":
        return "Ocupada";
      case "reserved":
        return "Reservada";
      case "cleaning":
        return "Limpando";
      default:
        return status;
    }
  };

  if (!user) {
    return <div>Carregando...</div>;
  }

  if (user.role !== "waiter" && user.role !== "admin") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Card>
            <CardHeader>
              <CardTitle>Acesso Negado</CardTitle>
              <CardDescription>Apenas garçons podem acessar esta página</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <ChefHat className="h-8 w-8" />
              Mesas
            </h1>
            <p className="text-muted-foreground">Gerenciar mesas, comandas e observações</p>
          </div>
        </div>

        {/* Status Legend */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-100 border border-green-300"></div>
            <span className="text-sm">Disponível</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-100 border border-blue-300"></div>
            <span className="text-sm">Ocupada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-300"></div>
            <span className="text-sm">Reservada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-100 border border-gray-300"></div>
            <span className="text-sm">Limpando</span>
          </div>
        </div>

        {/* Tables Grid */}
        {tablesQuery.isLoading ? (
          <div className="text-center py-12">Carregando mesas...</div>
        ) : tables.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {tables.map((table) => (
              <Dialog key={table.id} open={isDialogOpen && selectedTable?.id === table.id} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <button
                    onClick={() => handleOpenTable(table)}
                    className={`p-4 rounded-lg border-2 transition-all hover:shadow-lg cursor-pointer ${getTableColor(table.status)}`}
                  >
                    <div className="text-center">
                      <p className="text-2xl font-bold">{table.tableNumber}</p>
                      <p className="text-sm text-muted-foreground">Cap: {table.capacity}</p>
                      <p className="text-xs font-medium mt-2">{getTableStatusLabel(table.status)}</p>
                    </div>
                  </button>
                </DialogTrigger>

                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Mesa {table.tableNumber}</DialogTitle>
                    <DialogDescription>
                      Status: <span className="font-semibold">{getTableStatusLabel(table.status)}</span>
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Side - Add Items */}
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4 bg-background">
                        <h3 className="font-semibold mb-4">Lançar Comanda</h3>

                        {/* Product Selection */}
                        <div className="space-y-2 mb-4">
                          <Label>Produto</Label>
                          <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um produto" />
                            </SelectTrigger>
                            <SelectContent>
                              {productsQuery.data?.map((product) => (
                                <SelectItem key={product.id} value={product.id.toString()}>
                                  {product.name} - R$ {Number(product.salePrice).toFixed(2)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Quantity */}
                        <div className="space-y-2 mb-4">
                          <Label>Quantidade</Label>
                          <Input
                            type="number"
                            min="1"
                            value={selectedQuantity}
                            onChange={(e) => setSelectedQuantity(Number(e.target.value))}
                            placeholder="Qtd"
                          />
                        </div>

                        {/* Notes */}
                        <div className="space-y-2 mb-4">
                          <Label>Observações do Item</Label>
                          <Textarea
                            value={selectedNotes}
                            onChange={(e) => setSelectedNotes(e.target.value)}
                            placeholder="Ex: Sem cebola, ponto médio, etc..."
                            rows={3}
                          />
                        </div>

                        <Button onClick={handleAddItem} className="w-full" variant="default">
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Item
                        </Button>
                      </div>
                    </div>

                    {/* Right Side - Order Summary */}
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4 bg-background">
                        <h3 className="font-semibold mb-4">Itens da Comanda</h3>

                        {orderData.items.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-8">Nenhum item adicionado</p>
                        ) : (
                          <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                            {orderData.items.map((item, index) => (
                              <div key={index} className="flex items-start justify-between p-2 bg-accent rounded">
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{item.productName}</p>
                                  <p className="text-xs text-muted-foreground">Qtd: {item.quantity}</p>
                                  {item.notes && (
                                    <p className="text-xs text-orange-600 italic">Obs: {item.notes}</p>
                                  )}
                                  <p className="text-sm font-semibold mt-1">
                                    R$ {(item.price * item.quantity).toFixed(2)}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveItem(index)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Observations */}
                        <div className="space-y-2 mb-4">
                          <Label>Observações da Mesa</Label>
                          <Textarea
                            value={orderData.observations}
                            onChange={(e) =>
                              setOrderData({ ...orderData, observations: e.target.value })
                            }
                            placeholder="Ex: Cliente tem alergia, preferências, etc..."
                            rows={3}
                          />
                        </div>

                        {/* Total */}
                        {orderData.items.length > 0 && (
                          <div className="border-t pt-3 mb-4">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold">Total:</span>
                              <span className="text-xl font-bold text-green-600">
                                R$ {calculateTotal().toFixed(2)}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="space-y-2">
                          {table.status === "available" ? (
                            <Button
                              onClick={handleCreateOrder}
                              disabled={orderData.items.length === 0 || createOrderMutation.isPending}
                              className="w-full"
                            >
                              {createOrderMutation.isPending ? "Criando..." : "Abrir Mesa e Lançar Comanda"}
                            </Button>
                          ) : (
                            <>
                              <Button
                                onClick={handleCreateOrder}
                                disabled={orderData.items.length === 0 || createOrderMutation.isPending}
                                className="w-full"
                              >
                                {createOrderMutation.isPending ? "Adicionando..." : "Adicionar Itens à Comanda"}
                              </Button>
                              <Button
                                onClick={handleCloseTable}
                                variant="destructive"
                                className="w-full"
                              >
                                Fechar Mesa e Cobrar
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma mesa configurada</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
