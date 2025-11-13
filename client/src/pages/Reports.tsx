import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { BarChart3, Download, Filter, TrendingUp, Calendar } from "lucide-react";
import { useEffect, useState } from "react";

interface ReportData {
  period: "today" | "week" | "month" | "custom";
  startDate: string;
  endDate: string;
}

export default function Reports() {
  const { user } = useAuth();
  const [restaurantId, setRestaurantId] = useState<number | null>(null);
  const [reportData, setReportData] = useState<ReportData>({
    period: "today",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
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

  const handlePeriodChange = (period: "today" | "week" | "month" | "custom") => {
    const today = new Date();
    let startDate = today;

    switch (period) {
      case "today":
        startDate = today;
        break;
      case "week":
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    setReportData({
      period,
      startDate: startDate.toISOString().split("T")[0],
      endDate: today.toISOString().split("T")[0],
    });
  };

  const calculateMetrics = () => {
    if (!ordersQuery.data) return null;

    const orders = ordersQuery.data;
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
    const totalOrders = orders.length;
    const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const completedOrders = orders.filter((o) => o.status === "completed").length;
    const preparingOrders = orders.filter((o) => o.status === "preparing").length;
    const cancelledOrders = orders.filter((o) => o.status === "cancelled").length;

    return {
      totalRevenue,
      totalOrders,
      averageTicket,
      completedOrders,
      preparingOrders,
      cancelledOrders,
      completionRate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0,
    };
  };

  const metrics = calculateMetrics();

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
              <CardDescription>Apenas administradores podem acessar relatórios</CardDescription>
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
              <BarChart3 className="h-8 w-8" />
              Relatórios
            </h1>
            <p className="text-muted-foreground">Análise detalhada de vendas e operações</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Período</Label>
                <Select value={reportData.period} onValueChange={(value: any) => handlePeriodChange(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Hoje</SelectItem>
                    <SelectItem value="week">Últimos 7 dias</SelectItem>
                    <SelectItem value="month">Últimos 30 dias</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Data Inicial</Label>
                <Input
                  type="date"
                  value={reportData.startDate}
                  onChange={(e) =>
                    setReportData({ ...reportData, startDate: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Data Final</Label>
                <Input
                  type="date"
                  value={reportData.endDate}
                  onChange={(e) =>
                    setReportData({ ...reportData, endDate: e.target.value })
                  }
                />
              </div>

              <div className="flex items-end">
                <Button className="w-full">Aplicar Filtros</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        {metrics && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-amber-700">Receita Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-900">R$ {metrics.totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">Período selecionado</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">Total de Pedidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900">{metrics.totalOrders}</div>
                <p className="text-xs text-muted-foreground mt-1">Pedidos processados</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-700">Ticket Médio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-900">R$ {metrics.averageTicket.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">Por pedido</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-purple-700">Taxa de Conclusão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-900">{metrics.completionRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground mt-1">{metrics.completedOrders} de {metrics.totalOrders}</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-orange-700">Em Preparação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-900">{metrics.preparingOrders}</div>
                <p className="text-xs text-muted-foreground mt-1">Pedidos em andamento</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-red-700">Cancelados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-900">{metrics.cancelledOrders}</div>
                <p className="text-xs text-muted-foreground mt-1">Pedidos cancelados</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Detailed Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Detalhamento de Pedidos</CardTitle>
            <CardDescription>Lista completa de pedidos no período selecionado</CardDescription>
          </CardHeader>
          <CardContent>
            {ordersQuery.data && ordersQuery.data.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold">Pedido</th>
                      <th className="text-left py-3 px-4 font-semibold">Data</th>
                      <th className="text-left py-3 px-4 font-semibold">Tipo</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                      <th className="text-right py-3 px-4 font-semibold">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordersQuery.data.map((order) => (
                      <tr key={order.id} className="border-b border-border hover:bg-accent transition-colors">
                        <td className="py-3 px-4 font-medium">{order.orderNumber}</td>
                        <td className="py-3 px-4">
                          {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="py-3 px-4 capitalize">{order.type}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              order.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : order.status === "preparing"
                                ? "bg-yellow-100 text-yellow-800"
                                : order.status === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {order.status === "completed"
                              ? "Concluído"
                              : order.status === "preparing"
                              ? "Preparando"
                              : order.status === "cancelled"
                              ? "Cancelado"
                              : "Pendente"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold">
                          R$ {Number(order.total).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground">Nenhum dado disponível para o período selecionado</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Resumo Financeiro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-muted-foreground">Receita Bruta</span>
                <span className="font-semibold">R$ {metrics?.totalRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-muted-foreground">Quantidade de Pedidos</span>
                <span className="font-semibold">{metrics?.totalOrders}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-muted-foreground">Ticket Médio</span>
                <span className="font-semibold">R$ {metrics?.averageTicket.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-muted-foreground font-semibold">Período</span>
                <span className="font-semibold">{reportData.startDate} até {reportData.endDate}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status dos Pedidos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-muted-foreground">✅ Concluídos</span>
                <span className="font-semibold text-green-600">{metrics?.completedOrders}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-muted-foreground">⏳ Em Preparação</span>
                <span className="font-semibold text-orange-600">{metrics?.preparingOrders}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-muted-foreground">❌ Cancelados</span>
                <span className="font-semibold text-red-600">{metrics?.cancelledOrders}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-muted-foreground font-semibold">Total</span>
                <span className="font-semibold">{metrics?.totalOrders}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
