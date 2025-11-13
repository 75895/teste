import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
  AlertCircle,
  ChefHat,
  Clock,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

interface DashboardMetrics {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  averageTicket: number;
  lowStockProducts: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [restaurantId, setRestaurantId] = useState<number | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    averageTicket: 0,
    lowStockProducts: 0,
  });

  const restaurantsQuery = trpc.restaurant.list.useQuery();
  const ordersQuery = trpc.order.list.useQuery(
    { restaurantId: restaurantId || 0 },
    { enabled: !!restaurantId }
  );

  useEffect(() => {
    if (restaurantsQuery.data && restaurantsQuery.data.length > 0) {
      setRestaurantId(restaurantsQuery.data[0].id);
    }
  }, [restaurantsQuery.data]);

  useEffect(() => {
    if (ordersQuery.data) {
      const orders = ordersQuery.data;
      const totalSales = orders.reduce((sum, order) => sum + Number(order.total), 0);
      const totalOrders = orders.length;
      const averageTicket = totalOrders > 0 ? totalSales / totalOrders : 0;

      setMetrics({
        totalSales,
        totalOrders,
        totalCustomers: 0,
        averageTicket,
        lowStockProducts: 0,
      });
    }
  }, [ordersQuery.data]);

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
              <CardDescription>Apenas administradores podem acessar o dashboard</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bem-vindo, {user.name}! 👋</h1>
          <p className="text-muted-foreground">Aqui está o resumo do seu restaurante hoje</p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-amber-700">Vendas Totais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-900">R$ {metrics.totalSales.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">📈 Hoje</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Pedidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{metrics.totalOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">🛒 Hoje</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Ticket Médio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">R$ {metrics.averageTicket.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">💰 Por pedido</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">0</div>
              <p className="text-xs text-muted-foreground mt-1">👥 Únicos</p>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alert */}
        <Card className="border-l-4 border-l-red-500 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-red-700">Estoque Baixo</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">0</div>
            <p className="text-xs text-muted-foreground mt-1">🔴 Produtos</p>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pedidos Recentes
            </CardTitle>
            <CardDescription>Últimos pedidos do seu restaurante</CardDescription>
          </CardHeader>
          <CardContent>
            {ordersQuery.data && ordersQuery.data.length > 0 ? (
              <div className="space-y-4">
                {ordersQuery.data.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{order.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        R$ {Number(order.total).toFixed(2)}
                      </p>
                      <p className="text-sm">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            order.status === "completed"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                              : order.status === "preparing"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                          }`}
                        >
                          {order.status}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ChefHat className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground">Nenhum pedido encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Gerenciamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start cursor-pointer" 
                onClick={() => navigate("/products")}
              >
                📦 Produtos
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
                👥 Clientes
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
                🚚 Fornecedores
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Operações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" disabled>
                💰 Abrir Caixa
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
                🔒 Fechar Caixa
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start cursor-pointer" 
                onClick={() => navigate("/reports")}
              >
                📊 Relatórios
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Integrações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" disabled>
                🍔 iFood
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
                📄 Fiscal
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
                ⚙️ Configurações
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
