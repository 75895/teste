import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { ChefHat, BarChart3, Users, ShoppingCart, Lock } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <img src={APP_LOGO} alt={APP_TITLE} className="h-24 w-24 mx-auto mb-4" />
          <p className="text-white text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={APP_LOGO} alt={APP_TITLE} className="h-10 w-10" />
            <h1 className="text-2xl font-bold text-white">{APP_TITLE}</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-4xl w-full space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Sistema de Gerenciamento de Restaurantes
            </h2>
            <p className="text-xl text-slate-300">
              Controle completo do seu restaurante em um único lugar
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <ChefHat className="h-8 w-8 text-amber-500 mb-2" />
                <CardTitle className="text-white">Gerenciamento de Mesas</CardTitle>
                <CardDescription>Interface mobile para garçons</CardDescription>
              </CardHeader>
              <CardContent className="text-slate-300">
                Abra mesas, lance pedidos e acompanhe o status em tempo real
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <ShoppingCart className="h-8 w-8 text-blue-500 mb-2" />
                <CardTitle className="text-white">PDV - Ponto de Venda</CardTitle>
                <CardDescription>Vendas rápidas e seguras</CardDescription>
              </CardHeader>
              <CardContent className="text-slate-300">
                Registre vendas com múltiplos meios de pagamento
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <BarChart3 className="h-8 w-8 text-green-500 mb-2" />
                <CardTitle className="text-white">Relatórios e Análises</CardTitle>
                <CardDescription>Dados em tempo real</CardDescription>
              </CardHeader>
              <CardContent className="text-slate-300">
                Acompanhe vendas, estoque e finanças com relatórios detalhados
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <Users className="h-8 w-8 text-purple-500 mb-2" />
                <CardTitle className="text-white">Controle de Acesso</CardTitle>
                <CardDescription>Perfis e permissões</CardDescription>
              </CardHeader>
              <CardContent className="text-slate-300">
                Admin, gerente, operador e garçom com permissões específicas
              </CardContent>
            </Card>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <Button
              size="lg"
              onClick={() => (window.location.href = getLoginUrl())}
              className="bg-amber-600 hover:bg-amber-700 text-white px-8"
            >
              <Lock className="h-4 w-4 mr-2" />
              Fazer Login
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-slate-400 text-sm">
          <p>&copy; 2024 Silvess. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
